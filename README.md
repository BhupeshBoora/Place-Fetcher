# Location Based Places API

This project provides a simple RESTful API to manage and retrieve location based data entries based on geographic coordinates.

It uses haversine formula to calculate distance for better precision.

## Features

* Add new places with coordinates.
* Retrieve nearby places sorted by distance from a given latitude and longitude.
* Implements the Haversine formula for accurate distance calculations.

---

## Endpoints

### 1. `GET /listPlaces/:latitude/:longitude`

Returns a list of places sorted by proximity to the given geographic coordinates.

**Parameters:**

* `latitude` — Decimal degrees (e.g., `28.6139`)
* `longitude` — Decimal degrees (e.g., `77.2090`)

**Responses:**

* `200 OK`: Returns a JSON array of places with their names and distances in kilometers.
* `404 Not Found`: No places in the database.
* `500 Internal Server Error`: Server-side issue.

**Example Request:**

```
GET /listPlaces/28.6139/77.2090
```

**Example Response:**

```json
[
  {
    "placeName": "Sunrise Valley High",
    "placeDistance": 4
  },
  {
    "placeName": "National Museum",
    "placeDistance": 11
  },
  {
    "placeName": "Green Park",
    "placeDistance": 13
  }
]
```

---

### 2. `POST /addPlace`

Adds a new place to the database.

**Request Body (JSON):**

```json
{
  "name": "Greenwood Park",
  "address": "Sector 9, Rohini, Delhi",
  "latitude": 28.7166,
  "longitude": 77.1395
}
```

**Validation Rules:**

* All fields are mandatory.
* `name` and `address` must be non-empty strings.
* `latitude` and `longitude` must be valid numbers.

**Responses:**

* `201 Created`: Returns the added place.
* `400 Bad Request`: Input validation failed.
* `500 Internal Server Error`: Server-side issue.

**Example Response:**

```json
{
  "message": "Following place was inserted in the database:",
  "place": {
    "name": "Greenwood Park",
    "address": "Sector 9, Rohini, Delhi",
    "latitude": 28.7166,
    "longitude": 77.1395
  }
}
```

---

## How to Run Locally

1. **Clone the repository:**

```bash
git clone https://github.com/bhupeshboora/PlaceAPI.git
cd PlaceAPI
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up PostgreSQL table:**

```sql
CREATE TABLE place_info (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  address TEXT,
  latitude DECIMAL,
  longitude DECIMAL
);
```

4. **Create a `.env` file** in the root directory with the following contents:

```
DATABASE_USER=your_pg_user
DATABASE_NAME=your_database_name
DATABASE_PASSWORD=your_pg_password
DATABASE_PORT=5432
APP_PORT=3000
```

5. **Start the server:**

```bash
node server.js
```

---

## License

This project is provided for educational, demonstration, and personal project use.

Do not deploy to production without adding appropriate validations, authentication, and security measures.

---
If anything, you can contact me at: BhupeshBoora@gmail.com

Thankyou very much.
