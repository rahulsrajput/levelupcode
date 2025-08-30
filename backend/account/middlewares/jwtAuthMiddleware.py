import jwt
from account.utils.jwt_helper import decode_access_token
from django.http import JsonResponse
from rest_framework import status
from django.utils.deprecation import MiddlewareMixin

class JWTAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        """
        Middleware runs before view is called.
        It checks for a valid access token in cookies.
        """
        
        """ Skip authentication for login, signup, refresh endpoints """
        exempt_paths = [
            '/api/v1/auth/register/',
            '/api/v1/auth/refresh/',
            '/api/v1/auth/login/',
            '/api/v1/auth/logout/',
            '/api/v1/auth/verify-email/',
            '/api/v1/auth/forgot-password/',
            '/api/v1/auth/reset-password/',
            '/admin/'
        ]
        if any(request.path.startswith(path) for path in exempt_paths):
            return None
        

        token = request.COOKIES.get('access')
        
        if not token:
            return JsonResponse({
                "message": "Access token not provided",
                "success": False,
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            payload = decode_access_token(token)

            request.user_id = payload['user_id']
            request.user_email = payload["email"]
            request.user_role = payload["role"]
            
        except jwt.InvalidTokenError as e:
            return JsonResponse({
                "message": "Invalid or Expired access token",
                "error": str(e),
                "success": False,
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        except Exception as e:
            """ Fallback for any other errors """
            
            return JsonResponse({
                "message":f"Error processing access token: {str(e)}",
                "success": False,
            }, status=status.HTTP_401_UNAUTHORIZED)