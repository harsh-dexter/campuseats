# CampusEats - System Architecture

This document provides a detailed overview of the technical architecture for the **CampusEats** MVP application.

---

## 1. High-Level Overview

CampusEats is built on the **MERN stack** (MongoDB, Express, React, Node.js). It follows a classic client-server architecture where the frontend (React single-page application) communicates with the backend (Node.js/Express REST API) to perform operations.

The system is designed with a **role-based access control (RBAC)** model, serving three distinct user roles: `STUDENT`, `MANAGER`, and `ADMIN`.

A key feature is the use of **short polling** to simulate real-time updates for critical features like order tracking and live dashboards, providing a dynamic user experience without the complexity of WebSockets for this MVP stage.

---

## 2. Frontend Architecture (Client)

The client is a modern React 18 application built with Vite, emphasizing performance and a clean project structure.

### Key Libraries & Concepts:

-   **UI Framework:** React 18
-   **Routing:** `react-router-dom` for declarative, client-side routing.
-   **State Management:** `Redux Toolkit (RTK)` is used for centralized state management.
    -   `authSlice.js`: Manages user authentication state, including the JWT token and user info. Persisted to `localStorage`.
    -   `cartSlice.js`: Manages the student's shopping cart state. Persisted to `localStorage` to prevent data loss on page refresh.
-   **Styling:** `Tailwind CSS` for a utility-first CSS workflow.
-   **API Communication:** `Axios` is used for making HTTP requests to the backend. A centralized API client (`src/api/apiClient.js`) is configured to automatically include the JWT token in the headers of protected requests.

### Directory Structure Breakdown:

-   `src/api/`: Contains the configured Axios instance for backend communication.
-   `src/components/`:
    -   `common/`: UI components shared across all roles (e.g., `Button`, `Input`, `Header`).
    -   `student/`, `manager/`: Role-specific components.
    -   `ProtectedRoute.jsx`: A higher-order component that wraps routes to restrict access based on user role and authentication status.
-   `src/pages/`:
    -   Each page component corresponds to a specific route.
    -   Organized by role (`admin`, `manager`, `student`) and `shared` pages like Login/Register.
-   `src/store/`: Contains the Redux Toolkit setup, including the store configuration and individual slices.

---

## 3. Backend Architecture (Server)

The backend is a Node.js application using the Express framework, following a RESTful API design and a layered architecture.

### Key Libraries & Concepts:

-   **Framework:** Express.js
-   **Database ORM:** Mongoose for modeling and interacting with the MongoDB database.
-   **Authentication:** JSON Web Tokens (JWT) are used for stateless authentication.
    -   A token is generated upon successful login and sent to the client.
    -   The client stores the token and sends it back in the `Authorization` header for protected requests.
-   **Middleware:**
    -   `authMiddleware.js`: Protects routes by verifying the JWT. It decodes the token, identifies the user, and attaches the user object to the request. It also handles role-based authorization.
    -   `errorMiddleware.js`: A centralized error handler to catch and format errors consistently.

### Directory Structure Breakdown:

-   `config/`: Database connection logic (`db.js`).
-   `controllers/`: Contains the business logic for each route. Each function handles a specific API request, interacts with the models, and sends a response.
-   `middleware/`: Custom middleware functions.
-   `models/`: Mongoose schemas that define the structure of the data in MongoDB (e.g., `User.js`, `Canteen.js`, `Order.js`).
-   `routes/`: Defines the API endpoints and maps them to the appropriate controller functions. Routes are grouped by resource/role (e.g., `authRoutes.js`, `studentRoutes.js`).
-   `utils/`: Utility functions, such as the JWT generator (`generateToken.js`).
-   `server.js`: The entry point of the backend application. It sets up the Express app, connects to the database, applies middleware, and mounts the routes.

---

## 4. Database Schema

The application uses MongoDB as its database. The core models are:

-   **User:**
    -   `name`, `email`, `password` (hashed)
    -   `role` (Enum: 'STUDENT', 'MANAGER', 'ADMIN')
    -   `canteen` (ObjectId, ref: 'Canteen') - *For manager roles*
-   **Canteen:**
    -   `name`, `location`, `timings`
    -   `manager` (ObjectId, ref: 'User')
-   **MenuItem:**
    -   `name`, `price`, `description`, `isAvailable`
    -   `canteen` (ObjectId, ref: 'Canteen')
-   **Order:**
    -   `student` (ObjectId, ref: 'User')
    -   `canteen` (ObjectId, ref: 'Canteen')
    -   `totalAmount`, `paymentMethod` (Enum: 'UPI', 'Cash')
    -   `status` (Enum: 'Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled')
    -   `orderItems` (Array of OrderItem sub-documents)
-   **OrderItem (Sub-document):**
    -   `menuItem` (ObjectId, ref: 'MenuItem')
    -   `quantity`, `price`

---

## 5. "Real-Time" Polling Mechanism

To provide live updates without WebSockets, the application uses **short polling**.

-   **Client-Side:** The frontend uses `setInterval` within React components (`useEffect` hook) to make API requests to specific endpoints every 5 seconds.
-   **Server-Side:** The backend provides dedicated endpoints that return the latest data (e.g., order status, dashboard stats). These are standard REST endpoints that fetch fresh data from the database on every call.

### Polling is implemented for:
1.  **Student Order Tracking:** The `OrderStatus` page polls `/student/orders/:id` to get status updates.
2.  **Manager Dashboard:** The `Dashboard` page polls `/manager/stats` and `/manager/orders` to see new orders and revenue in real-time.

---

## 6. Data Flow Example: Placing an Order

1.  **Frontend (Cart):** A student adds items to their cart. The state is managed by `cartSlice` in Redux.
2.  **Frontend (Checkout):** The student proceeds to checkout and confirms the order.
3.  **API Request:** The frontend dispatches an action that sends a `POST` request to `/student/orders` with the cart items and payment details. The JWT is included in the `Authorization` header.
4.  **Backend (Middleware):** The `authMiddleware` intercepts the request, verifies the JWT, and confirms the user has the 'STUDENT' role.
5.  **Backend (Controller):** The `studentController` receives the request, validates the data, creates a new `Order` document in the database, and saves it.
6.  **API Response:** The controller sends a `201 Created` response back to the client with the newly created order details.
7.  **Frontend (Redirect):** The client receives the successful response and redirects the student to the `OrderStatus` page, which begins polling for updates.
