from django.contrib import admin
from .models import Order, OrderItem, Restaurant, Food


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

    readonly_fields = (
        'food_name',
        'restaurant_name',
        'price',
        'quantity',
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        'order_id',
        'full_name',
        'phone',
        'total',
        'status',
        'payment_method',
        'payment_status',
        'created_at',
    )

    list_filter = (
        'status',
        'payment_method',
        'payment_status',
    )

    search_fields = (
        'order_id',
        'full_name',
        'phone',
    )

    list_editable = (
        'status',
        'payment_status',
    )

    readonly_fields = (
        'order_id',
        'user',
        'created_at',
        'subtotal',
        'delivery_fee',
        'total',
        'payment_method',
    )

    inlines = [OrderItemInline]

    ordering = ('-created_at',)


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):

    list_display = (
        'name',
        'is_active',
        'created_at',
    )

    search_fields = ('name',)

    list_filter = ('is_active',)

    ordering = ('name',)


@admin.register(Food)
class FoodAdmin(admin.ModelAdmin):

    list_display = (
        'name',
        'restaurant',
        'category',
        'price',
        'is_available',
    )

    list_filter = (
        'category',
        'is_available',
        'restaurant',
    )

    search_fields = (
        'name',
        'restaurant__name',
    )

    ordering = ('name',)