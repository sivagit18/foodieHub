# FoodieHub – Database Design

## 1. Database Information

Database Name: foodiehub_db

Database Management System: MySQL

Backend Integration: Django ORM

## 2. Database Overview

FoodieHub uses a relational database structure.

The database stores customer information, restaurant details, food items, shopping carts, orders, payments and reviews.

## 3. Main Database Tables

### 3.1 Users
Stores customer, restaurant owner and administrator account information.

Fields:
- id (Primary Key)
- username
- email
- password
- phone_number
- role
- is_active
- created_at

### 3.2 Restaurants
Stores registered restaurant information.

Fields:
- id (Primary Key)
- owner_id (Foreign Key)
- restaurant_name
- description
- address
- phone_number
- restaurant_image
- approval_status
- created_at

### 3.3 Food Categories
Stores food categories belonging to restaurants.

Fields:
- id (Primary Key)
- restaurant_id (Foreign Key)
- category_name
- description

Examples:
- Pizza
- Burgers
- Drinks
- Desserts
- Fast Food

### 3.4 Foods
Stores individual food items.

Fields:
- id (Primary Key)
- restaurant_id (Foreign Key)
- category_id (Foreign Key)
- food_name
- description
- price
- food_image
- availability
- created_at

### 3.5 Cart
Stores customer shopping cart information.

Fields:
- id (Primary Key)
- customer_id (Foreign Key)
- restaurant_id (Foreign Key)
- created_at
- updated_at

### 3.6 Cart Items
Stores food items added to the cart.

Fields:
- id (Primary Key)
- cart_id (Foreign Key)
- food_id (Foreign Key)
- quantity
- price_at_addition

### 3.7 Addresses
Stores customer delivery addresses.

Fields:
- id (Primary Key)
- customer_id (Foreign Key)
- full_address
- city
- state
- postal_code
- phone_number

### 3.8 Orders
Stores customer order information.

Fields:
- id (Primary Key)
- order_number
- customer_id (Foreign Key)
- restaurant_id (Foreign Key)
- address_id (Foreign Key)
- subtotal
- delivery_fee
- total_amount
- order_status
- created_at

### 3.9 Order Items
Stores individual food items in each order.

Fields:
- id (Primary Key)
- order_id (Foreign Key)
- food_id (Foreign Key)
- food_name
- quantity
- price
- subtotal

### 3.10 Payments
Stores payment transaction information.

Fields:
- id (Primary Key)
- order_id (Foreign Key)
- payment_method
- transaction_id
- payment_status
- amount
- paid_at

### 3.11 Reviews
Stores customer ratings and reviews.

Fields:
- id (Primary Key)
- customer_id (Foreign Key)
- restaurant_id (Foreign Key)
- food_id (Foreign Key)
- rating
- review_text
- created_at

## 4. Database Relationships

1. One user can own multiple restaurants.
2. One restaurant can have multiple food categories.
3. One restaurant can have multiple food items.
4. One category can contain multiple food items.
5. One customer can have one active cart.
6. One cart can contain multiple cart items.
7. One customer can place multiple orders.
8. One restaurant can receive multiple orders.
9. One order can contain multiple order items.
10. One order can have payment records.
11. One customer can submit multiple reviews.

## 5. Important Business Rules

1. Every restaurant must have an owner.
2. Every food item must belong to a restaurant.
3. Restaurant owners can manage only their own restaurant data.
4. Only approved restaurants can display food to customers.
5. Each initial order must belong to one restaurant.
6. Food names and prices must be preserved in order items as historical snapshots.
7. Order totals must be calculated and validated by the backend.
8. Payment status must be verified before an order is marked as paid.

## 6. Database Security

- Use password hashing.
- Use foreign key constraints.
- Validate user permissions.
- Prevent unauthorized restaurant data access.
- Never store raw card details.
- Use secure environment variables.

## 7. Future Database Enhancements

- Delivery Partners
- Delivery Tracking
- Coupons
- Restaurant Branches
- Kiosk Devices
- Notifications
- Refund Management