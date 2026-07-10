import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Fallback to local sqlite if not specified
    DATABASE_URL = "sqlite:///./sql_app.db"

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "test_id")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "test_secret")

# JWT authentication settings
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "7d5bc289ff70e30b14c330df30b42d76587c4f4b23d9241517454f0c609df073")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours
