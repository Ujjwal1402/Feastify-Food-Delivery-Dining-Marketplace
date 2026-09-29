# Feastify — Enterprise Food Delivery & Dining Marketplace Platform

Feastify is a full-stack food delivery, restaurant discovery, dining table reservation, and merchant kitchen operations platform engineered with a strictly separated multi-layer architecture.

---

## Table of Contents

1. [Key Capabilities](#key-capabilities)
2. [System Architecture & Directory Structure](#system-architecture--directory-structure)
3. [Technology Stack](#technology-stack)
4. [REST API Reference](#rest-api-reference)
5. [Local Development & Setup](#local-development--setup)
6. [Testing & Quality Assurance](#testing--quality-assurance)
7. [Production Deployment](#production-deployment)

---

## Key Capabilities

- **Restaurant Discovery & Real-Time Filtering**: Multi-attribute filtering across cuisine categories, pure vegetarian kitchens, minimum diner ratings (`4.8+ ★`), rapid dispatch (`Under 26 Mins`), and neighborhood selection.
- **Interactive Menu & Customization Engine**: Full-text menu search, dietary classification toggles (`Veg`, `Egg`, `Non-Veg`), and dish customization groups (e.g., sourdough crust selection, handi portion sizing, noodle firmness).
- **Dynamic Cart, Promo Engine & Tax Billing**: Real-time calculation of itemized subtotals, promotional code validation (`ZEST50`, `CRAFT120`, `FREEDEL`), thermal packaging charges, GST (`5%`), distance-based delivery fees, and direct rider appreciation tips.
- **Live Order Lifecycle Tracking**: End-to-end 4-stage order tracking (`Order Confirmed` → `Kitchen Preparing` → `Rider En Route` → `Delivered`) with assigned EV delivery fleet telemetry and itemized receipts.
- **Dine-Out Table Reservations**: Instant table booking workflow with party size selection, time-slot availability, seating area preferences (`Indoor Dining`, `Chef Counter`, `Courtyard Patio`), and exclusive dining privileges.
- **Merchant Kitchen Operations Console**: Dedicated restaurant partner portal for publishing new menu items, toggling real-time dish stock availability, and advancing active kitchen tickets.

---

## System Architecture & Directory Structure

The repository enforces strict separation of concerns across independent root-level layers:

```text
feastify/
├── frontend/                  # Presentation Layer (React 19, TypeScript, Tailwind CSS)
│   ├── components/            # Modular UI views, modals, drawers, and cards
│   ├── context/               # Centralized state management (MarketplaceContext)
│   ├── services/              # Typed HTTP REST client (api.client.ts)
│   └── App.tsx                # Root frontend application layout and view router
├── backend/                   # Application & API Layer (Node.js, Express)
│   ├── controllers/           # HTTP request handlers (Marketplace & Order controllers)
│   ├── routes/                # Versioned REST API route definitions (/api/v1)
│   ├── services/              # Domain business logic and pricing/tax calculation engine
│   └── app.ts                 # Express application factory and error middleware
├── database/                  # Persistence & Data Access Layer
│   ├── repositories/          # Data access repositories (Restaurant & Order repositories)
│   ├── storage/               # Persistent JSON data store (feastify_db.json)
│   ├── engine.ts              # Atomic read/write storage engine
│   ├── schema.ts              # Relational TypeScript entity contracts
│   └── seed.ts                # Initial restaurant, menu, review, and collection catalog
├── configuration/             # Centralized Platform Configuration
│   ├── app.config.ts          # Server settings, tax rates, and city/neighborhood definitions
│   └── constants.ts           # Domain enumerations and promotional offer rules
├── testing/                   # Automated Verification Suite
│   └── marketplace.test.ts    # Repository, search, pricing, and order lifecycle assertions
├── documentation/             # Technical Specifications
│   └── ARCHITECTURE.md        # Detailed layer boundaries and API contracts
├── deployment/                # Container & Cloud Infrastructure Manifests
│   ├── Dockerfile             # Multi-stage production container build
│   ├── docker-compose.yml     # Local container orchestration with persistent volume
│   └── cloudrun.yaml          # Stateless container service specification
└── server.ts                  # Unified server entry point binding API and frontend assets
```

---

## Technology Stack

| Layer          | Technology                                        |
| :------------- | :------------------------------------------------ |
| **Frontend**   | React 19, TypeScript, Tailwind CSS 4, Lucide Icons |
| **Backend**    | Node.js, Express 4, TypeScript (`tsx`)            |
| **Database**   | Transactional JSON Persistence Engine & Repositories |
| **Build Tool** | Vite 8                                            |
| **Deployment** | Docker, Docker Compose                            |

---

## REST API Reference

All backend endpoints are versioned under `/api/v1` and return a standardized JSON envelope (`{ success, data, meta, error }`).

| Method  | Endpoint                        | Description                                                        |
| :------ | :------------------------------ | :----------------------------------------------------------------- |
| `GET`   | `/api/v1/metadata`              | Fetches supported cities, neighborhoods, cuisines, and collections |
| `GET`   | `/api/v1/restaurants`           | Lists and filters restaurants by search, cuisine, mode, and rating |
| `GET`   | `/api/v1/restaurants/:id`       | Retrieves restaurant details, full menu catalog, and diner reviews |
| `POST`  | `/api/v1/restaurants/:id/menu`  | Publishes a new dish to the specified restaurant's live menu       |
| `PATCH` | `/api/v1/menu/:itemId/toggle`   | Toggles real-time stock availability (`In Stock` / `Sold Out`)     |
| `GET`   | `/api/v1/reviews`               | Lists verified diner reviews with optional restaurant filtering    |
| `POST`  | `/api/v1/reviews`               | Submits a new diner review and recalculates restaurant rating      |
| `POST`  | `/api/v1/cart/quote`            | Computes itemized subtotal, promo discount, GST, and delivery fee  |
| `GET`   | `/api/v1/orders`                | Lists active and historical food delivery orders                   |
| `POST`  | `/api/v1/orders`                | Creates a new delivery order and assigns a delivery fleet partner  |
| `PATCH` | `/api/v1/orders/:id/status`     | Advances an order through kitchen and delivery lifecycle stages    |
| `GET`   | `/api/v1/reservations`          | Lists confirmed dining-out table reservations                      |
| `POST`  | `/api/v1/reservations`          | Books a dining table with instant confirmation code                |

---

## Local Development & Setup

### Prerequisites

- **Node.js** `>= 20.x`
- **npm** `>= 10.x`

### Installation

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (optional):
   ```bash
   cp .env.example .env
   ```

3. Start the full-stack development server on `http://localhost:3000`:
   ```bash
   npm run dev
   ```

---

## Testing & Quality Assurance

Run the automated test suite to validate repository filtering, full-text dish search, promotional discount rules, and order lifecycle state transitions:

```bash
npm test
```

Run static TypeScript type verification across all layers:

```bash
npm run lint
```

---

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Docker Deployment

Build and run the production container using Docker Compose:

```bash
docker compose -f deployment/docker-compose.yml up --build -d
```

---

## License

Apache-2.0
