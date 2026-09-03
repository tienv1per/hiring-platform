### Summary of System Design Breakdown: Ticket Booking Service (like Ticket Master)

This video presents a detailed walkthrough of designing a ticket booking system, commonly asked in system design interviews at top tech companies like Meta. The presenter, a former Meta staff engineer and interviewer, shares insights and frameworks based on extensive experience interviewing candidates and conducting mock interviews.

---

### Outline and Approach

- **Interview Roadmap**:
  1. Define **Functional Requirements** (core system features).
  2. Define **Non-Functional Requirements** (system qualities like scalability, availability, consistency).
  3. Identify **Core Entities** (data models).
  4. Design **APIs** that satisfy functional requirements.
  5. Develop a **High-Level Design** (microservices architecture).
  6. Conduct **Deep Dives** focusing on non-functional requirements and system optimizations.

---

### Functional Requirements

- **Core Features**:
  - Users can **search for events**.
  - Users can **view event details** (venue, performers, seat map).
  - Users can **book tickets**.

- The user flow follows: Search → View Event → Book Ticket.

---

### Non-Functional Requirements and Key Trade-offs

- **Consistency vs. Availability** (CAP Theorem):
  - **Strong consistency prioritized for booking** to prevent **double booking** (a ticket cannot be sold twice).
  - **High availability prioritized for search and viewing** as slight delays in reflecting new events are acceptable.

- **Read-to-Write Ratio**:
  - Reads (search/view) >> Writes (bookings), typically around **100:1** or more, impacting design choices.

- **Scalability**:
  - Must handle **surges during popular events** (e.g., Taylor Swift concerts, Super Bowl) where millions compete for limited tickets.
  
- **Other considerations**:
  - Fault tolerance, GDPR compliance, and reliability noted but marked *out of scope* or *below the line* for this design.

---

### Core Entities and Data Model

| Entity    | Description                               | Key Attributes/Notes                                          |
|-----------|-------------------------------------------|---------------------------------------------------------------|
| Event     | Represents an event                        | ID, venue ID (foreign key), performer ID, name, description   |
| Venue     | Location hosting events                    | ID, location, seat map                                        |
| Performer | Artist or team performing                  | ID, name, metadata                                           |
| Ticket    | Individual ticket for an event             | ID, seat location, price, status (available/reserved/booked), event ID (foreign key) |

- Entities evolve during design; initial focus is on identifying them, not exhaustive attributes.

---

### API Design

- **View Event** (GET /event/{eventID}):
  - Returns event details, venue, performer info, and seat map (tickets).

- **Search Event** (GET /search):
  - Accepts parameters like search term, location, date, type.
  - Returns a list of partial event data for efficient searching.

- **Book Ticket** (Two-phase booking process):
  - **Reserve (POST /booking/reserve)**: User reserves a ticket for a limited time (e.g., 10 minutes).
  - **Confirm (POST /booking/confirm)**: User confirms purchase with payment details (using third-party like Stripe).

- User authentication handled via headers (e.g., JWT tokens), not request body, for security.

---

### High-Level Design

- **Architecture**: Microservices with an API Gateway responsible for routing, authentication, and rate limiting.

- **Services**:
  - **Event CRUD Service**: Handles event data retrieval.
  - **Search Service**: Handles search queries (initially via SQL, later optimized).
  - **Booking Service**: Manages ticket reservation and confirmation.

- **Database**:
  - Chosen SQL (Postgres) for ACID guarantees, transactional support, and relations.
  - Tables for events, venues, performers, and tickets.

- **Two-phase booking logic**:
  - Ticket status updated from *available* → *reserved* → *booked*.
  - Reservation expires after 10 minutes if not confirmed.

---

### Handling Ticket Reservations and Expiry

- Problem: Reserved tickets could be locked indefinitely if a user abandons the booking.

- Solutions:
  1. **Reserved timestamp + query logic**: Tickets reserved longer than 10 minutes become available.
  2. **Cron job**: Periodically scans and resets expired reservations.
  3. **Distributed Lock with TTL (Recommended)**:
     - Use Redis or similar in-memory store to lock tickets with a 10-minute TTL.
     - Tickets not confirmed within TTL automatically become available.
     - Ensures real-time reservation expiry and scales across multiple service instances.

- Consistency is maintained by relying on ACID properties of the database combined with the distributed lock.

- Failure of the lock system may cause short-term concurrency issues but is considered acceptable with proper fallback and user experience management.

---

### Deep Dives & Optimizations

#### Search Optimization

- Initial SQL wildcard search is **inefficient and slow**.

- Proposed solution: Use **Elasticsearch** for low-latency, full-text, and geospatial queries.
  - Builds inverted indexes for fast term lookup.
  - Supports combined queries (term, location, date).
  - Updates synced via:
    - Application-level dual writes (DB + Elasticsearch).
    - Or **Change Data Capture (CDC)** streams for reliable event propagation.
  
- Popular queries can be further optimized by:
  - Caching results in Redis or an in-memory cache.
  - Leveraging CDN caching for API responses with short TTLs.

#### Scalability and Surge Handling

- Real-time ticket availability must be accurate to avoid poor user experience (e.g., booking conflicts).

- Implement **real-time seat map updates** via:
  - **Long polling** (simple, cheap).
  - Or **Server-Sent Events (SSE)** / WebSockets for persistent, push-based updates (SSE preferred here for unidirectional server-to-client updates).

- To handle traffic surges during popular events, introduce a **Virtual Waiting Queue**:
  - Users are placed in a queue (e.g., Redis sorted set) before accessing the booking page.
  - Controls load on backend services, protects infrastructure, and improves user experience.
  - Users are admitted in batches, notified via SSE.

#### Additional Design Considerations

- Read-heavy nature justifies caching of static data (events, venues, performers) in Redis.

- Database sharding may be considered based on back-of-envelope calculations, e.g., by event ID or venue ID, depending on query patterns.

- Payment is offloaded to third-party services (Stripe), with asynchronous callbacks via webhooks.

---

### Key Insights

- **Prioritize consistency for booking, availability for search/viewing** to balance user experience and data correctness.

- **Two-phase booking** with reservation expiry is essential to avoid double bookings and stale holds.

- **Distributed locking (Redis TTL)** is an elegant, scalable solution for managing reservations.

- **Search optimization using Elasticsearch and caching layers** significantly improves performance and scalability.

- **Real-time updates and virtual waiting queues improve user experience during high-demand events.**

- Back-of-envelope estimations should be used **only when they influence architectural decisions**.

---

### Conclusion

The presented ticket booking system design offers a robust and scalable solution meeting both functional and non-functional requirements commonly expected in top-tier tech interviews. It balances trade-offs in consistency, availability, scalability, and user experience through practical architectural choices and modern technologies such as microservices, Redis locks, Elasticsearch, and asynchronous payment processing.

Candidates preparing for system design interviews should focus on clarifying requirements, structuring their approach, and demonstrating awareness of trade-offs and system behaviors under load, as exemplified here.