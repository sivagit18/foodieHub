from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def health_check(request):

    return Response({
        "status": "success",
        "message": "FoodieHub Backend is Running!",
        "application": "FoodieHub",
        "version": "1.0.0"
    })


