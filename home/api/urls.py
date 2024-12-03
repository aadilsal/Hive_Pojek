from django.urls import path
from . import views


urlpatterns = [
    path('', views.getRoutes),
    path('hives/', views.getHives),
    path('hives/<str:pk>', views.getHive),
    path('', views.getRoutes),
    path('signup/', views.signup_user, name='signup'), 

]