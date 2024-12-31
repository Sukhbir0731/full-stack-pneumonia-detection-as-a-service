db.patients.insertOne({
    "doctor_name": "Test Doctor",
    "patient_info": {
        "name": "Test Patient",
        "age": 30,
        "gender": "male"
    },
    "timestamp": new Date()
})
