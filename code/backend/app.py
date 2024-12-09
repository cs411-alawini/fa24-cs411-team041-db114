from flask import Flask, request, jsonify
from flask_cors import CORS
from database import createEngine
from sqlalchemy import text
import uuid
from collections import defaultdict
from datetime import datetime
import random
import string
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

def generate_user_id():
    """generate a random string as UserID (length = 40)"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=40))

def generate_job_id():
    """generate a random string as JobID (length = 200)"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=200))

app = Flask(__name__)
CORS(app)

jobs_data = [
    {"id": 1, "title": "Software Engineer", "company": "Google", "location": "Mountain View"},
    {"id": 2, "title": "Data Scientist", "company": "Amazon", "location": "Seattle"},
]

favorite_jobs = []
user_submitted_jobs = []

@app.route('/api/jobs/<user_id>', methods=['GET'])
def get_jobs(user_id):
    job_title = request.args.get('jobTitle', default='', type=str)
    company_name = request.args.get('companyName', default='', type=str)
    sponsored = request.args.get('sponsored', default='', type=str)

    engine = createEngine()

    query = """
        SELECT J.*, 
               CASE WHEN F.UserID IS NOT NULL THEN TRUE ELSE FALSE END AS isFavorite
        FROM Job J
        LEFT JOIN Favorite F ON F.JobID = J.JobID AND F.UserID = :user_id
        WHERE 1=1
    """
    
    if job_title:
        query += f" AND J.JobTitle LIKE :job_title"
    if company_name:
        query += f" AND J.CompanyName LIKE :company_name"
    if sponsored:
        query += f" AND J.Sponsored = :sponsored"
    
    query += ' AND J.ApprovalStatus = TRUE LIMIT 50'

    with engine.connect() as connection:
        result = connection.execute(text(query), {
            "job_title": f"%{job_title}%",
            "company_name": f"%{company_name}%",
            "sponsored": sponsored,
            "user_id": user_id
        })
        jobs = [dict(row._mapping) for row in result]
        
    return jsonify(jobs)

@app.route('/api/FavoriteJob/<user_id>', methods=['GET'])
def getFavoriteJob(user_id):
    engine = createEngine()

    query = """
        SELECT J.*, 
               CASE WHEN F.UserID IS NOT NULL THEN TRUE ELSE FALSE END AS isFavorite
        FROM Job J
        INNER JOIN Favorite F ON F.JobID = J.JobID AND F.UserID = :user_id
        WHERE J.ApprovalStatus = TRUE LIMIT 50
    """
    

    with engine.connect() as connection:
        result = connection.execute(text(query), {
            "user_id": user_id
        })
        jobs = [dict(row._mapping) for row in result]
        
    return jsonify(jobs)


@app.route('/api/recommendations/<user_id>', methods=['GET'])
def getRecommendeddJobs(user_id):
    engine = createEngine()

    query = """
        SELECT J.*, 
               CASE WHEN F.UserID IS NOT NULL THEN TRUE ELSE FALSE END AS isFavorite
        FROM Job J
        LEFT JOIN Favorite F ON F.JobID = J.JobID AND F.UserID = :user_id
        WHERE J.ApprovalStatus = TRUE
    """
    
    with engine.connect() as connection:
        result = connection.execute(text(query), {"user_id": user_id})
        jobs = [dict(row._mapping) for row in result]
    
    if not jobs:
        return jsonify([])
    
    job_data = pd.DataFrame(jobs)

    favorite_jobs = job_data[job_data['isFavorite'] == True]
    favorite_job_ids = favorite_jobs['JobID'].tolist()
    non_favorite_jobs = job_data[~job_data['JobID'].isin(favorite_job_ids)]


    tfidf_vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf_vectorizer.fit_transform(non_favorite_jobs['JobTitle'])

    user_vector = tfidf_vectorizer.transform(favorite_jobs['JobTitle'])

    similarity_scores = cosine_similarity(tfidf_matrix,user_vector)
    similarity_scores = similarity_scores.sum(axis=0)
    top_3_indices = pd.Series(similarity_scores).nlargest(3).index
    
    recommended_jobs = non_favorite_jobs.iloc[top_3_indices].to_dict(orient='records')
    return recommended_jobs


