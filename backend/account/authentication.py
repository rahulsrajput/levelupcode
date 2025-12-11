from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from django.contrib.auth import get_user_model
from account.utils.jwt_helper import decode_token

User = get_user_model()

class cookieJWTAuthentication(BaseAuthentication):
    """
        Custom DRF authentication class for cookie-based JWT.
        Reads the 'access' token from cookies, decodes it, and attaches the user to request.user.
        If token is missing or invalid, request.user is set to AnonymousUser.
        will be used in settings.py
    """

    """
        We are just checking access token here. if access token expired or invalid,
        will recive 403 error from DRF. and frontend will have to call refresh endpoint to get new access token.
    """

    def authenticate(self, request):
        
        token = request.COOKIES.get('access')
        
        if not token :
            # DRF will set request.user to AnonymousUser
            return None
        
        try:
            # Decode the JWT Payload
            payload = decode_token(token)

            # Fetch the user from the database
            user = User.objects.get(id = payload['user_id'])

            # Return a tuple of (user, token) to set request.user and request.auth by DRF
            return (user, token)
        
        except User.DoesNotExist:
            # If user not found, treat as unanonymous
            return None
        
        except Exception as e:
            # For any other errors (invalid token, expired, etc), treat as unanonymous
            raise exceptions.AuthenticationFailed({"jwt_payload_error": str(e)})
