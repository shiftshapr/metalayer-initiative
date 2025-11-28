# Web-Embed SDK API Specification

## Overview

This document defines the REST API endpoints for managing Canopi embed instances, configurations, and analytics.

**Base URL**: `https://api.canopi.live/api/embeds`

**Authentication**: Bearer token (JWT) required for all endpoints except public config endpoint.

---

## Endpoints

### 1. Instance Management

#### Create Instance
```
POST /api/embeds/instances
```

**Request Body:**
```json
{
  "name": "Help Center Support",
  "description": "Canopi sidebar for help center pages",
  "communityId": "uuid-of-community",
  "domainWhitelist": ["example.com", "www.example.com"],
  "pageRules": {
    "type": "patterns",
    "patterns": ["/help/*", "/docs/*"]
  },
  "triggerConfig": {
    "type": "corner-tab",
    "position": "bottom-right",
    "message": "Need help? Chat with us!",
    "color": "#007bff",
    "size": "medium"
  }
}
```

**Response:**
```json
{
  "id": "abc123xyz",
  "name": "Help Center Support",
  "description": "Canopi sidebar for help center pages",
  "communityId": "uuid-of-community",
  "domainWhitelist": ["example.com", "www.example.com"],
  "pageRules": {
    "type": "patterns",
    "patterns": ["/help/*", "/docs/*"]
  },
  "triggerConfig": {
    "type": "corner-tab",
    "position": "bottom-right",
    "message": "Need help? Chat with us!",
    "color": "#007bff",
    "size": "medium"
  },
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "embedCode": "<script src=\"https://cdn.canopi.live/embed/v1.js\" data-canopi-id=\"abc123xyz\" async></script>"
}
```

**Status Codes:**
- `201 Created` - Instance created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - User doesn't have permission

---

#### List Instances
```
GET /api/embeds/instances
```

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `inactive`, `archived`)
- `limit` (optional): Number of results (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "instances": [
    {
      "id": "abc123xyz",
      "name": "Help Center Support",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid token

---

#### Get Instance
```
GET /api/embeds/instances/:id
```

**Response:**
```json
{
  "id": "abc123xyz",
  "name": "Help Center Support",
  "description": "Canopi sidebar for help center pages",
  "communityId": "uuid-of-community",
  "domainWhitelist": ["example.com", "www.example.com"],
  "pageRules": {
    "type": "patterns",
    "patterns": ["/help/*", "/docs/*"]
  },
  "triggerConfig": {
    "type": "corner-tab",
    "position": "bottom-right",
    "message": "Need help? Chat with us!",
    "color": "#007bff",
    "size": "medium"
  },
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Instance not found
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - User doesn't own this instance

---

#### Update Instance
```
PUT /api/embeds/instances/:id
```

**Request Body:** (all fields optional, only include fields to update)
```json
{
  "name": "Updated Name",
  "pageRules": {
    "type": "specific",
    "urls": ["/help", "/docs"]
  },
  "triggerConfig": {
    "type": "bouncing-icon",
    "position": "top-right"
  },
  "status": "inactive"
}
```

**Response:** Same as Get Instance

**Status Codes:**
- `200 OK` - Updated successfully
- `400 Bad Request` - Invalid data
- `404 Not Found` - Instance not found
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - User doesn't own this instance

---

#### Delete Instance
```
DELETE /api/embeds/instances/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Instance deleted"
}
```

**Status Codes:**
- `200 OK` - Deleted successfully
- `404 Not Found` - Instance not found
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - User doesn't own this instance

---

### 2. Public Configuration

#### Get Public Config (No Auth Required)
```
GET /api/embeds/config/:canopiId
```

**Response:**
```json
{
  "canopiId": "abc123xyz",
  "pageRules": {
    "type": "patterns",
    "patterns": ["/help/*", "/docs/*"]
  },
  "triggerConfig": {
    "type": "corner-tab",
    "position": "bottom-right",
    "message": "Need help? Chat with us!",
    "color": "#007bff",
    "size": "medium",
    "autoShowDelay": 0,
    "hideAfterClick": false,
    "showOnMobile": true
  },
  "domainWhitelist": ["example.com", "www.example.com"]
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Instance not found or inactive
- `403 Forbidden` - Domain not whitelisted (if referrer check enabled)

**Note:** This endpoint is called by the SDK to get configuration. It should be fast and cacheable.

---

### 3. Analytics

#### Track Event (No Auth Required)
```
POST /api/embeds/analytics/events
```

**Request Body:**
```json
{
  "canopiId": "abc123xyz",
  "eventType": "sidebar_open",
  "pageUrl": "https://example.com/help/getting-started",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "triggerType": "corner-tab",
    "sessionId": "session-uuid"
  }
}
```

**Event Types:**
- `page_view` - SDK loaded on page
- `trigger_impression` - Trigger icon/tab shown
- `trigger_hover` - User hovered over trigger
- `sidebar_open` - Sidebar opened
- `sidebar_close` - Sidebar closed
- `message_post` - Message posted via embed
- `auth_prompt` - Authentication prompt shown
- `auth_complete` - User authenticated

**Response:**
```json
{
  "success": true,
  "eventId": "event-uuid"
}
```

**Status Codes:**
- `200 OK` - Event tracked
- `400 Bad Request` - Invalid event data
- `404 Not Found` - Instance not found

**Rate Limiting:** 100 events per minute per IP

---

#### Get Analytics
```
GET /api/embeds/analytics/:instanceId
```

**Query Parameters:**
- `startDate` (optional): ISO date string (default: 30 days ago)
- `endDate` (optional): ISO date string (default: now)
- `groupBy` (optional): `day`, `week`, `month` (default: `day`)

**Response:**
```json
{
  "summary": {
    "totalPageViews": 1250,
    "totalTriggerImpressions": 980,
    "totalSidebarOpens": 450,
    "openRate": 0.459,
    "totalMessages": 120,
    "uniqueUsers": 320
  },
  "timeSeries": [
    {
      "date": "2024-01-15",
      "pageViews": 150,
      "triggerImpressions": 120,
      "sidebarOpens": 55,
      "messages": 15
    }
  ],
  "topPages": [
    {
      "url": "/help/getting-started",
      "pageViews": 250,
      "sidebarOpens": 120,
      "openRate": 0.48
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - User doesn't own this instance
- `404 Not Found` - Instance not found

---

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional details
  }
}
```

**Common Error Codes:**
- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - User doesn't have permission
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Request validation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `SERVER_ERROR` - Internal server error

---

## Rate Limiting

- **Authenticated endpoints**: 1000 requests per hour per user
- **Public config endpoint**: 100 requests per minute per IP
- **Analytics events**: 100 events per minute per IP

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
```

---

## CORS

Public endpoints (config, analytics events) support CORS:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Versioning

API versioning via URL path:
- Current: `/api/embeds/v1/...`
- Future: `/api/embeds/v2/...`

---

## Webhooks (Future)

Webhook support for instance events:
- `instance.created`
- `instance.updated`
- `instance.deleted`
- `instance.status_changed`






