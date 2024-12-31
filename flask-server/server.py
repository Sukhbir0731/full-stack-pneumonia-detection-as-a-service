from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import os
import uuid
from datetime import datetime 
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from pymongo import MongoClient
import traceback

app = Flask(__name__)
CORS(app)

# Configure upload and output directories
UPLOAD_FOLDER = 'temp'
OUTPUT_FOLDER = 'output'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

try:
    mongo_client = MongoClient('mongodb://localhost:27017/')
    db = mongo_client.pneumonia_detection
    patients_collection = db.patients
    # Test connection
    db.command('ping')
    print("MongoDB connected successfully!")
except Exception as e:
    print(f"MongoDB connection error: {str(e)}")
    print(traceback.format_exc())
    mongo_client = None
    db = None
    patients_collection = None

# Load model
MODEL_PATH = 'C:/Users/sukhb/OneDrive/Desktop/pneumonia-detection/flask-server/MobileNetV2_final_dataset.h5'
try:
    model = load_model(MODEL_PATH)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {str(e)}")
    model = None

def generate_grad_cam_plus_plus(model, img_array, layer_name):
    """Generate Grad-CAM++ visualization"""
    try:
        grad_model = tf.keras.models.Model(
            [model.inputs],
            [model.get_layer(layer_name).output, model.output]
        )
        
        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array)
            class_idx = tf.argmax(predictions[0])
            loss = predictions[:, class_idx]

        grads = tape.gradient(loss, conv_outputs)
        grads_squared = tf.square(grads)
        grads_cubed = tf.pow(grads, 3)
        
        alpha_numer = grads_squared
        alpha_denom = 2 * grads_squared + tf.reduce_sum(conv_outputs * grads_cubed, axis=(0, 1, 2))
        alpha_denom = tf.where(alpha_denom != 0, alpha_denom, tf.ones_like(alpha_denom))
        alphas = alpha_numer / alpha_denom
        weights = tf.reduce_sum(alphas * tf.maximum(grads, 0), axis=(0, 1))
        
        conv_outputs = conv_outputs[0]
        heatmap = tf.reduce_sum(tf.multiply(weights, conv_outputs), axis=-1)
        
        # Convert to numpy and normalize
        heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
        return heatmap.numpy()
    except Exception as e:
        print(f"Error in GradCAM generation: {str(e)}")
        return None

def overlay_heatmap(heatmap, image, alpha=0.6):
    """Overlay heatmap on original image"""
    try:
        if heatmap is None:
            return image
            
        heatmap = cv2.resize(heatmap, (image.shape[1], image.shape[0]))
        heatmap = np.uint8(255 * heatmap)
        heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
        overlayed_image = cv2.addWeighted(image, alpha, heatmap, 1 - alpha, 0)
        return overlayed_image
    except Exception as e:
        print(f"Error in heatmap overlay: {str(e)}")
        return image

def preprocess_image(file_path):
    """Preprocess image for model prediction"""
    img = tf.keras.utils.load_img(file_path, target_size=(224, 224))
    img_array = tf.keras.utils.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    return preprocess_input(img_array), np.array(img)

# [Previous imports and setup remain the same until the predict route]

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500

        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        is_doctor = request.form.get('doctorName') is not None
        
        # Save uploaded file
        filename = f"{uuid.uuid4()}.jpg"
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        try:
            # Process image and get prediction
            img_array, original_img = preprocess_image(file_path)
            predictions = model.predict(img_array)
            
            class_idx = np.argmax(predictions[0])
            class_labels = ['Normal', 'Bacterial Pneumonia', 'Viral Pneumonia']
            predicted_class = class_labels[class_idx]
            
            # Different response for patient vs doctor
            if is_doctor:
                # Detailed result for doctors
                result = {
                    'predicted_class': predicted_class,
                    'confidence': float(predictions[0][class_idx]) * 100,
                    'class_probabilities': {
                        class_labels[i]: float(predictions[0][i]) * 100
                        for i in range(len(class_labels))
                    }
                }
                
                # Only generate heatmap for pneumonia cases (not Normal)
                if predicted_class != 'Normal':
                    try:
                        # Find the last convolutional layer
                        conv_layer = None
                        for layer in model.layers[::-1]:
                            if 'conv' in layer.name.lower():
                                conv_layer = layer.name
                                break
                        
                        if conv_layer:
                            heatmap = generate_grad_cam_plus_plus(model, img_array, conv_layer)
                            if heatmap is not None:
                                original_img_bgr = cv2.cvtColor(original_img, cv2.COLOR_RGB2BGR)
                                overlayed_img = overlay_heatmap(heatmap, original_img_bgr)
                                
                                heatmap_filename = f'heatmap_{uuid.uuid4()}.jpg'
                                heatmap_path = os.path.join(OUTPUT_FOLDER, heatmap_filename)
                                cv2.imwrite(heatmap_path, overlayed_img)
                                
                                result['heatmap_url'] = f'/api/heatmap/{heatmap_filename}'
                    except Exception as e:
                        print(f"Error generating heatmap: {str(e)}")
            else:
                # Simple result for patients
                result = {
                    'predicted_class': predicted_class
                }
            
            return jsonify({
                'success': True,
                'result': result
            })
            
        finally:
            # Clean up uploaded file
            if os.path.exists(file_path):
                os.remove(file_path)
                
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/heatmap/<filename>')
def get_heatmap(filename):
    try:
        return send_file(
            os.path.join(OUTPUT_FOLDER, filename),
            mimetype='image/jpeg'
        )
    except Exception as e:
        print(f"Error serving heatmap: {str(e)}")
        return jsonify({'error': 'Heatmap not found'}), 404

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({
        'message': 'Server is running!',
        'status': 'success'
    })

# Add this new endpoint to your server.py

@app.route('/api/save-remarks', methods=['POST'])
def save_remarks():
    try:
        if patients_collection is None:  # Changed from 'if not patients_collection'
            return jsonify({'error': 'Database not connected'}), 500

        data = request.json
        print("Received data for saving:", data)
        
        patient_record = {
            "doctor_name": data['doctorName'],
            "patient_info": data['patientInfo'],
            "diagnosis": {
                "predicted_class": data['result']['predicted_class'],
                "confidence": data['result'].get('confidence'),
                "class_probabilities": data['result'].get('class_probabilities')
            },
            "remarks": data['remarks'],
            "timestamp": datetime.now()
        }
        
        result = patients_collection.insert_one(patient_record)
        print(f"Record saved with ID: {result.inserted_id}")
        
        return jsonify({
            'success': True,
            'message': 'Remarks saved successfully',
            'record_id': str(result.inserted_id)
        })
        
    except Exception as e:
        print(f"Error saving remarks: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Add endpoint to get patient records for a doctor
@app.route('/api/doctor/patients/<doctor_name>', methods=['GET'])
def get_doctor_patients(doctor_name):
    try:
        cursor = patients_collection.find({"doctor_name": doctor_name})
        patients = list(cursor)
        
        for patient in patients:
            patient['_id'] = str(patient['_id'])
        
        print(f"Found {len(patients)} records for {doctor_name}")
        
        return jsonify({
            'success': True,
            'patients': patients
        })
        
    except Exception as e:
        print(f"Error fetching patients: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)