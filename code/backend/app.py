from flask import Flask, request, jsonify
from flask_cors import CORS
from database import createEngine
from sqlalchemy import text
import uuid

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

    query = 'select * from Job LIMIT 100;'

    with engine.connect() as connection:
        result = connection.execute(text(query))
        jobs = [dict(row._mapping) for row in result]
    return jsonify(jobs)

@app.route('/api/jobs/submit', methods=['POST'])
def submit_job():
    new_job = request.json
    cname = new_job['CompanyName']
    companyquery = f'select CompanyName from Company where CompanyName = {cname}'


    columns = ', '.join(new_job.keys())  # keys will be the column names
    values = ', '.join([f":{key}" for key in new_job.keys()])  # placeholders for SQL query
    columns = columns +', JobID'
    values = values + ', '+ str(uuid.uuid4())
    # Define the SQL query with placeholders
    query = text(f"""
        INSERT INTO Job ({columns})
        VALUES ({values})
    """)
    engine = createEngine()
    with engine.connect() as connection:
        result = connection.execute(text(companyquery))
        if result.rowcount == 0:
            return jsonify({"success":False,"error":"company not found"}), 201
        connection.execute(query, **new_job)
    return jsonify({"success":False}), 201

@app.route('/api/jobs/<job_id>', methods=['DELETE'])
def del_job(job_id):
    try:
        # Ensure the job_id is a valid UUID string
        uuid_obj = uuid.UUID(job_id)  # This will raise an exception if invalid
    except ValueError:
        return jsonify({"error": "Invalid UUID format"}), 400

    # Define the SQL query to delete the job by UUID
    query = text("DELETE FROM Job WHERE id = :job_id")

    # Execute the query
    engine = createEngine()
    with engine.connect() as connection:
        try:
            result = connection.execute(query, job_id=str(uuid_obj))
            if result.rowcount > 0:
                return jsonify({"message": f"Job with ID {job_id} has been deleted."}), 200
            else:
                return jsonify({"error": "Job not found"}), 404
        except Exception as e:
            return jsonify({"error": f"Failed to delete job: {str(e)}"}), 500

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