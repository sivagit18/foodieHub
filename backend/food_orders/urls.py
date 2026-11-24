
from django.urls import path

from .views import (
    RestaurantListView,
    FoodListView,
    OrderListCreateView,
    cancel_order
)

urlpatterns = [

    # Get all active restaurants
    path(
        'restaurants/',
        RestaurantListView.as_view(),
        name='restaurant-list'
    ),

    # Get available food items
    path(
        'foods/',
        FoodListView.as_view(),
        name='food-list'
    ),

    # Get orders and place new order
    path(
        '',
        OrderListCreateView.as_view(),
        name='order-list-create'
    ),

    # Cancel an existing order
    path(
        '<int:order_id>/cancel/',
        cancel_order,
        name='cancel-order'
    ),

]
