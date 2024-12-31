# config.py
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB configuration
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "pneumonia_detection"

# Initialize MongoDB client
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
patients_collection = db.patients

# Create indexes for better query performance
patients_collection.create_index([("doctor_name", 1), ("timestamp", -1)])