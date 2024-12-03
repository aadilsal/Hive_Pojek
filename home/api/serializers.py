from rest_framework.serializers import ModelSerializer
from home.models import Hive
from rest_framework import serializers
from django.contrib.auth.models import User

class HiveSerializer(ModelSerializer):
  class Meta:
    model = Hive
    fields = '__all__'
    
class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user