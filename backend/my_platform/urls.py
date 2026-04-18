from django.urls import path
from . import views

urlpatterns = [
    path('', views.homepage, name='homepage'),
    path('register/', views.register, name='register'),
    path('challenges/', views.get_challenges, name='get_challenges'),
    path('submit/', views.create_submission, name='create_submission'),
    path('submission/<int:id>/react/', views.react_submission, name='react_submission'),
    path('submission/<int:submission_id>/like/', views.like_submission, name='like_submission'),
    path('dashboard/', views.dashboard_data, name='dashboard_data'),
]