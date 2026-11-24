# 🍔 FoodieHub – Online Food Ordering Application

FoodieHub is a full-stack online food ordering application that allows users to explore restaurants, browse food items, add products to their cart, place orders, and manage their orders.

## 🚀 Features

- User Registration and Login
- Browse Restaurants
- Explore Food Categories
- View Restaurant Menus
- Add and Remove Cart Items
- Update Food Quantities
- Secure Checkout
- Place Food Orders
- View Order History
- Cancel Orders
- User Authentication

## 🛠️ Technologies Used

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Vite
- React Router

### Backend
- Python
- Django
- Django REST Framework
- REST API

### Database
- MySQL

### Tools
- Visual Studio Code
- Git
- GitHub
- MySQL Workbench

## 📂 Project Structure

```text
FoodieHub/
│
├── backend/
│   ├── config/
│   ├── users/
│   ├── restaurants/
│   ├── menu/
│   ├── cart/
│   ├── orders/
│   ├── payments/
│   ├── food_orders/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── docs/
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/sivagit18/foodieHub.git
```

### 2. Backend Setup

```bash
cd FoodieHub/backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Create a `.env` file inside the backend folder and configure your database credentials and Django secret key.

### 3. Database Setup

Create a MySQL database named:

```sql
CREATE DATABASE foodiehub_db;
```

Configure the database credentials in the backend `.env` file.

Run migrations:

```bash
python manage.py migrate
```

Start the backend server:

```bash
python manage.py runserver
```

Backend URL: http://127.0.0.1:8000/

### 4. Frontend Setup

Open another terminal:

```bash
cd FoodieHub/frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Frontend URL: http://localhost:5173/

## 👨‍💻 Developer

**Siva Murugan**

GitHub: https://github.com/sivagit18

## 📌 Project Status

Development project – FoodieHub.