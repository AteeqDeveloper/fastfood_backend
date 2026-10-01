# Restaurant Backend API

Production-ready REST API for a multi-restaurant food ordering platform.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Customer, Restaurant Admin, Super Admin)
- **Restaurant Management**: CRUD, search, filters, soft delete
- **Categories & Menu**: Nested under restaurants with availability, pricing, search
- **Cart System**: Single-restaurant cart with server-side price validation
- **Orders**: Full lifecycle with status transitions, snapshots, cancellation rules
- **Admin Dashboard**: Users, restaurants, orders, statistics
- **Security**: bcrypt hashing, rate limiting, Joi validation, helmet, CORS

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- JWT + bcryptjs
- Joi validation
- express-rate-limit, helmet, cors

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB running locally (or Atlas URI)

### Setup

```bash
cd restaurant-backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

npm install
npm run seed   # Seed sample data
npm run dev    # Development with nodemon
# or
npm start      # Production
```

Server runs at `http://localhost:5000`

### Seed Credentials

| Role              | Email                  | Password     |
|-------------------|------------------------|--------------|
| Super Admin       | admin@restaurant.com   | Admin123!    |
| Restaurant Admin  | ali@pizzahut.com       | Admin123!    |
| Restaurant Admin  | sara@burgerking.com    | Admin123!    |
| Customer          | john@example.com       | Password123! |
| Customer          | jane@example.com       | Password123! |

## API Overview

Base URL: `/api`

### Auth
- `POST /auth/register` – Register customer
- `POST /auth/login` – Login
- `POST /auth/logout` – Logout (client discards token)

### Users (Bearer token required)
- `GET /users/me`
- `PATCH /users/me`
- `PATCH /users/change-password`

### Restaurants
- `GET /restaurants` – List (pagination, search, city, filters)
- `GET /restaurants/:id` – Details + categories + menu
- `POST /restaurants` – Create (auth)
- `PATCH /restaurants/:id` – Update (owner/admin)
- `DELETE /restaurants/:id` – Soft delete (super admin)

### Categories
- `GET /restaurants/:id/categories`
- `POST /restaurants/:id/categories`
- `GET /categories/:id`
- `PATCH /categories/:id`
- `DELETE /categories/:id`

### Menu
- `GET /restaurants/:id/menu` – Filters: category, search, minPrice, maxPrice, available
- `POST /restaurants/:id/menu`
- `GET /menu/:id`
- `PATCH /menu/:id`
- `DELETE /menu/:id`
- `PATCH /menu/:id/availability`

### Cart (Customer)
- `GET /cart`
- `POST /cart/items` – `{ menuItemId, quantity }`
- `PATCH /cart/items/:menuItemId`
- `DELETE /cart/items/:menuItemId`
- `DELETE /cart`

### Orders
- `POST /orders` – Place order from cart
- `GET /orders/my-orders`
- `GET /orders/:id`
- `PATCH /orders/:id/cancel`
- `PATCH /orders/:id/status` – Restaurant admin
- `GET /restaurants/:id/orders` – Restaurant orders

### Admin (Super Admin only)
- `GET /admin/users`
- `GET /admin/restaurants`
- `GET /admin/orders`
- `GET /admin/dashboard`
- `PATCH /admin/users/:id/block`
- `PATCH /admin/users/:id/unblock`

## Response Format

```json
{
  "success": true,
  "message": "...",
  "data": {},
  "pagination": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 }
}
```

## Order Status Flow

```
pending → confirmed → preparing → ready → out_for_delivery → delivered
         ↘ cancelled / rejected
```

## Environment Variables

See `.env.example`.

## Project Structure

```
src/
├── config/       # DB & env
├── controllers/
├── models/
├── routes/
├── middleware/
├── validators/
├── services/
├── utils/
├── seed/
├── app.js
└── server.js
```

## Testing

Import the Postman collection (see `postman/` if provided) or use the endpoints above with Bearer tokens from login.
