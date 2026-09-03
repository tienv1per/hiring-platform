### Summary of Hotel Reservation System Design Video

This video presents a detailed walkthrough of designing a **hotel reservation system** akin to Booking.com or Airbnb, focusing on core challenges and architectural decisions critical for system design interviews. The discussion emphasizes **handling concurrency, data consistency, failure recovery, and scaling**, moving beyond simplistic CRUD approaches.

---

### Key Insights and Concepts

- **Common Pitfall:** Treating the system as a simple CRUD app with caching leads to concurrency issues like **double bookings** (two users booking the last room simultaneously).
- **Core challenges:** 
  - Handling concurrency correctly under heavy load.
  - Ensuring **strong consistency** to prevent double bookings.
  - Designing for failure and recovery.
  - Balancing read-heavy loads with transactional writes.
- **Design Framework:**
  1. Gather design requirements (functional and non-functional).
  2. Estimate system scale (queries and transactions per second).
  3. Create high-level design (API, database, services).
  4. Address failure handling and recovery.
  
---

### Design Requirements

- **Functional:**
  - Support both web and mobile platforms.
  - Users can search hotels by location, dates, guests, price range, and filters.
  - Users can book, view, cancel, and modify reservations.
  - Support payment processing within the platform (e.g., Stripe, PayPal).
  - Admin panel for managing hotels and rooms.
  - Notifications for booking confirmations, cancellations, and payments.
  - Support **overbooking** to account for cancellations.
  - Implement **dynamic pricing** based on demand (e.g., holiday seasons).

- **Non-functional:**
  - **Strong consistency** for booking transactions (no double bookings).
  - Eventual consistency for search and discovery data.
  - Handle thousands of concurrent users booking the same hotel.
  - Low latency: search under 500 ms, booking confirmations within 2-3 seconds.
  - High availability (99.9% uptime).
  - Horizontal scalability without major redesign.

---

### Scale and Data Estimation

| Metric                        | Value/Estimate                  | Notes                                      |
|------------------------------|--------------------------------|--------------------------------------------|
| Monthly visits                | ~500 million                   | Based on booking.com traffic                |
| Visits per day               | ~17 million                   | Monthly visits divided by ~30 days          |
| Visits per second            | ~200                          | Visits per day divided by seconds in a day |
| Pages browsed per visit      | 8                             | Average page views per user session         |
| Read queries per second (QPS) | ~1,000                        | 200 visits/sec × 5 backend reads per visit  |
| Reservations per year        | 1.1 billion                   | Rough estimate for bookings                  |
| Average stay per booking     | 2 nights                     | Used to calculate actual bookings           |
| Bookings per day             | 1.5 million                   | Reservations divided by 365 days             |
| Transactions per second (TPS) | 17                            | Booking write operations                      |

- The system is **read-heavy** (~1000 QPS) with relatively fewer writes (~17 TPS).
- The system must optimize for **fast reads** while ensuring transactional safety for writes.

---

### High-Level Architecture

- **Client Apps:** Mobile and web front-ends.
- **CDN:** For static assets like images, JavaScript.
- **API Gateway:** Handles authentication, rate limiting, routing, and load balancing.
- **Microservices:**
  - **Hotel Service:** Manages hotel and room info (mostly static, cacheable).
  - **Reservation Service:** Handles booking logic, concurrency, creation, and cancellation.
  - **Rate Service:** Implements dynamic pricing by date.
  - **Payment Service:** Integrates payment gateways (Stripe, PayPal, Apple Pay, etc.).
  - **Notification Service:** Sends booking/payment confirmations and alerts.
  - **Search Service:** Uses Elasticsearch for fast, full-text hotel search and filtering.

- **Databases:**
  - Primary SQL database (e.g., PostgreSQL) for transactional operations due to ACID requirements.
  - Elasticsearch for scalable, fast search queries with eventual consistency.
  - Optionally, each microservice can have its own database for decoupling, communicating via message queues (Kafka, RabbitMQ).

---

### API Design Overview

- **RESTful endpoints** for all operations.
- **Users:**
  - Search hotels (`GET /hotels` with filters).
  - View hotel details (`GET /hotels/{id}`).
  - View and manage reservations (`GET/POST/PUT/DELETE /reservations`).
- **Admins:**
  - Manage hotels (`POST/PUT/DELETE /hotels`).
  - Manage rooms within hotels (`POST/PUT/DELETE /hotels/{id}/rooms`).
- Reservation creation prevents **double bookings** by using:
  - Client-generated **reservation ID** to detect duplicate requests.
  - Hashing strategies involving user ID, hotel ID, room ID, and timestamps to prevent multiple bookings.

- Search queries are routed to the **Search Service** backed by Elasticsearch for speed.

---

### Database Schema Highlights

| Table                | Key Columns / Relationships                                                | Purpose                                                        |
|----------------------|-----------------------------------------------------------------------------|----------------------------------------------------------------|
| Hotels               | hotel_id, name, address, location, description                            | Stores hotel metadata                                          |
| Hotel Groups         | group_id, group_name                                                        | Optional grouping of hotels under brand names                 |
| Room Types           | room_type_id, hotel_id, name, description, capacity                       | Defines types of rooms available under hotels                 |
| Room Type Rates      | rate_id, room_type_id, price_per_day                                       | Supports different pricing tiers per room type                |
| Rooms                | room_id, room_type_id, hotel_id, floor, availability status               | Physical rooms assigned at check-in                            |
| Room Type Inventory  | hotel_id, room_type_id, date, total_inventory, total_reserved             | Tracks availability per room type per day, supports overbooking |
| Reservations         | reservation_id, guest_id, hotel_id, room_type_id, start_date, end_date, status | Bookings made by users                                         |
| Guests               | guest_id, first_name, last_name, email                                     | User profiles booking rooms                                   |
| Transactions         | transaction_id, reservation_id, type (new, refund, change), amount        | Payment records linked to reservations                         |

- Bookings are made on **room types**, not specific rooms.
- Inventory tracks **aggregate availability** for room types per day, enabling efficient bulk updates and overbooking logic.
- Transactions are separated to allow recording multiple payments/refunds for one reservation.

---

### Concurrency Handling

- **Scenario 1:** Same user double booking the same room.
  - Solved by checking unique reservation ID on insert; duplicates are rejected.
- **Scenario 2:** Two different users booking the last available room simultaneously.
  - Default SQL isolation (read committed) is insufficient; both may see availability and book the last room.
  - Requires stronger concurrency control (e.g., serializable isolation or explicit locking) to prevent double bookings.

---

### Conclusion

This design carefully balances the system's **read-heavy nature** and **transactional integrity** by:

- Using **SQL databases** for strong consistency and complex queries.
- Leveraging **Elasticsearch** for fast, scalable search.
- Implementing a **microservices architecture** with clear boundaries but shared databases for tightly coupled data.
- Addressing concurrency with **unique reservation IDs** and transaction isolation.
- Supporting dynamic pricing, overbooking, and multi-platform interfaces.

This comprehensive approach highlights the **trade-offs between consistency, scalability, and complexity**, equipping developers to handle real-world system design challenges effectively.

---

### Keywords

- Hotel Reservation System
- Concurrency Control
- Strong Consistency
- ACID Transactions
- Microservices Architecture
- Elasticsearch
- Dynamic Pricing
- Overbooking
- API Design
- SQL Database
- Read-Heavy System
- Payment Integration