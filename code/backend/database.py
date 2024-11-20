from sqlalchemy import create_engine, text
import pandas as pd
import json
import os

# load_dotenv()
# PWRD = os.getenv("PASSWORD")
# IP_ADDR= os.getenv("IP_ADDRESS")

def createEngine():
    db_user = "root"
    db_password = "123456"
    db_name = "db"
    public_ip = "34.170.215.246"

    engine = create_engine(f"mysql+pymysql://{db_user}:{db_password}@{public_ip}/{db_name}")
    return engine

def t():
    engine = createEngine()

    query = 'select JobID from Job'

    with engine.connect() as connection:
        result = connection.execute(text(query))
        print(result)
        # Adjust this part to match the query result
        for row in result:
            print(row)
        
        return data
print(t())