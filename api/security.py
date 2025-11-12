import jwt, os
from dotenv import load_dotenv
load_dotenv()

SECRET = os.getenv("SECRET_KEY")

def create_token(user):
    return jwt.encode({"user": user, "exp": time.time() + 86400}, SECRET, algorithm="HS256")