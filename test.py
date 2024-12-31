from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017/')
db = client.pneumonia_detection
print(db.list_collection_names())