from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token

from .serializers import UserRegistrationSerializer


@api_view(['POST'])
def register_user(request):

    serializer = UserRegistrationSerializer(
        data=request.data
    )

    if serializer.is_valid():

        user = serializer.save()

        return Response({
            "status": "success",
            "message": "User registered successfully!",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "phone_number": user.phone_number
            }
        }, status=status.HTTP_201_CREATED)

    return Response({
        "status": "error",
        "errors": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_user(request):

    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({
            "status": "error",
            "message": "Username and password are required"
        }, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(
        request,
        username=username,
        password=password
    )

    if user is not None:

        token, created = Token.objects.get_or_create(user=user)

        return Response({
            "status": "success",
            "message": "Login successful!",
            "token": token.key,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }, status=status.HTTP_200_OK)

    return Response({
        "status": "error",
        "message": "Invalid username or password"
    }, status=status.HTTP_401_UNAUTHORIZED)
