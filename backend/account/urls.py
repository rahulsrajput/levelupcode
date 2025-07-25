from django.urls import path
from account.views.register import registerView

urlpatterns = [
    path('register/', registerView.as_view(), name='register'),
]