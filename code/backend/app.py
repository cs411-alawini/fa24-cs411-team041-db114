from flask import Flask, request, jsonify
from flask_cors import CORS
from database import createEngine
from sqlalchemy import text
import uuid
from collections import defaultdict
from datetime import datetime

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
    job_title = request.args.get('jobTitle', default='', type=str)
    company_name = request.args.get('companyName', default='', type=str)
    sponsored = request.args.get('sponsored', default='', type=str)

    engine = createEngine()

    query = 'select * from Job WHERE 1=1'
    if job_title:
        query += f" AND JobTitle LIKE :job_title"
    if company_name:
        query += f" AND CompanyName LIKE :company_name"
    if sponsored:
        query += f" AND Sponsored = :sponsored"
    query += ' LIMIT 100'  # Add the LIMIT at the end

    with engine.connect() as connection:
        result = connection.execute(text(query),{
            "job_title": f"%{job_title}%",  # Use wildcard for partial matching
            "company_name": f"%{company_name}%",
            "sponsored": sponsored
        })
        jobs = [dict(row._mapping) for row in result]
    return jsonify(jobs)

@app.route('/api/jobs/submit', methods=['POST'])
def submit_job():
    new_job = request.json
    cname = new_job['CompanyName']
    companyquery = f"select CompanyName from Company where CompanyName = '{cname}'"
    new_job['JobID'] = str(uuid.uuid4())

    columns = ', '.join(new_job.keys())  # keys will be the column names
    values = ', '.join([f":{key}" for key in new_job.keys()])  # placeholders for SQL query
    # Define the SQL query with placeholders
    query = text(f"""
        INSERT INTO Job ({columns})
        VALUES ({values})
    """)
    print(query)
    engine = createEngine()
    with engine.connect() as connection:
        result = connection.execute(text(companyquery))
        if result.rowcount == 0:
            return jsonify({"success":False,"error":'Company not found'}), 201
        try:
            connection.execute(query, new_job)  # Insert job data
            connection.commit()
            return jsonify({"success": True}), 201  # Successfully created
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500  # Internal server error

@app.route('/api/jobs/<job_id>', methods=['DELETE'])
def del_job(job_id):
    try:
        # Ensure the job_id is a valid UUID string
        uuid_obj = uuid.UUID(job_id)  # This will raise an exception if invalid
    except ValueError:
        return jsonify({"error": "Invalid UUID format"}), 400
    # Define the SQL query to delete the job by UUID
    query = text("DELETE FROM Job WHERE JobId = :job_id")
    # Execute the query
    engine = createEngine()
    with engine.connect() as connection:
        try:
            result = connection.execute(query, {"job_id": job_id})
            connection.commit()
            if result.rowcount > 0:
                return jsonify({"message": f"Job with ID {job_id} has been deleted."}), 200
            else:
                return jsonify({"error": "Job not found"}), 404
        except Exception as e:
            return jsonify({"error": f"Failed to delete job: {str(e)}"}), 500

@app.route('/api/jobs/<job_id>', methods=['PUT'])
def update_job(job_id):
    data = request.get_json()
    job_id= data['JobID']
    # Define the SQL query to update the job
    query = text("""
        UPDATE Job
        SET JobTitle = :job_title,
            CompanyName = :company_name,
            Sponsored = :sponsored
        WHERE JobID = :job_id
    """)

    # Ensure to get values from the request JSON, with fallbacks to existing values
    job_title = data.get('jobTitle', None)
    company_name = data.get('companyName', None)
    sponsored = data.get('sponsored', None)
    print(job_id)
    # Prepare a dictionary with values to be updated
    params = {
        'job_title': job_title,
        'company_name': company_name,
        'sponsored': sponsored,
        'job_id': job_id
    }

    engine = createEngine()
    with engine.connect() as connection:
        # Execute the update query
        result = connection.execute(query, params)
        connection.commit()
        # Check if the job was found and updated
        if result.rowcount == 0:
            return jsonify({'message': 'Job not found'}), 404

    return jsonify({'message': 'Job updated successfully'}), 200

@app.route('/api/job-stats', methods=['GET'])
def get_job_stats():
    try:
        engine = createEngine()
        result = {
            'salaryData': None,
            'locationData': None,
            'jobTypeData': None
        }
        
        with engine.connect() as connection:
            # Salary distribution
            try:
                salary_query = """
                    SELECT JobTitle as job_title, AVG(CAST(Salary AS DECIMAL)) as avg_salary
                    FROM Job
                    WHERE Salary IS NOT NULL 
                    AND Salary != ''
                    AND CAST(Salary AS DECIMAL) > 0
                    GROUP BY JobTitle
                    ORDER BY avg_salary DESC
                    LIMIT 10
                """
                salary_result = connection.execute(text(salary_query))
                salary_data = {
                    'labels': [],
                    'datasets': [{
                        'label': 'Average Salary',
                        'data': [],
                        'backgroundColor': 'rgba(53, 162, 235, 0.5)',
                    }]
                }
                for row in salary_result:
                    salary_data['labels'].append(row.job_title)
                    salary_data['datasets'][0]['data'].append(float(row.avg_salary))
                result['salaryData'] = salary_data
            except Exception as e:
                print(f"Error in salary query: {str(e)}")

            # Location distribution
            try:
                location_query = """
                    SELECT CompanyName as location, COUNT(*) as job_count
                    FROM Job
                    WHERE CompanyName IS NOT NULL 
                    AND CompanyName != ''
                    GROUP BY CompanyName
                    ORDER BY job_count DESC
                    LIMIT 10
                """
                location_result = connection.execute(text(location_query))
                location_data = {
                    'labels': [],
                    'datasets': [{
                        'label': 'Number of Jobs by Company',
                        'data': [],
                        'backgroundColor': 'rgba(75, 192, 192, 0.5)',
                    }]
                }
                for row in location_result:
                    location_data['labels'].append(row.location)
                    location_data['datasets'][0]['data'].append(row.job_count)
                result['locationData'] = location_data
            except Exception as e:
                print(f"Error in location query: {str(e)}")

            # Job type distribution
            try:
                jobtype_query = """
                    SELECT JobTitle as job_title, COUNT(*) as job_count
                    FROM Job
                    WHERE JobTitle IS NOT NULL 
                    AND JobTitle != ''
                    GROUP BY JobTitle
                    ORDER BY job_count DESC
                    LIMIT 10
                """
                jobtype_result = connection.execute(text(jobtype_query))
                jobtype_data = {
                    'labels': [],
                    'datasets': [{
                        'data': [],
                        'backgroundColor': [
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(255, 206, 86, 0.5)',
                            'rgba(75, 192, 192, 0.5)',
                            'rgba(153, 102, 255, 0.5)',
                            'rgba(255, 159, 64, 0.5)',
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(255, 206, 86, 0.5)',
                            'rgba(75, 192, 192, 0.5)',
                        ],
                    }]
                }
                for row in jobtype_result:
                    jobtype_data['labels'].append(row.job_title)
                    jobtype_data['datasets'][0]['data'].append(row.job_count)
                result['jobTypeData'] = jobtype_data
            except Exception as e:
                print(f"Error in job type query: {str(e)}")

            return jsonify(result)

    except Exception as e:
        print(f"Error in get_job_stats: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 