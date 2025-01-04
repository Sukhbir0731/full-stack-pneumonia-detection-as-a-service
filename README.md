# Pneumonia Detection Web Application
A full-stack web application that detects pneumonia from chest X-ray images using deep learning.

## Features
- Pneumonia detection from X-ray images
- Separate interfaces for doctors and patients
- GradCAM++ visualization for affected regions (for pneumonia cases)
- Patient records management
- Secure doctor authentication

## Dataset
The model was trained on the [Chest X-Ray Images (Pneumonia)](https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia) dataset from Kaggle, which includes:
- 5,863 X-Ray images (JPEG)
- 2 categories: NORMAL and PNEUMONIA (Bacterial and Viral)
- Chest X-ray images (anterior-posterior) of pediatric patients
- Dataset organized into train, test, and validation sets

## Technologies
- Frontend: React.js, Bootstrap, Axios
- Backend: Flask, MongoDB
- ML: TensorFlow, OpenCV, MobileNetV2
- Database: MongoDB

## Setup and Installation
1. Clone the repository
2. Set up frontend:
   ```bash
   cd client
   npm install
   npm start
