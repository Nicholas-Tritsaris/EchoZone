---
created: 2025-12-24T11:20:14+11:00
modified: 2025-12-24T11:30:45+11:00
---

# EchoZone – API Specification

## 1. Overview

The EchoZone API is a **REST-based, JSON-only** interface that supports anonymous, location-based social interaction across multiple platforms.

- Base path: `/api/v1/`
- Transport: HTTPS only
- Format: JSON
- Authentication: Anonymous device tokens

---

## 2. Authentication & Identity

### Anonymous Device Token
- Generated on first app launch
- Stored locally on device
- Sent with every request via header:

```
Authorization: Bearer <token>
```

- No user accounts required
- Tokens may be rotated or revoked by the server

---

## 3. Common Request Headers

```
Content-Type: application/json
Authorization: Bearer <token>
X-Platform: ios | android | wp7 | wp10 | web
X-App-Version: <version>
```

---

## 4. Data Models

### Post Object
```json
{
  "id": "string",
  "text": "string",
  "latitude": 0.0,
  "longitude": 0.0,
  "score": 0,
  "created_at": "ISO-8601",
  "expires_at": "ISO-8601",
  "reported": false
}
```

### Error Object
```json
{
  "error": "string",
  "message": "string"
}
```

---

## 5. Endpoints

### Create Post
**POST** `/api/v1/posts`

**Request Body**
```json
{
  "text": "string",
  "latitude": 0.0,
  "longitude": 0.0
}
```

**Response**
```json
{
  "post_id": "string",
  "created_at": "ISO-8601"
}
```

---

### Get Local Feed
**GET** `/api/v1/posts`

**Query Parameters**
- `lat` – latitude
- `lon` – longitude
- `radius` – meters

**Response**
```json
{
  "posts": [ Post ]
}
```

---

### Vote on Post
**POST** `/api/v1/posts/{id}/vote`

**Request Body**
```json
{
  "vote": "up" | "down"
}
```

**Response**
```json
{
  "score": 0
}
```

---

### Report Post
**POST** `/api/v1/posts/{id}/report`

**Request Body**
```json
{
  "reason": "spam | abuse | illegal | other"
}
```

**Response**
```json
{
  "status": "reported"
}
```

---

## 6. Moderation (Admin Only)

- **List Reports**  
  GET `/api/v1/admin/reports`

- **Remove Post**  
  DELETE `/api/v1/admin/posts/{id}`

- **Ban Device**  
  POST `/api/v1/admin/ban`

---

## 7. Rate Limiting

- Post creation: limited per device per hour  
- Voting: limited per device per minute  
- Reporting: limited per device per day  

Limits enforced server-side.

---

## 8. Error Codes

| Status | Meaning |
|--------|--------|
| 400    | Invalid request |
| 401    | Unauthorized |
| 403    | Forbidden |
| 404    | Not found |
| 429    | Rate limit exceeded |
| 500    | Server error |

---

## 9. API Versioning

- Versioned via URL path  
- Backward-compatible changes only  
- Deprecated endpoints announced in advance  

---

## 10. Security Considerations

- All input validated server-side  
- Location data never trusted from client alone  
- Tokens revocable at any time  
- Abuse patterns logged and monitored  

---

If you want, I can next:  
- Produce **roadmap.md** in final copy-ready form  
- Generate **OpenAPI / Swagger** definitions  
- Write **backend skeleton code** matching this API  
- Add **rate-limit and abuse logic**
