import os
from dotenv import load_dotenv
from datetime import timedelta
from urllib.parse import quote_plus

load_dotenv()  # load .env

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    
    db_user = os.getenv("MYSQL_USER", "spsm_user")
    db_pass = quote_plus(os.getenv("MYSQL_PASSWORD", "spsm_password"))
    db_host = os.getenv("MYSQL_HOST", "db")
    db_name = os.getenv("MYSQL_DATABASE", "stress_db")
    
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", 
        f"mysql+pymysql://{db_user}:{db_pass}@{db_host}/{db_name}"
    )
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)
