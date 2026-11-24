from decimal import Decimal, InvalidOperation
from uuid import uuid4
import re

from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes

from .models import Order, OrderItem, Restaurant, Food
from .serializers import (
    OrderSerializer,
    RestaurantSerializer,
    FoodSerializer,
)


# GET - Display and search active restaurants
class RestaurantListView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):

        restaurants = Restaurant.objects.filter(
            is_active=True
        )

        search_query = request.query_params.get('q', '').strip()

        if search_query:
            restaurants = restaurants.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query)
            )

        restaurants = restaurants.order_by('name')

        serializer = RestaurantSerializer(
            restaurants,
            many=True
        )

        return Response({
            "status": "success",
            "restaurants": serializer.data
        })


# GET - Display and search available food items
class FoodListView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):

        foods = Food.objects.filter(
            is_available=True,
            restaurant__is_active=True
        ).select_related('restaurant')

        restaurant_id = request.query_params.get('restaurant_id')
        category = request.query_params.get('category')
        search_query = request.query_params.get('q', '').strip()

        if restaurant_id:
            foods = foods.filter(restaurant_id=restaurant_id)

        if category:
            foods = foods.filter(category__iexact=category)

        # Search food name, description, category and restaurant name
        if search_query:
            foods = foods.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(category__icontains=search_query) |
                Q(restaurant__name__icontains=search_query)
            )

        foods = foods.order_by('name')

        serializer = FoodSerializer(
            foods,
            many=True
        )

        return Response({
            "status": "success",
            "foods": serializer.data
        })


# GET - Logged-in user's orders
# POST - Secure order placement
class OrderListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        orders = Order.objects.filter(
            user=request.user
        ).prefetch_related('items').order_by('-created_at')

        serializer = OrderSerializer(orders, many=True)

        return Response({
            "status": "success",
            "orders": serializer.data
        })

    def post(self, request):

        customer = request.data.get('customer', {})
        items = request.data.get('items', [])

        if not isinstance(customer, dict):
            return Response(
                {"error": "Invalid customer details."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not isinstance(items, list) or not items:
            return Response(
                {"error": "At least one food item is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        required_fields = [
            'fullName',
            'phone',
            'address',
            'city',
            'pincode'
        ]

        for field in required_fields:
            if not isinstance(customer.get(field), str) or not customer[field].strip():
                return Response(
                    {"error": f"{field} is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        full_name = customer['fullName'].strip()
        phone = customer['phone'].strip()
        address = customer['address'].strip()
        city = customer['city'].strip()
        pincode = customer['pincode'].strip()

        if not re.fullmatch(r'[0-9]{10}', phone):
            return Response(
                {"error": "Enter a valid 10-digit phone number."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not re.fullmatch(r'[0-9]{6}', pincode):
            return Response(
                {"error": "Enter a valid 6-digit pincode."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(full_name) > 150 or len(city) > 100:
            return Response(
                {"error": "Name or city is too long."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(phone) > 15 or len(pincode) > 10:
            return Response(
                {"error": "Invalid delivery details."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            subtotal = Decimal('0.00')
            validated_items = []

            for item in items:

                if not isinstance(item, dict):
                    raise ValueError("Invalid food item.")

                food_id = item.get('foodId')
                quantity_value = item.get('quantity')

                if food_id is None:
                    raise ValueError(
                        "Food ID is missing. Please add the food again."
                    )

                try:
                    food_id = int(food_id)
                    quantity = int(quantity_value)
                except (TypeError, ValueError):
                    raise ValueError("Invalid food or quantity.")

                if food_id <= 0 or quantity < 1 or quantity > 99:
                    raise ValueError("Invalid food quantity.")

                food = Food.objects.select_related(
                    'restaurant'
                ).filter(
                    id=food_id,
                    is_available=True,
                    restaurant__is_active=True
                ).first()

                if food is None:
                    raise ValueError(
                        "One or more food items are unavailable. Please refresh your cart."
                    )

                # Always use the database price and food details.
                price = Decimal(str(food.price))

                if price <= 0:
                    raise ValueError("Invalid food price.")

                subtotal += price * quantity

                validated_items.append({
                    'food_name': food.name,
                    'restaurant_name': food.restaurant.name,
                    'price': price,
                    'quantity': quantity
                })

            delivery_fee = Decimal('40.00')
            total = subtotal + delivery_fee

        except (InvalidOperation, TypeError, ValueError) as error:
            return Response(
                {"error": str(error) or "Invalid order details."},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():

            order = Order.objects.create(
                user=request.user,
                order_id="FH" + uuid4().hex[:12].upper(),
                full_name=full_name,
                phone=phone,
                address=address,
                city=city,
                pincode=pincode,
                subtotal=subtotal,
                delivery_fee=delivery_fee,
                total=total
            )

            OrderItem.objects.bulk_create([
                OrderItem(
                    order=order,
                    **item
                )
                for item in validated_items
            ])

        serializer = OrderSerializer(order)

        return Response({
            "status": "success",
            "message": "Order placed successfully!",
            "order": serializer.data
        }, status=status.HTTP_201_CREATED)


# PATCH - Cancel an order
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):

    with transaction.atomic():

        order = get_object_or_404(
            Order.objects.select_for_update(),
            id=order_id,
            user=request.user
        )

        if order.status not in ["Placed", "Confirmed"]:

            return Response(
                {
                    "status": "error",
                    "message": "This order cannot be cancelled now."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = "Cancelled"
        order.save(update_fields=["status"])

    serializer = OrderSerializer(order)

    return Response(
        {
            "status": "success",
            "message": "Order cancelled successfully!",
            "order": serializer.data
        },
        status=status.HTTP_200_OK
    )