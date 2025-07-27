from django.urls import path
from account.views.register import registerView
from account.views.verifyEmail import verifyEmail
from account.views.login import loginView
from account.views.logout import logoutView

urlpatterns = [
    path('register/', registerView.as_view(), name='register'),
    path('verify-email/', verifyEmail.as_view(), name='verify-email'),
    path('login/', loginView.as_view(), name='login'),
    path('logout/', logoutView.as_view(), name='logout'),
]