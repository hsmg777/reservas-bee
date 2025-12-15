import os

class Config:
    SECRET_KEY = os.getenv("APP_SECRET", "change_me")

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv("JWT_SECRET", SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_MIN", "60")) * 60
    JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv("JWT_REFRESH_DAYS", "7")) * 24 * 60 * 60

    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True").lower() in ("true", "1", "yes")
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER", MAIL_USERNAME)
    
    PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "http://localhost:8080")
