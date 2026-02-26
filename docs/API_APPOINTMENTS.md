# Appointments API Documentation

This document describes the API endpoints required for the Appointments feature in MedixPro Frontend.

---

## Base URL

All endpoints are relative to: `{BACKEND_URL}`

---

## Authentication

All endpoints require Bearer token authentication via the `Authorization` header:

```
Authorization: Bearer {accessToken}
```

---

## Endpoints

### 1. List Appointments

Fetch a list of appointments with optional filtering by view.

**Endpoint:** `GET /appointments`

**Query Parameters:**

| Parameter | Type   | Required | Default | Description                                           |
|-----------|--------|----------|---------|-------------------------------------------------------|
| `view`    | string | No       | `all`   | Filter view: `all`, `upcoming`, `today`, `completed`, `cancelled` |

**Request Example:**

```http
GET /appointments?view=upcoming
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Response Shape:**

```json
{
  "success": true,
  "appointments": [
    {
      "id": "apt_123",
      "start": "2026-01-26T10:00:00Z",
      "end": "2026-01-26T10:30:00Z",
      "status": "confirmed",
      "type": "checkup",
      "patient": {
        "id": "pat_22",
        "name": "John Smith"
      },
      "doctor": {
        "id": "doc_8",
        "name": "Dr. Sarah Johnson"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 148,
    "hasMore": true
  }
}
```

**Response Fields:**

| Field                    | Type    | Description                                              |
|--------------------------|---------|----------------------------------------------------------|
| `success`                | boolean | Indicates if the request was successful                  |
| `appointments`           | array   | Array of appointment objects                             |
| `appointments[].id`      | string  | Unique identifier for the appointment                    |
| `appointments[].start`   | string  | ISO 8601 datetime for appointment start                  |
| `appointments[].end`     | string  | ISO 8601 datetime for appointment end                    |
| `appointments[].status`  | string  | Status: `confirmed`, `in_progress`, `completed`, `cancelled` |
| `appointments[].type`    | string  | Appointment type (e.g., `checkup`, `consultation`, `follow-up`) |
| `appointments[].patient` | object  | Patient information                                      |
| `appointments[].patient.id`   | string | Patient's unique identifier                         |
| `appointments[].patient.name` | string | Patient's full name                                 |
| `appointments[].doctor`  | object  | Doctor information                                       |
| `appointments[].doctor.id`    | string | Doctor's unique identifier                          |
| `appointments[].doctor.name`  | string | Doctor's full name (with title)                     |
| `meta`                   | object  | Pagination metadata (optional for now)                   |
| `meta.page`              | number  | Current page number                                      |
| `meta.limit`             | number  | Items per page                                           |
| `meta.total`             | number  | Total number of appointments                             |
| `meta.hasMore`           | boolean | Whether more pages exist                                 |

**View Filter Logic:**

| View        | Description                                                    |
|-------------|----------------------------------------------------------------|
| `all`       | All appointments (no filter)                                   |
| `upcoming`  | Future appointments where `start > now` AND `status != cancelled` |
| `today`     | Appointments where `start` is within today's date range        |
| `completed` | Appointments where `status = completed`                        |
| `cancelled` | Appointments where `status = cancelled`                        |

**Error Response:**

```json
{
  "success": false,
  "message": "Error description here"
}
```

---

### 2. Get Single Appointment

Fetch details of a specific appointment by ID.

**Endpoint:** `GET /appointments/{id}`

**Path Parameters:**

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| `id`      | string | Yes      | The appointment's unique ID    |

**Request Example:**

```http
GET /appointments/apt_123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Response Shape:**

```json
{
  "success": true,
  "data": {
    "id": "apt_123",
    "start": "2026-01-26T10:00:00Z",
    "end": "2026-01-26T10:30:00Z",
    "status": "confirmed",
    "type": "checkup",
    "patient": {
      "id": "pat_22",
      "name": "John Smith"
    },
    "doctor": {
      "id": "doc_8",
      "name": "Dr. Sarah Johnson"
    },
    "notes": "Regular checkup, patient has no complaints",
    "createdAt": "2026-01-20T08:30:00Z",
    "updatedAt": "2026-01-20T08:30:00Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Appointment not found"
}
```

---

### 3. Create Appointment

Create a new appointment.

**Endpoint:** `POST /appointments`

**Request Body:**

```json
{
  "patientId": "pat_22",
  "doctorId": "doc_8",
  "start": "2026-01-28T14:00:00Z",
  "end": "2026-01-28T14:30:00Z",
  "type": "consultation",
  "notes": "Patient requested follow-up consultation"
}
```

**Request Fields:**

| Field       | Type   | Required | Description                              |
|-------------|--------|----------|------------------------------------------|
| `patientId` | string | Yes      | Patient's unique identifier              |
| `doctorId`  | string | Yes      | Doctor's unique identifier               |
| `start`     | string | Yes      | ISO 8601 datetime for appointment start  |
| `end`       | string | Yes      | ISO 8601 datetime for appointment end    |
| `type`      | string | Yes      | Appointment type                         |
| `notes`     | string | No       | Optional notes for the appointment       |

**Response Shape (201 Created):**

```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "id": "apt_456",
    "start": "2026-01-28T14:00:00Z",
    "end": "2026-01-28T14:30:00Z",
    "status": "confirmed",
    "type": "consultation",
    "patient": {
      "id": "pat_22",
      "name": "John Smith"
    },
    "doctor": {
      "id": "doc_8",
      "name": "Dr. Sarah Johnson"
    },
    "notes": "Patient requested follow-up consultation",
    "createdAt": "2026-01-26T12:00:00Z",
    "updatedAt": "2026-01-26T12:00:00Z"
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "patientId": ["Patient ID is required"],
    "start": ["Start time must be in the future"]
  }
}
```

---

### 4. Update Appointment

Update an existing appointment (partial update supported).

**Endpoint:** `PATCH /appointments/{id}`

**Path Parameters:**

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| `id`      | string | Yes      | The appointment's unique ID    |

**Request Body (all fields optional):**

```json
{
  "status": "in_progress",
  "start": "2026-01-28T15:00:00Z",
  "end": "2026-01-28T15:30:00Z",
  "type": "follow-up",
  "notes": "Updated notes"
}
```

**Request Fields:**

| Field    | Type   | Required | Description                                              |
|----------|--------|----------|----------------------------------------------------------|
| `status` | string | No       | New status: `confirmed`, `in_progress`, `completed`, `cancelled` |
| `start`  | string | No       | ISO 8601 datetime for new start time                     |
| `end`    | string | No       | ISO 8601 datetime for new end time                       |
| `type`   | string | No       | New appointment type                                     |
| `notes`  | string | No       | Updated notes                                            |

**Response Shape (200 OK):**

```json
{
  "success": true,
  "message": "Appointment updated successfully",
  "data": {
    "id": "apt_123",
    "start": "2026-01-28T15:00:00Z",
    "end": "2026-01-28T15:30:00Z",
    "status": "in_progress",
    "type": "follow-up",
    "patient": {
      "id": "pat_22",
      "name": "John Smith"
    },
    "doctor": {
      "id": "doc_8",
      "name": "Dr. Sarah Johnson"
    },
    "notes": "Updated notes",
    "createdAt": "2026-01-20T08:30:00Z",
    "updatedAt": "2026-01-26T12:30:00Z"
  }
}
```

**Common Status Update Use Cases:**

| Current Status | New Status    | Use Case                          |
|----------------|---------------|-----------------------------------|
| `confirmed`    | `in_progress` | Doctor starts the appointment     |
| `in_progress`  | `completed`   | Doctor finishes the appointment   |
| `confirmed`    | `cancelled`   | Appointment is cancelled          |

---

### 5. Delete/Cancel Appointment

Cancel or delete an appointment.

**Endpoint:** `DELETE /appointments/{id}`

**Path Parameters:**

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| `id`      | string | Yes      | The appointment's unique ID    |

**Request Example:**

```http
DELETE /appointments/apt_123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Response Shape (200 OK):**

```json
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```

**Note:** This endpoint should perform a soft delete (set status to `cancelled`) rather than permanently deleting the record, to maintain appointment history.

---

## Status Enum

```typescript
type AppointmentStatus = "confirmed" | "in_progress" | "completed" | "cancelled";
```

| Status        | Description                                    |
|---------------|------------------------------------------------|
| `confirmed`   | Appointment is scheduled and confirmed         |
| `in_progress` | Appointment is currently in progress           |
| `completed`   | Appointment has been completed                 |
| `cancelled`   | Appointment has been cancelled                 |

---

## Error Codes

| HTTP Status | Description                                      |
|-------------|--------------------------------------------------|
| 200         | Success                                          |
| 201         | Created (for POST requests)                      |
| 400         | Bad Request - Validation errors                  |
| 401         | Unauthorized - Missing or invalid token          |
| 403         | Forbidden - User doesn't have permission         |
| 404         | Not Found - Resource doesn't exist               |
| 500         | Internal Server Error                            |

---

## TypeScript Types (Frontend Reference)

```typescript
interface AppointmentPatient {
  id: string;
  name: string;
}

interface AppointmentDoctor {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  start: string;       // ISO 8601 datetime
  end: string;         // ISO 8601 datetime
  status: "confirmed" | "in_progress" | "completed" | "cancelled";
  type: string;
  patient: AppointmentPatient;
  doctor: AppointmentDoctor;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AppointmentMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

interface AppointmentsResponse {
  success: boolean;
  appointments: Appointment[];
  meta?: AppointmentMeta;
}

interface SingleAppointmentResponse {
  success: boolean;
  data: Appointment;
}

interface CreateAppointmentRequest {
  patientId: string;
  doctorId: string;
  start: string;
  end: string;
  type: string;
  notes?: string;
}

interface UpdateAppointmentRequest {
  status?: Appointment["status"];
  start?: string;
  end?: string;
  type?: string;
  notes?: string;
}
```

---

## Frontend API Proxy Routes

The frontend uses Next.js API routes as proxies to the backend:

| Frontend Route              | Backend Route           | Method |
|-----------------------------|-------------------------|--------|
| `/api/appointments`         | `/appointments`         | GET    |
| `/api/appointments`         | `/appointments`         | POST   |
| `/api/appointments/[id]`    | `/appointments/{id}`    | GET    |
| `/api/appointments/[id]`    | `/appointments/{id}`    | PATCH  |
| `/api/appointments/[id]`    | `/appointments/{id}`    | DELETE |

---

## Notes for Backend Developer

1. **DateTime Format**: All datetime fields should use ISO 8601 format (e.g., `2026-01-26T10:00:00Z`)

2. **Soft Delete**: The DELETE endpoint should set `status = cancelled` rather than permanently deleting records

3. **View Filtering**: The `view` query parameter should filter appointments server-side for better performance

4. **Pagination**: The `meta` object is optional for now but should be implemented for large datasets

5. **Sorting**: By default, sort appointments by `start` datetime in ascending order for upcoming/today views, and descending for completed/cancelled views
