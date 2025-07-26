from django.urls import path
from account.views.register import registerView
from account.views.verifyEmail import verifyEmail

urlpatterns = [
    path('register/', registerView.as_view(), name='register'),
    path('verify-email/', verifyEmail.as_view(), name='verify-email'),
]