
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate

from .serializers import (
    UserRegistrationSerializer,
    UserProfileSerializer
)


@api_view(['POST'])
def register_user(request):

    serializer = UserRegistrationSerializer(data=request.data)

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


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_profile(request):

    user = request.user

    if request.method == 'GET':

        serializer = UserProfileSerializer(user)

        return Response({
            "status": "success",
            "user": serializer.data
        }, status=status.HTTP_200_OK)

    serializer = UserProfileSerializer(
        user,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():

        serializer.save()

        return Response({
            "status": "success",
            "message": "Profile updated successfully!",
            "user": serializer.data
        }, status=status.HTTP_200_OK)

    return Response({
        "status": "error",
        "errors": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):

    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')

    if not old_password or not new_password or not confirm_password:
        return Response({
            "status": "error",
            "message": "All password fields are required"
        }, status=status.HTTP_400_BAD_REQUEST)

    if not request.user.check_password(old_password):
        return Response({
            "status": "error",
            "message": "Current password is incorrect"
        }, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 8:
        return Response({
            "status": "error",
            "message": "New password must contain at least 8 characters"
        }, status=status.HTTP_400_BAD_REQUEST)

    if new_password != confirm_password:
        return Response({
            "status": "error",
            "message": "New passwords do not match"
        }, status=status.HTTP_400_BAD_REQUEST)

    if old_password == new_password:
        return Response({
            "status": "error",
            "message": "New password must be different from current password"
        }, status=status.HTTP_400_BAD_REQUEST)

    request.user.set_password(new_password)
    request.user.save()

    return Response({
        "status": "success",
        "message": "Password changed successfully!"
    }, status=status.HTTP_200_OK)
