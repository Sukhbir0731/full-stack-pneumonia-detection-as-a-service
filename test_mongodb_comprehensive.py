# test_mongodb_comprehensive.py
from pymongo import MongoClient
from datetime import datetime
import json
from bson import json_util
from pprint import pprint

class MongoDBTester:
    def __init__(self):
        self.client = MongoClient('localhost', 27017)
        self.db = self.client.pneumonia_detection
        self.collection = self.db.patients

    def insert_test_data(self):
        test_docs = [
            {
                "doctor_name": "Dr. Smith",
                "patient_info": {
                    "name": "John Doe",
                    "age": 35,
                    "gender": "male"
                },
                "timestamp": datetime.now()
            },
            {
                "doctor_name": "Dr. Johnson",
                "patient_info": {
                    "name": "Jane Smith",
                    "age": 28,
                    "gender": "female"
                },
                "timestamp": datetime.now()
            }
        ]
        
        result = self.collection.insert_many(test_docs)
        print(f"Inserted {len(result.inserted_ids)} documents")
        return result.inserted_ids

    def query_data(self):
        print("\nAll patients:")
        for doc in self.collection.find():
            pprint(doc)

    def update_data(self, doc_id):
        result = self.collection.update_one(
            {"_id": doc_id},
            {"$set": {"patient_info.age": 36}}
        )
        print(f"\nUpdated {result.modified_count} document")

    def delete_data(self, doc_ids):
        result = self.collection.delete_many({"_id": {"$in": doc_ids}})
        print(f"\nDeleted {result.deleted_count} documents")

    def run_tests(self):
        try:
            print("Starting MongoDB tests...")
            
            # Clear existing test data
            self.collection.delete_many({})
            
            # Insert test data
            doc_ids = self.insert_test_data()
            
            # Query data
            self.query_data()
            
            # Update one document
            self.update_data(doc_ids[0])
            
            # Query again to see update
            print("\nAfter update:")
            self.query_data()
            
            # Clean up
            cleanup = input("\nDo you want to remove test documents? (y/n): ")
            if cleanup.lower() == 'y':
                self.delete_data(doc_ids)
                
            print("\nTests completed successfully!")
            
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            self.client.close()

if __name__ == "__main__":
    tester = MongoDBTester()
    tester.run_tests()