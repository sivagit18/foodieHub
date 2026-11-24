
from rest_framework import serializers
from .models import Order, OrderItem, Restaurant, Food


class RestaurantSerializer(serializers.ModelSerializer):

    class Meta:
        model = Restaurant
        fields = [
            'id',
            'name',
            'description',
            'image_url',
            'is_active',
        ]


class FoodSerializer(serializers.ModelSerializer):

    restaurant_name = serializers.CharField(
        source='restaurant.name',
        read_only=True
    )

    class Meta:
        model = Food
        fields = [
            'id',
            'restaurant',
            'restaurant_name',
            'name',
            'description',
            'category',
            'price',
            'image_url',
            'is_available',
        ]


class OrderItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'food_name',
            'restaurant_name',
            'price',
            'quantity',
        ]


class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'order_id',
            'full_name',
            'phone',
            'address',
            'city',
            'pincode',
            'subtotal',
            'delivery_fee',
            'total',
            'status',
            'created_at',
            'items',
        ]

        read_only_fields = [
            'id',
            'order_id',
            'status',
            'created_at',
        ]