@app.route('/api/updateFavoriteStatus', methods=['POST'])
def update_favorite_job():
    data = request.get_json()
    user_id = data.get('user_id')
    job_id = data.get('job_id')
    isf = data.get('isf')
    print(isf)
    if isf == 0:
        query = text("""
            INSERT INTO Favorite (UserID, JobID)
            VALUES (:user_id, :job_id)
        """)
    else:
        query = text("""
            DELETE FROM Favorite WHERE JobId = :job_id AND UserID = :user_id
        """)
    engine = createEngine()
    with engine.connect() as connection:
        connection.execute(query, {'user_id':user_id,'job_id':job_id})
        connection.commit()
        return jsonify({"success": True}), 201


# @app.route('/api/jobs/submit', methods=['POST'])
# def submit_job():
#     new_job = request.json
#     cname = new_job['CompanyName']
#     companyquery = f"select CompanyName from Company where CompanyName = '{cname}'"
#     new_job['JobID'] = str(uuid.uuid4())

#     columns = ', '.join(new_job.keys())  # keys will be the column names
#     values = ', '.join([f":{key}" for key in new_job.keys()])  # placeholders for SQL query
#     # Define the SQL query with placeholders
#     query = text(f"""
#         INSERT INTO Job ({columns})
#         VALUES ({values})
#     """)
#     print(query)
#     engine = createEngine()
#     with engine.connect() as connection:
#         result = connection.execute(text(companyquery))
#         if result.rowcount == 0:
#             return jsonify({"success":False,"error":'Company not found'}), 201
#         try:
#             connection.execute(query, new_job)  # Insert job data
#             connection.commit()
#             return jsonify({"success": True}), 201  # Successfully created
#         except Exception as e:
#             return jsonify({"success": False, "error": str(e)}), 500  # Internal server error

# @app.route('/api/jobs/<job_id>', methods=['DELETE'])
# def del_job(job_id):
#     try:
#         # Ensure the job_id is a valid UUID string
#         uuid_obj = uuid.UUID(job_id)  # This will raise an exception if invalid
#     except ValueError:
#         return jsonify({"error": "Invalid UUID format"}), 400
#     # Define the SQL query to delete the job by UUID
#     query = text("DELETE FROM Job WHERE JobId = :job_id")
#     # Execute the query
#     engine = createEngine()
#     with engine.connect() as connection:
#         try:
#             result = connection.execute(query, {"job_id": job_id})
#             connection.commit()
#             if result.rowcount > 0:
#                 return jsonify({"message": f"Job with ID {job_id} has been deleted."}), 200
#             else:
#                 return jsonify({"error": "Job not found"}), 404
#         except Exception as e:
#             return jsonify({"error": f"Failed to delete job: {str(e)}"}), 500

# @app.route('/api/jobs/<job_id>', methods=['PUT'])
# def update_job(job_id):
#     data = request.get_json()
#     job_id= data['JobID']
#     # Define the SQL query to update the job
#     query = text("""
#         UPDATE Job
#         SET JobTitle = :job_title,
#             CompanyName = :company_name,
#             Sponsored = :sponsored
#         WHERE JobID = :job_id
#     """)

#     # Ensure to get values from the request JSON, with fallbacks to existing values
#     job_title = data.get('jobTitle', None)
#     company_name = data.get('companyName', None)
#     sponsored = data.get('sponsored', None)
#     print(job_id)
#     # Prepare a dictionary with values to be updated
#     params = {
#         'job_title': job_title,
#         'company_name': company_name,
#         'sponsored': sponsored,
#         'job_id': job_id
#     }

#     engine = createEngine()
#     with engine.connect() as connection:
#         # Execute the update query
#         result = connection.execute(query, params)
#         connection.commit()
#         # Check if the job was found and updated
#         if result.rowcount == 0:
#             return jsonify({'message': 'Job not found'}), 404

#     return jsonify({'message': 'Job updated successfully'}), 200

