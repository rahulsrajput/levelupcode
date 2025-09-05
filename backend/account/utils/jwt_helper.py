import jwt
import datetime
from django.conf import settings
import uuid

def generate_access_token(user):
    
    payload = {
        "user_id":user.id,
        "email": user.email,
        "role": user.role,
        "exp": datetime.datetime.utcnow() + settings.JWT_ACCESS_TOKEN_LIFETIME,
        "iat": datetime.datetime.utcnow(),
        "type": "access_token"
    }
    
    # print(payload)
    
    token = jwt.encode(
        payload=payload, 
        key=settings.JWT_SECRET_KEY, 
        algorithm=settings.JWT_ALGORITHM
    )
    
    return token



def generate_refresh_token(user):
    
    """ 
        Generate a refresh token and a unique identifier (jti) 
    """

    jti = str(uuid.uuid4())
    
    payload = {
        "user_id":user.id,
        "email": user.email,
        "role": user.role,
        "exp": datetime.datetime.utcnow() + settings.JWT_REFRESH_TOKEN_LIFETIME,
        "iat": datetime.datetime.utcnow(),
        "type": "refresh_token",
        "jti": jti 
    }
    
    token = jwt.encode(
        payload=payload, 
        key=settings.JWT_SECRET_KEY, 
        algorithm=settings.JWT_ALGORITHM
    )
    
    return token, jti  # Return the refresh token and its unique identifier



def decode_token(token):
    
    try:
        payload = jwt.decode(
            jwt=token,
            key=settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        return payload
    
    except jwt.ExpiredSignatureError:
    
        raise jwt.InvalidTokenError("token has expired")
    
    except jwt.InvalidTokenError:
    
        raise jwt.InvalidTokenError("invalid token")