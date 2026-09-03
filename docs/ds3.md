### Summary of Hotel Booking System Design Video

This video presents a comprehensive system design walkthrough for a **hotel booking system**, similar to platforms like Airbnb, MakeMyTrip, or Booking.com. It covers all stages from **requirement gathering** to **low-level design**, focusing on fulfilling functional and non-functional requirements while addressing system scalability, consistency, and availability.

---

### Key Highlights and Core Concepts

#### 1. **Requirement Gathering**

- **Functional Requirements:**
  - User registration and login/logout.
  - Search hotels by location, name, and booking date.
  - View hotel details and available rooms for given dates.
  - Book rooms and complete payment.
  - View past bookings.
  
- **Non-Functional Requirements:**
  - System scale: Support for ~50 million users and ~1 million hotel listings globally.
  - **CAP Theorem considerations:**
    - High availability for search to ensure seamless user experience.
    - High consistency for booking to avoid double-booking of the same room.
  
#### 2. **Core Entities Identified**
- User
- Hotel
- Room
- Booking

#### 3. **API Design**
- **User APIs:** Sign-up (POST), login, logout, update profile.
- **Search API:** GET endpoint for hotels filtered by name, location, and booking date with pagination.
- **Hotel Details API:** GET endpoint returning hotel metadata, amenities, room availability, and price based on booking date.
- **Booking API:** POST endpoint including hotel ID, room ID, booking date, user ID, returning booking reference ID.
- **Past Bookings API:** GET endpoint returning all user’s previous bookings.

---

### High-Level System Design

- **Architecture:** Microservices architecture preferred over monolithic due to large scale.
- **Key Components:**
  - **API Gateway & Load Balancer:** Authentication, authorization, rate limiting, request routing, and traffic distribution.
  - **User Service:** Handles onboarding and authentication, backed by a relational database (MySQL/Postgres).
  - **Search Service:** Queries hotels based on user criteria, backed by a relational hotel database and optimized via Elasticsearch.
  - **Booking Service:** Manages booking lifecycle, invokes payment service, and ensures consistency.
  - **Payment Service:** Handles payment processing and transaction persistence.
  - **Booking Info Service:** Retrieves past bookings.
  - **Review Service:** Manages hotel reviews and stores associated images separately (e.g., S3).
  - **Availability Service:** Updates room availability after bookings.
- **Databases:** Separate DBs per service (user DB, hotel DB, booking DB, payment DB, review DB), mainly relational (MySQL/Postgres), with image storage in blob storage or S3.

---

### Database Schema and Design Details

| Database       | Description                                                                                     | Key Schema Elements                                                                                           |
|----------------|-------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| User DB        | Stores user metadata                                                                            | user_id, name, email, password, phone_number                                                                 |
| Hotel DB       | Stores hotels, rooms, pricing, availability                                                    | Hotel table (hotel_id, name, address, geo-location), Rooms table (room_id, type, capacity), Price table (date ranges, price), Availability table (per date or date ranges) |
| Booking DB     | Stores booking records                                                                          | booking_id, hotel_id, user_id, list of rooms, start_date, end_date, amount, currency, status                  |
| Payment DB     | Stores payment transaction details                                                             | payment_id, user_id, booking_id, amount, currency, date                                                      |
| Review DB      | Stores user reviews and ratings                                                                | hotel_id, user_id, rating, comments, images (metadata)                                                      |

---

### Availability Table Design Approaches

| Approach               | Description                                                                                       | Pros                                       | Cons                                                 |
|------------------------|-------------------------------------------------------------------------------------------------|--------------------------------------------|------------------------------------------------------|
| **Per-day records**     | One record per room per day indicating availability status for that day                          | Efficient for search queries                | Huge data volume (e.g., 365 records per room/year)   |
| **Date range records**  | Store availability as date ranges (e.g., Jan 1 - Jan 31 available)                              | Reduces data volume significantly           | Complex to update when bookings create gaps in ranges|

