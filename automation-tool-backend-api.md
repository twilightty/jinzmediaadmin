# Automation Tool - Backend API Documentation

This document describes the backend endpoints required to power the Automation tool app UI (mirrors the Admin Analytics experience: KPIs, charts, filtering, tables, CSV export).

Base URL
```
https://atmt.jinzmedia.com/api/v1/admin/
```

Auth
- Header: `Authorization: Bearer <token>`
- Content-Type: `application/json`

## 1) Auth

### POST /login
Request
```json
{ "email": "admin@example.com", "password": "string" }
```
Response
```json
{ "success": true, "data": { "token": "jwt" } }
```

---

## 2) Dashboard

### GET /dashboard/stats
Aggregated cards for the dashboard.
Response
```json
{
  "success": true,
  "data": {
    "users": { "totalUsers": 0, "activeUsers": 0, "verifiedUsers": 0, "adminUsers": 0 },
    "workflows": { "totalWorkflows": 0, "activeWorkflows": 0, "failedWorkflows": 0 },
    "jobs": { "totalJobs": 0, "recentJobs": 0, "recentSuccess": 0 },
    "recentActivity": {
      "users": [ { "_id": "id", "name": "", "email": "", "createdAt": "iso" } ],
      "jobs": [ { "_id": "id", "workflow": "Build", "status": "queued|running|success|failed", "createdAt": "iso" } ]
    }
  }
}
```

---

## 3) Analytics - KPIs and charts

All endpoints support either `period` (days) or date range `startDate`, `endDate` (YYYY-MM-DD). Return both `overall` and `period` blocks plus daily series for charts.

Query examples
```
?period=30
?startDate=2024-03-01&endDate=2024-03-31
```

### GET /analytics/workflows/stats
Response
```json
{
  "success": true,
  "data": {
    "overall": {
      "totalWorkflows": 1200,
      "activeWorkflows": 950,
      "failedWorkflows": 50
    },
    "period": {
      "totalWorkflows": 300,
      "activeWorkflows": 240,
      "failedWorkflows": 10
    },
    "dailyWorkflows": [ { "_id": "2024-03-01", "count": 12, "failed": 1 } ]
  }
}
```

### GET /analytics/jobs/stats
Response
```json
{
  "success": true,
  "data": {
    "overall": {
      "totalJobs": 5500,
      "successJobs": 5000,
      "failedJobs": 200,
      "queuedJobs": 300
    },
    "period": {
      "totalJobs": 800,
      "successJobs": 740,
      "failedJobs": 20,
      "queuedJobs": 40
    },
    "dailyJobs": [ { "_id": "2024-03-01", "count": 40, "success": 37, "failed": 1, "queued": 2 } ]
  }
}
```

### GET /analytics/costs/stats
Response
```json
{
  "success": true,
  "data": {
    "overall": {
      "totalCost": 12500000,        // Tổng tiền tất cả thời gian
      "infraCost": 7000000,         // Chi phí hạ tầng
      "executionCost": 5500000      // Chi phí thực thi
    },
    "period": {
      "totalCost": 3200000,         // Tổng tiền theo kỳ lọc
      "infraCost": 1800000,
      "executionCost": 1400000
    },
    "dailyCosts": [ { "_id": "2024-03-01", "amount": 120000 } ]
  }
}
```

---

## 4) Jobs list and details

### GET /jobs
Query
```
?page=1&pageSize=20&status=queued|running|success|failed&search=keyword&sort=createdAt:desc
```
Response
```json
{
  "success": true,
  "data": {
    "items": [
      { "_id": "id", "workflow": "Build", "status": "success", "durationMs": 12500, "createdAt": "iso" }
    ],
    "total": 1234
  }
}
```

### GET /jobs/:id
Response
```json
{
  "success": true,
  "data": {
    "_id": "id",
    "workflow": "Build",
    "status": "success",
    "durationMs": 12500,
    "logs": ["log line 1", "log line 2"],
    "createdAt": "iso",
    "updatedAt": "iso"
  }
}
```

---

## 5) Workflows

### GET /workflows
```json
{
  "success": true,
  "data": {
    "items": [ { "_id": "id", "name": "Build", "active": true } ],
    "total": 100
  }
}
```

### POST /workflows
```json
{ "name": "New Workflow", "steps": [ { "type": "http", "config": {} } ], "active": true }
```

### PATCH /workflows/:id
```json
{ "name": "Build & Test", "active": false }
```

---

## 6) CSV Exports

All list endpoints should support `?export=csv` to stream CSV.
Examples
```
GET /analytics/jobs/stats?startDate=2024-03-01&endDate=2024-03-31&export=csv
GET /jobs?status=failed&export=csv
```

---

## 7) Errors

```json
{ "success": false, "message": "Invalid date range", "error": "INVALID_DATE_RANGE" }
{ "success": false, "message": "Unauthorized", "error": "UNAUTHORIZED" }
```

---

## 8) Examples

Curl
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://atmt.jinzmedia.com/api/v1/admin/analytics/jobs/stats?startDate=2024-03-01&endDate=2024-03-31"
```

JavaScript (fetch)
```js
const res = await fetch("/api/proxy/automation/analytics/jobs/stats?period=30", {
  headers: { Authorization: `Bearer ${token}` },
  cache: "no-store"
})
const data = await res.json()
```
