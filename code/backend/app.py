from flask import Flask, request, jsonify
from flask_cors import CORS
from database import createEngine
from sqlalchemy import text

app = Flask(__name__)
CORS(app)

# Temporary data storage (will be replaced with database later)
jobs_data = [
    {"id": 1, "title": "Software Engineer", "company": "Google", "location": "Mountain View"},
    {"id": 2, "title": "Data Scientist", "company": "Amazon", "location": "Seattle"},
]

favorite_jobs = []
user_submitted_jobs = []

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    engine = createEngine()

    query = 'select * from Job'

    with engine.connect() as connection:
        result = connection.execute(text(query))
        jobs = [dict(row._mapping) for row in result]
    return jsonify(jobs)

@app.route('/api/jobs/submit', methods=['POST'])
def submit_job():
    new_job = request.json
    user_submitted_jobs.append(new_job)
    return jsonify({"message": "Job submitted for review"}), 201

@app.route('/api/favorites', methods=['GET', 'POST'])
def handle_favorites():
    if request.method == 'GET':
        return jsonify(favorite_jobs)
    
    job = request.json
    favorite_jobs.append(job)
    return jsonify({"message": "Job added to favorites"}), 201

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    # Dummy recommendations based on favorite jobs
    return jsonify([
        {"id": 3, "title": "ML Engineer", "company": "Facebook", "location": "Menlo Park"},
        {"id": 4, "title": "Frontend Developer", "company": "Microsoft", "location": "Redmond"},
    ])

if __name__ == '__main__':
    app.run(debug=True) 