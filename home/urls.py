from django.urls import path
from . import views

urlpatterns = [
  path('login/', views.loginView, name='login'),
  path('register/', views.registerUser, name='register'),
  path('logout/', views.logoutView, name='logout'),
  # path('index', views.index, name="index"),
  # path("<str:room_name>/", views.room, name="hiveroom"),
  path('', views.home, name="homepage"),
  path('hive/<str:pk>/', views.hive, name="hive"),
  path('hive/<str:pk>/check_password/',views.check_hive_password,name='check_hive_password'),
  path('create-hive/', views.createHive, name='create-hive'),
  path('update-hive/<str:pk>', views.updateHive, name='update-hive'),
  path('delete-hive/<str:pk>', views.deleteHive, name='delete-hive'),
  path('delete-message/<str:pk>', views.deleteMessage, name='delete-message'),  
  path('user/<str:pk>', views.userProfile, name='user-profile'),  
  path('update-user/', views.updateUser, name='edit-user'),
  path("update-hive-theme/<int:hive_id>/", views.update_hive_theme, name="update-hive-theme"),
  #path('',views.lobby),
  path('lobby/',views.lobby,name='lobby'),
  path('hive_video/',views.videohive,name='hive-video'),
  path('get_token/',views.getToken,),
  path('create_member/',views.createMember),
  path('get_member/',views.getMember),
  path('delete_member/',views.deleteMember),
]

