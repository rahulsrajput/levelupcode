from django.urls import path
from account.views.register import registerView
from account.views.verifyEmail import verifyEmail
from account.views.login import loginView
from account.views.logout import logoutView
from account.views.refresh import RefreshView
from account.views.forgotPassword import ForgotPassword
from account.views.resetPassword import ResetPassword

urlpatterns = [
    path('register/', registerView.as_view(), name='register'),
    path('verify-email/', verifyEmail.as_view(), name='verify-email'),
    path('login/', loginView.as_view(), name='login'),
    path('logout/', logoutView.as_view(), name='logout'),
    path('refresh/', RefreshView.as_view(), name='refresh'),
    path('forgot-password/', ForgotPassword.as_view(), name='forgot_password'),
    path('reset-password/', ResetPassword.as_view(), name='reset_password'),
]