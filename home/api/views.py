from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from home.models import Hive
from .serializers import HiveSerializer
from home.api import serializers

from rest_framework import status
from .serializers import UserSignupSerializer

def getRoutes(request):
    routes = [
        'GET /api',
        'GET /api/hives',
        'GET /api/hives/:id'
    ]

    return Response(routes, safe=False)

@api_view(['GET'])
def getHives(request):
    hives = Hive.objects.all()
    serializer = HiveSerializer(hives, many=True)
    return Response(serializer.data)



@api_view(['GET'])
def getHive(request, pk):
    hive = Hive.objects.get(id=pk)
    serializer = HiveSerializer(hive, many=False)
    return Response(serializer.data)


@api_view(['POST'])
def signup_user(request):
    """
    API endpoint for user signup.
    """
    serializer = UserSignupSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'User created successfully!'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
