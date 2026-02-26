# WildLog – Project Structure

## Planning / Structure

### 1. Database (MySQL)

Responsible for persistent storage of all platform data.

**Main Entities:**
- users
- posts (private / community)
- media (before/after images)
- comments
- favorites
- rankings / levels
- subscriptions

**Geospatial Fields:**
- latitude
- longitude
- (Indexed for proximity-based queries)

**Responsibilities:**
- Visibility control (private vs public posts)
- Environmental verification status
- Ranking system
- Subscription management
- Logging and auditing

---

### 2. Backend API (RESTful PHP)

Responsible for communication between frontend and database.

**Main Endpoints:**
- Authentication (Login / Register)
- Profile Management
- Create / Edit / Delete Posts
- Image Upload
- Comments and Favorites System
- Ranking System
- Subscription Validation

**Specific Functionalities:**
- Receive before/after images
- Send data to image processing module
- Provide geospatial data for map rendering (bounding box / radius queries)
- JSON-based communication

---

### 3. Image Processing (Python + OpenCV)

Automated environmental verification system.

**Pipeline:**
1. Receive images (before/after)
2. Validation and normalization
3. Image comparison
4. Difference detection
5. Cleanliness score calculation
6. Approve/Reject community post

**Objective:**
Ensure that only environmentally responsible posts are published publicly.

---

### 4. Interactive Map API (Mapbox / Leaflet / Google Maps)

Geolocation-based interactive map.

**Features:**
- Location markers
- Marker clustering
- Popups with location details
- Area-based filtering
- Coordinate search
- Favorites integration

**Integration:**
- Data retrieved via REST API
- Dynamic updates based on zoom level or bounding box

---

### 5. Frontend Interface (React / Vite)

Responsive Web Application.

**Modules:**
- Authentication
- User Profile
- Community Feed
- Private Posts
- Image Upload Interface
- Interactive Map
- Comments System
- Ranking Display

**Requirements:**
- Fully responsive (desktop + mobile)
- Loading/error state handling
- UX focused on outdoor exploration

---

### 6. Server Configuration & Deployment (cPanel)

Production infrastructure.

**Components:**
- Backend Hosting
- MySQL Configuration
- HTTPS (SSL)
- Domain Management
- Image Storage
- Environment Variables
- Logging
- Backups
- Scalability considerations

---

# General Architecture

Frontend (React)  
⬇  
REST API (PHP/Python)  
⬇  
Database (MySQL)  
⬇  
Image Processing Module  
⬇  
Interactive Map Integration

---

# Final Objective

To develop a geolocation-based social network for campers that:

- Promotes responsible content sharing
- Integrates automated environmental verification
- Enables discovery through an interactive map
- Ensures scalability, security, and production readiness  