---

### Search Service and Optimization

- **Challenge:** Complex relational data, large scale, and need for efficient proximity and textual search.
- **Solution:** Use **Elasticsearch** for combined geospatial and textual search due to:
  - Built-in geolocation (geo-distance) queries.
  - Textual search capabilities.
- **Geospatial Search Alternatives:**
  - Quad Tree (tree-based spatial index, requires local cache and high memory).
  - Postgres with GIS extension.
  - Geohash.
- **Reason for Choosing Elasticsearch:** Supports both textual and geospatial search natively, unlike others that lack textual search or require complex additional structures.

- **Data Sync:** Use **CDC (Change Data Capture) pipeline + denormalization algorithm** to flatten relational data into Elasticsearch for efficient querying.
- **Two-phase Search Query:**
  - Phase 1: Query Elasticsearch to get relevant hotel IDs.
  - Phase 2: Query a **Redis cache (radius cache)** for room availability, price, and images to reduce DB load and latency.

---

### Booking Service and Consistency Handling

- **Booking flow:**
  1. User requests booking → Booking service.
  2. Booking service verifies room availability via **Availability Service**.
  3. If available, redirects to Payment Service.
  4. Payment Service processes payment via third-party gateway.
  5. Upon payment success, Booking Service publishes event to **Kafka**.
  6. Multiple consumers handle:
     - Update Booking DB.
     - Update Availability DB (via Availability Service).
     - Send notification to user.

- **Concurrency and Locking:**
  - To prevent double booking, booking service acquires a **Redis-based distributed lock** on the room for a TTL (~5 minutes).
  - Lock prevents multiple users from booking the same room simultaneously.
  - If payment not completed in TTL, lock expires and room becomes available again.
  - Before payment, booking service checks availability to avoid stale data issues.

---

### Summary Table of Services and Responsibilities

| Service            | Responsibility                                                  | Database                     | Notes                                        |
|--------------------|-----------------------------------------------------------------|------------------------------|----------------------------------------------|
| User Service       | User onboarding, authentication                                 | MySQL/Postgres User DB        | Generates JWT tokens for sessions             |
| Search Service     | Hotel search based on name, location, date                      | Postgres Hotel DB + Elasticsearch + Redis cache | Uses CDC pipeline for data ingestion           |
| Booking Service    | Handles booking requests, coordinates payment and booking state | Booking DB (Postgres/MySQL)  | Event-driven via Kafka for consistency        |
| Payment Service    | Manages payment processing and persistence                      | Payment DB (MySQL/Postgres)  | Connects to external payment gateway          |
| Availability Service | Updates room availability status                               | Hotel DB Availability Table  | Ensures single source of truth on availability |
| Booking Info Service | Returns user's past bookings                                   | Booking DB                   | Simple query service                           |
| Review Service     | Manages hotel reviews and related images                        | Review DB + S3/Blob storage  | Images stored separately for efficiency       |
| Notification Service | Sends booking confirmation or failure messages                | *Not specified*              | Consumer of Kafka events                        |

---

### Key Insights and Conclusions

- **Microservice architecture** is essential to handle the scale of 50 million users and 1 million hotels.
- **Elasticsearch** is the best fit for combined textual and geospatial search in this use case.
- **Event-driven architecture** using Kafka ensures data consistency and decoupling between services.
- **Distributed locking with Redis** prevents race conditions in concurrent booking requests.
- Separating metadata storage (Postgres/MySQL) from image storage (S3/blob storage) optimizes performance.
- Careful design of availability data storage balances search efficiency and storage volume.
- The design effectively balances **consistency** (booking) and **availability** (search), key to fulfilling CAP theorem constraints.

---

This video provides a detailed, methodical approach to designing a hotel booking system, highlighting how to translate open-ended requirements into a scalable, consistent, and available distributed system suitable for real-world production environments.