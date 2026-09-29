# Zestora — Enterprise Food Delivery & Dining Marketplace Architecture

## 1. Architectural Overview

Zestora is structured using a strict, multi-layered enterprise architecture with independent root directories for each responsibility domain:

```text
/
├── frontend/          # React 19 SPA presentation layer, context store, and typed API client
├── backend/           # Express REST API controllers, domain services, and v1 routing
├── database/          # Persistent JSON storage engine, relational schemas, seed data, and repositories
├── configuration/     # Environment configuration, pricing constants, and promo definitions
├── testing/           # Automated verification suite for repositories and pricing calculations
├── documentation/     # System architecture, API contracts, and operational documentation
├── deployment/        # Docker, Docker Compose, and Cloud Run deployment manifests
└── server.ts          # Full-stack gateway binding the Express API and frontend asset server
```

## 2. Layer Separation Boundaries

- **Configuration Layer (`/configuration`)**: Centralizes tax rates, delivery fee formulas, supported cities/neighborhoods, order lifecycle enums, and promotional rules (`ZEST50`, `CRAFT120`, `FREEDEL`).
- **Database Layer (`/database`)**: Defines strict TypeScript data contracts (`RestaurantRecord`, `MenuItemRecord`, `OrderRecord`, `TableReservationRecord`, `ReviewRecord`), transactional file-backed storage (`database/storage/zestora_db.json`), and isolated data access repositories (`RestaurantRepository`, `OrderRepository`).
- **Backend Layer (`/backend`)**: Exposes versioned REST endpoints under `/api/v1` with separated controllers (`MarketplaceController`, `OrderController`) and business logic services (`PricingService`).
- **Frontend Layer (`/frontend`)**: Modular React components, centralized `MarketplaceContext`, and `ApiClient` service communicating exclusively via `/api/v1/*` contracts.

## 3. REST API Specification (`/api/v1`)

| Method  | Endpoint                        | Description                                                       |
| :------ | :------------------------------ | :---------------------------------------------------------------- |
| `GET`   | `/api/v1/metadata`              | Returns supported cities, cuisines, promos, and collections       |
| `GET`   | `/api/v1/restaurants`           | Lists & filters restaurants by search, cuisine, mode, veg, rating |
| `GET`   | `/api/v1/restaurants/:id`       | Fetches full restaurant profile, categorized menu, and reviews    |
| `POST`  | `/api/v1/restaurants/:id/menu`  | Publishes a new dish to a restaurant's live menu catalog          |
| `PATCH` | `/api/v1/menu/:itemId/toggle`   | Toggles real-time stock availability of a menu item               |
| `POST`  | `/api/v1/reviews`               | Publishes a verified customer review and updates rating average   |
| `POST`  | `/api/v1/cart/quote`            | Computes itemized subtotal, promo discount, GST, and delivery fee |
| `GET`   | `/api/v1/orders`                | Lists all live and historical delivery orders                     |
| `POST`  | `/api/v1/orders`                | Places a new delivery order and assigns an EV fleet partner       |
| `PATCH` | `/api/v1/orders/:id/status`     | Advances live order stage (`CONFIRMED` → `PREPARING` → `DELIVERED`) |
| `GET`   | `/api/v1/reservations`          | Lists confirmed dining-out table bookings                         |
| `POST`  | `/api/v1/reservations`          | Reserves a dining table with instant confirmation code            |
