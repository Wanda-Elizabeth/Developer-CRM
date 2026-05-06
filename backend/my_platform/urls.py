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
    path('profile/', views.profile_data, name='profile_data'),
    path('leaderboard/', views.leaderboard_data, name='leaderboard_data'),
    path('trending-skills/', views.trending_skills, name='trending_skills'),
    path('jobs/', views.job_listings, name='job_listings'),
    path('community/', views.community_posts, name='community_posts'),
    path('community/<int:post_id>/like/', views.like_post, name='like_post'),
    path('community/<int:post_id>/comments/', views.post_comments, name='post_comments'),
    path('online-users/', views.online_users, name='online_users'),
    path('profile/update/', views.update_profile, name='update_profile'),
]