@app.route('/api/job-stats', methods=['GET'])
def get_job_stats():
    try:
        engine = createEngine()
        result = {
            'salaryData': None,
            'locationData': None,
            'jobTypeData': None,
            'ratingData': None
        }
        
        with engine.connect() as connection:
            # Call stored procedure for salary and location stats
            try:
                print("Executing stored procedure...")
                results = connection.execute(text("CALL GetSalaryAndLocationStats()"))
                
                # First result set: Salary data
                salary_data = {
                    'labels': [],
                    'datasets': [{
                        'label': 'Average Salary',
                        'data': [],
                        'backgroundColor': 'rgba(53, 162, 235, 0.5)',
                    }]
                }
                
                salary_results = results.fetchall()
                print(f"Salary results: {salary_results}")
                
                for row in salary_results:
                    salary_data['labels'].append(str(row.job_title))
                    salary_data['datasets'][0]['data'].append(float(row.avg_salary))
                result['salaryData'] = salary_data

                # Second result set: Location data
                # Execute the location query separately
                location_query = """
                    SELECT 
                        CompanyName as location, 
                        COUNT(*) as job_count
                    FROM Job
                    WHERE CompanyName IS NOT NULL 
                    AND CompanyName != ''
                    GROUP BY CompanyName
                    ORDER BY job_count DESC
                    LIMIT 10
                """
                location_results = connection.execute(text(location_query)).fetchall()
                print(f"Location results: {location_results}")
                
                location_data = {
                    'labels': [],
                    'datasets': [{
                        'label': 'Number of Jobs by Company',
                        'data': [],
                        'backgroundColor': 'rgba(75, 192, 192, 0.5)',
                    }]
                }
                
                for row in location_results:
                    location_data['labels'].append(str(row.location))
                    location_data['datasets'][0]['data'].append(row.job_count)
                result['locationData'] = location_data
                
            except Exception as e:
                print(f"Error in stored procedure: {str(e)}")
                print(f"Full error details: {e.__class__.__name__}")

            with engine.connect() as connection:
                trans = connection.begin()
                try:
                    # Job type distribution (Uses: SET Operation, GROUP BY)
                    jobtype_query = """
                        SELECT job_title, COUNT(*) as job_count
                        FROM (
                            SELECT JobTitle as job_title FROM Job WHERE Sponsored = TRUE
                            UNION ALL
                            SELECT JobTitle FROM Job WHERE Sponsored = FALSE
                        ) combined_jobs
                        GROUP BY job_title
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
                            ],
                        }]
                    }
                    for row in jobtype_result:
                        jobtype_data['labels'].append(row.job_title)
                        jobtype_data['datasets'][0]['data'].append(row.job_count)
                    result['jobTypeData'] = jobtype_data

                    # Rating distribution (Uses: JOIN, GROUP BY, Aggregation)
                    rating_query = """
                        SELECT 
                            j.Rating,
                            COUNT(*) as job_count,
                            AVG(CAST(j.Salary AS DECIMAL)) as avg_salary
                        FROM Job j
                        JOIN Company c ON j.CompanyName = c.CompanyName
                        WHERE j.Rating IS NOT NULL 
                        AND j.Rating != ''
                        GROUP BY j.Rating
                        ORDER BY j.Rating DESC
                    """
                    rating_result = connection.execute(text(rating_query))
                    rating_data = {
                        'labels': [],
                        'datasets': [{
                            'label': 'Number of Jobs',
                            'data': [],
                            'backgroundColor': 'rgba(153, 102, 255, 0.5)',
                        }]
                    }
                    for row in rating_result:
                        rating_data['labels'].append(f"Rating {row.Rating}")
                        rating_data['datasets'][0]['data'].append(row.job_count)
                    result['ratingData'] = rating_data

                    trans.commit()
                except Exception as e:
                    trans.rollback()
                    print(f"Error in transaction: {str(e)}")

        return jsonify(result)

    except Exception as e:
        print(f"Error in get_job_stats: {str(e)}")
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    isAdmin = data.get('isAdmin')

    query = text("""
        SELECT * FROM User 
        WHERE UserName = :UserName AND Password = :Password AND is_Admin = :is_Admin
    """)

    engine = createEngine()
    with engine.connect() as connection:
        result = connection.execute(query, {
            "UserName": username,
            "Password": password,
            "is_Admin": isAdmin
        }).fetchone()

    if result:
        print('\n\n current user_id: ' + result[0] + '\n\n')
        return jsonify({"success": True, "user_id": result[0]}), 200
    else:
        return jsonify({"success": False, "error": "Invalid credentials"}), 401


@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    age = data.get('age')
    location = data.get('location')
    phone_number = data.get('phoneNumber')
    email_address = data.get('emailAddress')

    if not all([username, password, first_name, last_name, age, location, phone_number, email_address]):
        return jsonify({"success": False, "error": "All fields are required"}), 400

    user_id = generate_user_id()

    query = text("""
        INSERT INTO User (UserName, UserID, Password, is_Admin, FirstName, LastName, Age, Location, PhoneNumber, EmailAddress)
        VALUES (:username, :user_id, :password, FALSE, :first_name, :last_name, :age, :location, :phone_number, :email_address)
    """)

    engine = createEngine()
    with engine.connect() as connection:
        connection.execute(query, {
            "username": username,
            "user_id": user_id,
            "password": password,
            "first_name": first_name,
            "last_name": last_name,
            "age": age,
            "location": location,
            "phone_number": phone_number,
            "email_address": email_address
        })
        connection.commit()

    return jsonify({"success": True, "message": "User registered successfully"}), 201


@app.route('/api/admin/pending-jobs', methods=['GET'])
def get_pending_jobs():
    query = text("""
        SELECT J.JobID, J.JobTitle, J.JobSnippet, J.JobLink, J.Salary, J.CompanyName, J.Rating, UH.AdminComment
        FROM Job J
        LEFT JOIN UploadedHistory UH ON J.JobID = UH.JobID
        WHERE J.ApprovalStatus = FALSE AND (UH.AdminComment IS NULL OR UH.AdminComment != 'Reject')
    """)
    engine = createEngine()
    with engine.connect() as connection:
        result = connection.execute(query)
        jobs = [dict(row._mapping) for row in result]
    return jsonify(jobs)

@app.route('/api/admin/approve-job/<job_id>', methods=['POST'])
def approve_job(job_id):
    action = request.json.get('action')  # "accept" or "reject"

    engine = createEngine()
    with engine.connect() as connection:
        trans = connection.begin()
        try:
            if action == "accept":
                connection.execute(
                    text("""
                        UPDATE Job
                        SET ApprovalStatus = TRUE
                        WHERE JobID = :job_id
                    """),
                    {"job_id": job_id}
                )
                connection.execute(
                    text("""
                        UPDATE UploadedHistory
                        SET AdminComment = 'Accept'
                        WHERE JobID = :job_id
                    """),
                    {"job_id": job_id}
                )
            elif action == "reject":
                connection.execute(
                    text("""
                        UPDATE UploadedHistory
                        SET AdminComment = 'Reject'
                        WHERE JobID = :job_id
                    """),
                    {"job_id": job_id}
                )
            trans.commit()
        except Exception as e:
            trans.rollback()
            return jsonify({"success": False, "error": str(e)}), 500

    return jsonify({"success": True}), 200


@app.route('/api/upload-job', methods=['POST'])
def upload_job():
    data = request.json
    user_id = data.get('userID')
    job_title = data.get('jobTitle')
    job_snippet = data.get('jobSnippet')
    job_link = data.get('jobLink')
    sponsored = data.get('sponsored')
    salary = data.get('salary')
    rating = data.get('rating')
    company_name = data.get('companyName')

    if not all([user_id, job_title, job_snippet, job_link, company_name]):
        return jsonify({"success": False, "error": "Required fields are missing"}), 400

    job_id = generate_job_id()

    insert_job_query = text("""
        INSERT INTO Job (JobID, JobTitle, JobSnippet, JobLink, Sponsored, Salary, Rating, CompanyName, ApprovalStatus)
        VALUES (:job_id, :job_title, :job_snippet, :job_link, :sponsored, :salary, :rating, :company_name, FALSE)
    """)
    insert_history_query = text("""
        INSERT INTO UploadedHistory (UploadID, UserID, JobID, AdminComment)
        VALUES (:upload_id, :user_id, :job_id, '')
    """)

    engine = createEngine()
    with engine.connect() as connection:
        connection.execute(insert_job_query, {
            "job_id": job_id,
            "job_title": job_title,
            "job_snippet": job_snippet,
            "job_link": job_link,
            "sponsored": sponsored,
            "salary": salary,
            "rating": rating,
            "company_name": company_name
        })
        connection.execute(insert_history_query, {
            "upload_id": generate_user_id(), # they are the same
            "user_id": user_id,
            "job_id": job_id
        })
        connection.commit()

    return jsonify({"success": True, "message": "Job uploaded successfully"})


@app.route('/api/upload-history/<user_id>', methods=['GET'])
def get_upload_history(user_id):
    query = text("""
        SELECT J.JobID, J.JobTitle, J.JobSnippet, J.JobLink, J.Salary, J.CompanyName, UH.AdminComment
        FROM UploadedHistory UH
        JOIN Job J ON UH.JobID = J.JobID
        WHERE UH.UserID = :user_id
    """)
    engine = createEngine()
    with engine.connect() as connection:
        results = connection.execute(query, {"user_id": user_id}).fetchall()
        jobs = [{
                "JobID": row[0],
                "JobTitle": row[1],
                "JobSnippet": row[2],
                "JobLink": row[3],
                "Salary": row[4],
                "CompanyName": row[5],
                "AdminComment": row[6]
            } for row in results]
    return jsonify(jobs)

@app.route('/api/update-job', methods=['POST'])
def update_job():
    data = request.json
    print(data)
    job_id = data.get('JobID')
    job_title = data.get('jobTitle')
    job_snippet = data.get('jobSnippet')
    job_link = data.get('jobLink')
    sponsored = data.get('sponsored')
    salary = data.get('salary')
    rating = data.get('rating')
    company_name = data.get('companyName')

    if not job_id:
        return jsonify({"success": False, "error": "Job ID is required"}), 400

    query = text("""
        UPDATE Job
        SET JobTitle = :job_title,
            JobSnippet = :job_snippet,
            JobLink = :job_link,
            Sponsored = :sponsored,
            Salary = :salary,
            Rating = :rating,
            CompanyName = :company_name,
            ApprovalStatus = FALSE
        WHERE JobID = :job_id
    """)

    engine = createEngine()
    with engine.connect() as connection:
        connection.execute(query, {
            "job_id": job_id,
            "job_title": job_title,
            "job_snippet": job_snippet,
            "job_link": job_link,
            "sponsored": sponsored,
            "salary": salary,
            "rating": rating,
            "company_name": company_name
        })
        connection.commit()

    return jsonify({"success": True, "message": "Job updated successfully"})

def create_stored_procedure():
    engine = createEngine()
    with engine.connect() as connection:
        try:
            # Drop existing procedure if it exists
            connection.execute(text("DROP PROCEDURE IF EXISTS GetSalaryAndLocationStats"))
            
            # Create new procedure with advanced queries
            procedure_sql = """
            CREATE PROCEDURE GetSalaryAndLocationStats()
            BEGIN
                -- First result: Salary stats (Uses: JOIN, GROUP BY, Aggregation)
                SELECT 
                    j.JobTitle as job_title, 
                    AVG(CAST(j.Salary AS DECIMAL)) as avg_salary
                FROM Job j
                JOIN Company c ON j.CompanyName = c.CompanyName
                WHERE j.Salary IS NOT NULL 
                AND j.Salary != ''
                GROUP BY j.JobTitle
                ORDER BY avg_salary DESC
                LIMIT 10;

                -- Second result: Location stats (Uses: Subquery, GROUP BY, Aggregation)
                SELECT 
                    CompanyName as location, 
                    COUNT(*) as job_count
                FROM Job
                WHERE CompanyName IN (
                    SELECT CompanyName
                    FROM Job
                    GROUP BY CompanyName
                    HAVING COUNT(*) > 1
                )
                GROUP BY CompanyName
                ORDER BY job_count DESC
                LIMIT 10;
            END
            """
            connection.execute(text(procedure_sql))
            print("Stored procedure created successfully")
        except Exception as e:
            print(f"Error creating stored procedure: {str(e)}")




@app.route('/api/reviews/<job_id>', methods=['GET'])
def get_reviews(job_id):
    query = text("""
        SELECT ReviewID, JobID, Content, Rating
        FROM Review
        WHERE JobID = :job_id
        ORDER BY ReviewID DESC
    """)
    
    engine = createEngine()
    with engine.connect() as connection:
        try:
            result = connection.execute(query, {"job_id": job_id})
            reviews = [dict(row._mapping) for row in result]
            return jsonify(reviews)
        except Exception as e:
            print(f"Error getting reviews: {str(e)}")
            return jsonify({"error": str(e)}), 500

@app.route('/api/reviews', methods=['POST'])
def add_review():
    data = request.json
    job_id = data.get('jobId')
    content = data.get('content')
    rating = data.get('rating')
    
    if not all([job_id, content, rating]):
        return jsonify({"success": False, "error": "Missing required fields"}), 400
        
    review_id = generate_user_id()  # Reusing the existing ID generator
    
    query = text("""
        INSERT INTO Review (ReviewID, JobID, Content, Rating)
        VALUES (:review_id, :job_id, :content, :rating)
    """)
    
    engine = createEngine()
    with engine.connect() as connection:
        try:
            connection.execute(query, {
                "review_id": review_id,
                "job_id": job_id,
                "content": content,
                "rating": rating
            })
            connection.commit()
            return jsonify({"success": True, "message": "Review added successfully"}), 201
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    create_stored_procedure()
    app.run(debug=True) 