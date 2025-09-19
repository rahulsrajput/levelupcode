from django.urls import path
from core.views.createProblem import CreateProblemView
from core.views.problem import ProblemView
from core.views.submission import SubmitProblemView, SubmitProblemStatusView
from core.views.getAllProblem import GetAllProblemView, GetUserProblemSubmissionsView, GetUserProblemSubmissionDetailView, GetTagProblemsView

urlpatterns = [
    path('problem/create-problem/', CreateProblemView.as_view(), name='create-problem'),
    path('problem/problemset/', GetAllProblemView.as_view(), name='problemset'),
    path('problem/submit/', SubmitProblemView.as_view(), name='submit'),
    path('problem/submit/<int:id>/', SubmitProblemStatusView.as_view(), name='submit-status'),
    path('problem/tags/', GetTagProblemsView.as_view(), name='tags'),
    path('problem/tags/<slug:slug>/', GetTagProblemsView.as_view(), name='tags'),
    path('problem/<slug:slug>/submissions/<int:id>/', GetUserProblemSubmissionDetailView.as_view(), name='submissions-detail'),
    path('problem/<slug:slug>/submissions/', GetUserProblemSubmissionsView.as_view(), name='submissions'),
    path('problem/<slug:slug>/', ProblemView.as_view(), name='problem'),
]