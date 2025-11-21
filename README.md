1. What Is This Project? 🎯
Overview

Live Operation Tracking System is a professional web application that allows tour operation companies to monitor their daily operations, passengers, and vehicles in real time.

Problem

• Tour companies commonly face the following issues:

• They don’t know where their vehicles are

• They can’t track whether passengers were picked up

• Operation managers lack real-time visibility of field activities

• Manual tracking is time-consuming and error-prone

Solution

With this system:

✅ Vehicles are live-tracked via GPS (on the map)

✅ Passengers are checked in (who boarded, who didn’t)

✅ All teams stay synchronized (guide, driver, manager)

✅ Real-time notifications (via WebSocket)

✅ Reporting and analytics (all data is stored)

Usage Scenario

• 09:00 AM — Operation Starts

• The manager views today’s tours from the dashboard

• The guide and driver press the "Start" button to begin the operation

• The system switches the status to “ACTIVE” and sends notifications to all team members

09:00–09:30 — Passenger Pickup
4. The vehicle goes to the first pickup location
5. The manager monitors the vehicle’s position live on the map
6. When a passenger boards, the guide taps the “Check-in” button
7. The passenger’s marker on the map turns from yellow to green
8. The progress bar updates: 1/12, 2/12...

09:30 — Tour Begins
9. All passengers have been picked up (12/12)
10. The vehicle follows the tour route
11. The manager watches the entire operation from the office

14:00 — Tour Ends
12. The guide presses “Complete Operation”
13. The system generates a report
14. All data is archived

2. Technical Architecture 🏗️
High-Level Architecture

<pre> ```text
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Next.js     │  │ Google Maps  │  │  Socket.IO   │  │
│  │  React       │  │ JavaScript   │  │  Client      │  │
│  │  TypeScript  │  │ API          │  │              │  │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘  │
└─────────┼─────────────────────────────────────┼─────────┘
          │                                     │
          │ HTTP/REST                           │ WebSocket
          │                                     │
┌─────────▼─────────────────────────────────────▼─────────┐
│                    SERVER (Node.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Express.js  │  │  Socket.IO   │  │     JWT      │  │
│  │  REST API    │  │  Server      │  │   Auth       │  │
│  │  TypeScript  │  │              │  │              │  │
│  └──────┬───────┘  └──────────────┘  └──────────────┘  │
└─────────┼─────────────────────────────────────────────┘
          │
          │ Mongoose ODM
          │
┌─────────▼─────────────────────────────────────────────┐
│                    MongoDB Database                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Operations   │  │   Vehicles   │  │    Users     │ │
│  │     Pax      │  │  Telemetry   │  │  Locations   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
``` </pre>


Technology Stack

Backend:

• Node.js v18+ — JavaScript runtime

• Express.js — Web framework

• TypeScript — Type-safe development

• MongoDB — NoSQL database

• Mongoose — ODM (Object Data Modeling)

• Socket.IO — Real-time WebSocket communication

• JWT — Authentication

• bcryptjs — Password hashing

Frontend:

• Next.js 14 — React framework (SSR, routing)

• React 18 — UI library

• TypeScript — Type-safe development

• Tailwind CSS — Utility-first styling

• Google Maps JavaScript API — Map system

• Socket.IO Client — Real-time updates

• Axios — HTTP client

• date-fns — Date utilities

🚀 Quick Start
Requirements

Node.js 18 or higher

MongoDB (local or Atlas)

Google Maps API Key

1. Clone the Repository
• git clone https://github.com/huseyiinozel/live-operation-tracking.git
• cd "Live Operation Tracking"

### 3. Backend Setup
- cd backend
- npm install
- Edit the .env file:
  - MONGODB_URI
  - JWT_SECRET
- npm run seed
- npm run dev
- The backend will run at http://localhost:5001

### 4. Frontend Setup
- cd ../frontend
- npm install
- Edit the .env.local file:
  - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
- npm run dev




**Test Credentials:**
- Email: `admin@example.com`
- Password: `password123`

## 🧪 Testing the Application

### Step 1: Login to the System

1. Open browser: `http://localhost:3000`
2. Click **"Login"**
3. Enter credentials:
   - Email: `admin@example.com`
   - Password: `password123`
4. Click **"Sign In"**

✅ **Expected Result:** You should be redirected to the dashboard

---

### Step 2: View Operations Dashboard

