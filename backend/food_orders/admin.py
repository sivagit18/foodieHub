
from django.contrib import admin
from .models import Order, OrderItem, Restaurant, Food


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_id',
        'full_name',
        'phone',
        'total',
        'status',
        'created_at'
    )

    list_filter = ('status', 'created_at')
    search_fields = ('order_id', 'full_name', 'phone')
    inlines = [OrderItemInline]


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')
    search_fields = ('name',)
    list_filter = ('is_active',)


@admin.register(Food)
class FoodAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'restaurant',
        'category',
        'price',
        'is_available'
    )

    list_filter = ('category', 'is_available', 'restaurant')
    search_fields = ('name', 'restaurant__name')
