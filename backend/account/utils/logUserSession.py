from account.models import UserSession


def log_user_session(user, refresh_token, request):
    ip = request.META.get('REMOTE_ADDR')
    ua = request.META.get('HTTP_USER_AGENT')
    
    UserSession.objects.create(
        user= user,
        refresh_token=refresh_token,
        ip_address= ip,
        user_agent=ua
    )