from django.urls import path
from core.views.createProblem import CreateProblemView
from core.views.getAllProblem import GetAllProblemView , GetAllProblemSolvedByUserView
from core.views.problem import ProblemView

urlpatterns = [
    path('create-problem/', CreateProblemView.as_view(), name='create-problem'),
    path('get-all-problems/', GetAllProblemView.as_view(), name='get-all-problems'),
    path('problem/<slug:slug>/', ProblemView.as_view(), name='problem'),
    path('get-all-problems-solved-by-user/', GetAllProblemSolvedByUserView.as_view(), name='get-all-problems-solved-by-user'),
]