1. After login, you'll see the **Operations Dashboard**
2. You should see:
   - Today's date filter (active by default)
   - 2 operations for today:
     - **Bangkok Grand Palace & Temple Tour** (09:00)
     - **Chao Phraya River Cruise** (14:00)
   - Each operation card shows:
     - Operation code
     - Tour name
     - Start time
     - Vehicle details
     - Driver and guide names
     - Passenger count
     - Status badge

✅ **Expected Result:** Operations are displayed with all details

---

### Step 3: View Operation Details

1. Click on **"Bangkok Grand Palace & Temple Tour"** operation
2. You should see:
   - **Operation Details Panel** (left side):
     - Operation info
     - Vehicle details (plate, model, capacity)
     - Driver and guide information
   - **Google Map** (center):
     - Red route line showing planned path
     - Blue markers for passenger pickup points
     - Numbered markers (passenger seat numbers)
   - **Passenger List** (right side):
     - 6 passengers with seat numbers (A1-A6)
     - Pickup addresses
     - Status indicators (waiting)

✅ **Expected Result:** Map displays route and all passenger markers

---

### Step 4: Test Real-Time GPS Tracking

Now we'll simulate a vehicle moving along the route!

#### Open Terminal and Run GPS Simulator

```bash
cd "Live Operation Tracking"
chmod +x simulate-gps.sh
./simulate-gps.sh <Vehicle ID>
```

**To get the Operation ID:**
1. On the operation detail page, look at the URL
2. Copy the ID from the URL: `http://localhost:5001/api/vehicles`
3. Or check the terminal where you ran `npm run seed`

**Example:**
```bash
./simulate-gps.sh 674567a8b4c1234567890abc
```

#### What the Simulator Does:

The script will:
1. Send GPS coordinates every 3 seconds
2. Simulate vehicle movement along the operation route
3. Show progress in terminal with colored output:
   ```
   🚗 Sending GPS heartbeat #1
   📍 Lat: 13.7500, Lng: 100.4910
   ✅ Response: 200
   ```

#### Watch Real-Time Updates:

1. **On the Map:**
   - 🔷 A  marker** will appear
   - The vehicle will move along the red route line
   - Position updates every 3 seconds
   
2. **In Vehicle Panel:**
   - **Status** changes to "In Use" (green badge)
   - **Last Update** timestamp changes
   - **Speed** displays current speed in km/h
   - **Heading** shows direction

3. **In Browser Console:**
   - Open Developer Tools (F12)
   - Go to Console tab
   - You'll see WebSocket messages:
     ```
     Vehicle position updated: {vehicleId: "...", lat: 13.75, lng: 100.49}
     ```

✅ **Expected Result:** Vehicle marker moves smoothly on the map

---

### Step 5: Test Passenger Check-In

#### Using the UI (Future Feature)
The UI for check-in will be added in a future update.


**Real-Time Updates:**
- Passenger status changes to "checked_in" (green)
- Operation `checkedInCount` increases
- WebSocket event broadcasts to all connected clients

✅ **Expected Result:** Passenger status updates in real-time

---

### Step 6: Filter Operations

1. Go back to dashboard: `http://localhost:3000/operations`
2. Try different filters:
   - Click **"Today"** - shows today's operations (default)
   - Click **"Tomorrow"** - shows tomorrow's operations
   - Click **"All Status"** dropdown - filter by status

✅ **Expected Result:** Operations filter correctly

---

### Step 7: Test Multiple Browser Sessions (Real-Time Sync)

1. Open a **second browser window** (or incognito mode)
2. Login with same credentials
3. Navigate to the same operation page
4. In **first window**: Start GPS simulator
5. Watch **second window**: Vehicle moves in real-time!

This demonstrates:
- WebSocket real-time synchronization
- Multiple users can track same operation
- All clients receive updates simultaneously

✅ **Expected Result:** Both browsers show synchronized updates

---

### Step 8: View Locations

1. Click **"Locations"** in navigation menu
2. You should see:
   - List of all pickup locations
   - Location names and addresses
   - Coordinates (lat/lng)

✅ **Expected Result:** All seeded locations are displayed

---

### Step 9: Stop GPS Simulation

In the terminal where GPS simulator is running:
1. Press `Ctrl+C` to stop
2. Vehicle marker will stop moving
3. Status may change back to "Available"

---




