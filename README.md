# Fikisha Backend

A modern multi-tenant school transport management platform built with NestJS, Prisma, PostgreSQL, Redis, and WebSockets.

## Overview

Fikisha helps schools, parents, and drivers manage student transportation through real-time bus tracking, automated notifications, route management, and transport monitoring.

The platform is designed as a Software-as-a-Service (SaaS) solution, allowing multiple schools to operate independently on a shared infrastructure while maintaining complete data isolation.

---

## Key Features

### School Management

* Multi-school SaaS architecture
* School onboarding and administration
* Student management
* Parent management
* Driver management
* Bus fleet management
* Route and stop management

### Parent Experience

* Real-time bus tracking
* Live ETA updates
* Pickup and drop-off notifications
* Child transport history
* Transport status monitoring

### Driver Experience

* Route assignments
* Student manifests
* GPS location sharing
* Pickup and drop-off recording
* Incident reporting

### Real-Time Operations

* Live GPS tracking
* WebSocket-based updates
* Geofence notifications
* Route monitoring
* Event-driven architecture

---

## Technology Stack

### Backend

* NestJS
* TypeScript
* Prisma ORM
* PostgreSQL (Neon)
* Redis
* BullMQ
* Socket.IO
* JWT Authentication

### Infrastructure

* Docker
* GitHub
* Neon PostgreSQL
* Redis

---

## Architecture

```text
Driver App
     │
     ▼
WebSocket Gateway
     │
     ▼
Tracking Service
     │
 ┌───┴─────────┐
 ▼             ▼
Redis      PostgreSQL
 ▼             ▼
Geofence   Transport Data
Worker
 ▼
Notifications
 ▼
Parent App
```

---

## Project Structure

```text
fikisha-backend/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│
│   ├── common/
│   ├── config/
│   ├── gateways/
│   ├── jobs/
│   ├── prisma/
│   ├── redis/
│
│   ├── modules/
│   │   ├── auth/
│   │   ├── schools/
│   │   ├── users/
│   │   ├── parents/
│   │   ├── students/
│   │   ├── drivers/
│   │   ├── buses/
│   │   ├── routes/
│   │   ├── tracking/
│   │   └── notifications/
│
│   ├── app.module.ts
│   └── main.ts
│
├── docker-compose.yml
├── package.json
└── README.md
```

---

## Multi-Tenant Design

Fikisha is built as a multi-tenant platform.

Each school acts as an isolated tenant and all records are scoped using:

```ts
schoolId
```

This ensures complete separation of data between schools.

---

## Authentication & Authorization

Supported roles:

* SCHOOL_ADMIN
* DRIVER
* PARENT

Authentication is handled using JWT tokens.

Example JWT payload:

```json
{
  "sub": "user_id",
  "schoolId": "school_id",
  "role": "PARENT"
}
```

---

## Core Modules

### Auth Module

* Login
* Registration
* JWT authentication
* Role-based authorization

### Schools Module

* School management
* Tenant configuration

### Students Module

* Student profiles
* Student route assignments

### Parents Module

* Parent accounts
* Student linking

### Drivers Module

* Driver management
* Bus assignments

### Routes Module

* Route creation
* Stop management

### Tracking Module

* GPS ingestion
* Live tracking
* Route monitoring

### Notifications Module

* Push notifications
* Event notifications

---

## Environment Variables

Create a `.env` file:

```env
PORT=4000

DATABASE_URL=

JWT_SECRET=

REDIS_HOST=
REDIS_PORT=
```

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd fikisha-backend
```

Install dependencies:

```bash
npm install
```

Generate Prisma Client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

Start development server:

```bash
npm run start:dev
```

---

## API

Base URL:

```text
/api/v1
```

Example endpoints:

```http
POST /api/v1/auth/login

GET /api/v1/students

POST /api/v1/routes

GET /api/v1/buses/:id/location
```

---

## Real-Time Tracking

The platform uses WebSockets for:

* Live GPS updates
* Parent tracking updates
* Route status changes
* Transport notifications

Example event:

```json
{
  "event": "BUS_LOCATION_UPDATE",
  "data": {
    "busId": "bus_123",
    "lat": -1.2921,
    "lng": 36.8219
  }
}
```

---

## Roadmap

### Phase 1

* Authentication
* School onboarding
* Student management

### Phase 2

* Driver and bus management
* Route management

### Phase 3

* Real-time GPS tracking
* WebSockets

### Phase 4

* Geofencing
* Automated notifications

### Phase 5

* Analytics
* Reporting
* ETA prediction

---

## Vision

Fikisha aims to become Africa's leading school transport management platform by providing schools and parents with visibility, safety, accountability, and operational efficiency throughout the student transportation journey.

---

## License

MIT License

---

Built with ❤️ to improve student transportation safety and transparency.
