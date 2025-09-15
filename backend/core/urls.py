from django.urls import path
from core.views.createProblem import CreateProblemView
from core.views.getAllProblem import GetAllProblemView , GetAllProblemSolvedByUserView
from core.views.problem import ProblemView
from core.views.submission import SubmitProblemView, SubmitProblemStatusView

urlpatterns = [
    path('problem/submission/<int:id>/', SubmitProblemStatusView.as_view(), name='submission-status'),
    path('problem/submission/', SubmitProblemView.as_view(), name='submission'),
    path('problem/get-all-problems/', GetAllProblemView.as_view(), name='get-all-problems'),
    path('problem/get-all-problems-solved-by-user/', GetAllProblemSolvedByUserView.as_view(), name='get-all-problems-solved-by-user'),
    path('problem/create-problem/', CreateProblemView.as_view(), name='create-problem'),
    path('problem/<slug:slug>/', ProblemView.as_view(), name='problem'),
]