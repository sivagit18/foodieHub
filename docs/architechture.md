# FoodieHub – Application Architecture

## 1. Architecture Overview

FoodieHub follows a Modular Monolithic Full-Stack Architecture.

The application consists of three main layers:

1. Frontend – React JS
2. Backend – Python Django REST Framework
3. Database – MySQL

These layers communicate through REST APIs.

## 2. System Architecture

```text
             FOODIEHUB APPLICATION
                       |
             ---------------------
             |                   |
         FRONTEND             BACKEND
          React JS              Django
             |                   |
             |              REST API
             |                   |
             ---------------------
                       |
                  MYSQL DATABASE
                       |
             ---------------------
             |         |         |
           USERS   RESTAURANTS  ORDERS
                       |
                     FOODS
                       |
                      CART
```

## 3. Frontend Architecture

Technology: React JS

Frontend handles the user interface and user interactions.

Main interfaces:

### Customer Interface
- Home
- Food Listing
- Restaurant Listing
- Restaurant Menu
- Food Details
- Cart
- Checkout
- My Orders
- User Profile

### Restaurant Owner Interface
- Restaurant Dashboard
- Restaurant Profile
- Category Management
- Food Management
- Order Management
- Sales Reports

### Admin Interface
- Admin Dashboard
- Customer Management
- Restaurant Approval
- Food Management
- Order Monitoring

## 4. Backend Architecture

Technology: Python Django + Django REST Framework

Backend handles business logic, API requests, authentication and database operations.

Main Django Applications:

- accounts
- restaurants
- foods
- cart
- orders
- payments
- reviews

Each application manages its own functionality.

## 5. Database Architecture

Database: MySQL

Database name: foodiehub_db

Main database entities:

- Users
- Restaurants
- Food Categories
- Foods
- Cart
- Cart Items
- Addresses
- Orders
- Order Items
- Payments
- Reviews

Each food item will be associated with a restaurant through its restaurant ID.

## 6. Frontend and Backend Communication

React JS communicates with Django through REST APIs.

Example:

Customer opens the homepage.

1. React sends a GET request to the Django API.
2. Django receives the request.
3. Django retrieves available food items from MySQL.
4. Django returns JSON data.
5. React displays food items on the homepage.

Example API:

GET /api/foods/

## 7. Order Processing Architecture

1. Customer selects food.
2. Customer adds food to cart.
3. Customer proceeds to checkout.
4. Backend validates cart and prices.
5. Customer confirms the order.
6. Payment is processed.
7. Order is created.
8. Restaurant receives the order.
9. Restaurant updates order status.
10. Customer views order updates.

## 8. Authentication and Security

- JWT-based authentication.
- Password hashing.
- Role-based access control.
- Restaurant data ownership validation.
- API permission management.
- Environment variables for sensitive configuration.
- Input validation.

## 9. Development Environment

Frontend Development Server:

http://localhost:5173

Backend Development Server:

http://127.0.0.1:8000

Database:

MySQL – localhost:3306

## 10. Deployment Architecture

The production application will consist of:

- React frontend hosting.
- Django backend server.
- MySQL database server.
- Secure HTTPS communication.
- Environment-based configuration.

## 11. Future Architecture Enhancements

- Self-service restaurant kiosk interface.
- Delivery partner application.
- Live order tracking.
- Mobile application.
- Payment gateway integration.
- Real-time notifications.