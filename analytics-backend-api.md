# Analytics Backend API Documentation

This document describes the backend API endpoints required for the Analytics page functionality in the admin dashboard.

## Base URL
```
https://jinzmedia.com/api/admin/
```

## Authentication
All requests must include the authorization header:
```
Authorization: Bearer <admin_token>
```

## Endpoints

### 1. Payment Statistics

#### Endpoint
```http
GET /api/admin/payments/stats
```

#### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `period` | string | No* | Number of days to analyze (7, 30, 90, 365) | `?period=30` |
| `startDate` | string | No* | Start date for custom range (YYYY-MM-DD) | `?startDate=2024-01-01` |
| `endDate` | string | No* | End date for custom range (YYYY-MM-DD) | `?endDate=2024-01-31` |

*Either `period` OR both `startDate` and `endDate` must be provided.

#### Frontend Usage Examples

The analytics frontend now sends these query types:

**Month-based filtering:**
- Current month: `?startDate=2024-03-01&endDate=2024-03-31`
- Previous month: `?startDate=2024-02-01&endDate=2024-02-29`
- Specific month: `?startDate=2024-01-01&endDate=2024-01-31`

**Legacy period filtering:**
- Last 30 days: `?period=30`
- Last 90 days: `?period=90`

**Custom date range:**
- User-defined: `?startDate=2024-01-15&endDate=2024-02-15`

#### Response Format

```json
{
  "success": true,
  "data": {
    "overall": {
      "totalPayments": 1250,
      "totalRevenue": 50000000,
      "completedPayments": 1100,
      "pendingPayments": 120,
      "failedPayments": 30
    },
    "period": {
      "totalPayments": 350,
      "totalRevenue": 15000000,
      "completedPayments": 320,
      "pendingPayments": 25,
      "failedPayments": 5
    },
    "dailyRevenue": [
      {
        "_id": "2024-01-01",
        "revenue": 1500000,
        "count": 15
      },
      {
        "_id": "2024-01-02", 
        "revenue": 2300000,
        "count": 23
      }
    ]
  }
}
```

#### Field Descriptions

**Overall Stats** (All-time data):
- `totalPayments`: Total number of payments ever processed
- `totalRevenue`: Total revenue in VND (all-time)
- `completedPayments`: Number of successful payments
- `pendingPayments`: Number of pending payments
- `failedPayments`: Number of failed payments

**Period Stats** (Filtered by date range):
- Same fields as overall, but filtered to the specified time period

**Daily Revenue Array**:
- `_id`: Date in YYYY-MM-DD format
- `revenue`: Total revenue for that day in VND
- `count`: Number of payments processed that day

---

### 2. Transaction Statistics

#### Endpoint
```http
GET /api/admin/transactions/stats
```

#### Query Parameters

Same as Payment Statistics endpoint.

#### Response Format

```json
{
  "success": true,
  "data": {
    "overall": {
      "totalTransactions": 2340,
      "totalAmount": 75000000,
      "completedTransactions": 2100,
      "pendingTransactions": 180,
      "failedTransactions": 45,
      "cancelledTransactions": 15
    },
    "period": {
      "totalTransactions": 560,
      "totalAmount": 22000000,
      "completedTransactions": 510,
      "pendingTransactions": 35,
      "failedTransactions": 12,
      "cancelledTransactions": 3
    },
    "dailyTransactions": [
      {
        "_id": "2024-01-01",
        "amount": 2500000,
        "count": 25,
        "completed": 22,
        "pending": 2,
        "failed": 1
      },
      {
        "_id": "2024-01-02",
        "amount": 3200000,
        "count": 32,
        "completed": 30,
        "pending": 1,
        "failed": 1
      }
    ],
    "packageStats": [
      {
        "_id": "Premium Package",
        "count": 145,
        "totalAmount": 14500000,
        "completedCount": 138
      },
      {
        "_id": "Basic Package",
        "count": 89,
        "totalAmount": 4450000,
        "completedCount": 85
      }
    ]
  }
}
```

#### Field Descriptions

**Overall/Period Stats**:
- `totalTransactions`: Total number of transactions
- `totalAmount`: Total transaction amount in VND
- `completedTransactions`: Number of completed transactions
- `pendingTransactions`: Number of pending transactions
- `failedTransactions`: Number of failed transactions
- `cancelledTransactions`: Number of cancelled transactions

**Daily Transactions Array**:
- `_id`: Date in YYYY-MM-DD format
- `amount`: Total transaction amount for that day in VND
- `count`: Total number of transactions that day
- `completed`: Number of completed transactions that day
- `pending`: Number of pending transactions that day
- `failed`: Number of failed transactions that day

**Package Stats Array** (Optional):
- `_id`: Package name/identifier
- `count`: Total number of transactions for this package
- `totalAmount`: Total amount for this package in VND
- `completedCount`: Number of completed transactions for this package

---

## Implementation Guidelines

### Database Queries

#### For Date Filtering:
```javascript
// When period parameter is used
const startDate = new Date();
startDate.setDate(startDate.getDate() - parseInt(period));
const endDate = new Date();

// When custom date range is used
const startDate = new Date(req.query.startDate);
const endDate = new Date(req.query.endDate);
```

#### Aggregation Pipeline Example (MongoDB):
```javascript
// Daily revenue aggregation
const dailyRevenue = await Payment.aggregate([
  {
    $match: {
      createdAt: { $gte: startDate, $lte: endDate },
      status: "completed"
    }
  },
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      revenue: { $sum: "$amount" },
      count: { $sum: 1 }
    }
  },
  { $sort: { _id: 1 } }
]);
```

### Error Handling

#### Common Error Responses:

**Invalid Date Range:**
```json
{
  "success": false,
  "message": "Invalid date range. End date must be after start date.",
  "error": "INVALID_DATE_RANGE"
}
```

**Invalid Date Format:**
```json
{
  "success": false,
  "message": "Invalid date format. Use YYYY-MM-DD format.",
  "error": "INVALID_DATE_FORMAT"
}
```

**Missing Parameters:**
```json
{
  "success": false,
  "message": "Either 'period' or both 'startDate' and 'endDate' must be provided.",
  "error": "MISSING_PARAMETERS"
}
```

**Future Date Error:**
```json
{
  "success": false,
  "message": "Date range cannot be in the future.",
  "error": "FUTURE_DATE_RANGE"
}
```

**Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid or missing authorization token.",
  "error": "UNAUTHORIZED"
}
```

### Performance Considerations

1. **Indexing**: Ensure database indexes on `createdAt` and `status` fields
2. **Caching**: Consider caching results for frequently requested periods
3. **Aggregation**: Use database aggregation pipelines for better performance
4. **Pagination**: For large datasets, consider implementing pagination
5. **Date Validation**: Validate date ranges to prevent excessive queries

### Example Implementation (Node.js/Express)

```javascript
// payments/stats endpoint
app.get('/api/admin/payments/stats', authenticateAdmin, async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    
    // Validate parameters
    if (!period && (!startDate || !endDate)) {
      return res.status(400).json({
        success: false,
        message: "Either 'period' or both 'startDate' and 'endDate' must be provided."
      });
    }
    
    // Calculate date range
    let dateRange;
    if (period) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - parseInt(period));
      dateRange = { start, end };
    } else {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    }
    
    // Get overall stats (all-time)
    const overallStats = await getPaymentStats();
    
    // Get period stats (filtered)
    const periodStats = await getPaymentStats(dateRange);
    
    // Get daily revenue
    const dailyRevenue = await getDailyRevenue(dateRange);
    
    res.json({
      success: true,
      data: {
        overall: overallStats,
        period: periodStats,
        dailyRevenue
      }
    });
    
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});
```

## Testing

### Test Cases

1. **Period-based filtering**: Test with different period values (7, 30, 90, 365)
2. **Custom date range**: Test with various start/end date combinations
3. **Edge cases**: Same start/end date, future dates, invalid dates
4. **Data validation**: Ensure all required fields are present in response
5. **Performance**: Test with large datasets and verify response times
6. **Authentication**: Test with valid/invalid tokens

### Sample Test Data

Ensure your test database has:
- Payments/transactions across different date ranges
- Various status types (completed, pending, failed, cancelled)
- Multiple package types for package statistics
- Sufficient volume to test aggregation performance

---

## Dashboard Integration

The dashboard page currently needs a separate endpoint for current month completed transactions:

```
GET /api/admin/transactions-current-month-completed
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalAmount": 5000000
  }
}
```

This should return the total amount of completed transactions for the current calendar month.

## Notes

- All monetary amounts should be in Vietnamese Dong (VND)
- Dates should be in UTC and formatted as YYYY-MM-DD
- Package statistics are optional for the transactions endpoint
- The `/transactions/stats` endpoint may have ID validation requirements - ensure date parameters don't conflict with ID expectations
- Consider implementing rate limiting for these endpoints
- Log all requests for monitoring and debugging

## Troubleshooting

**"Invalid ID format" Error:**
- This typically occurs when the backend expects MongoDB ObjectId format but receives date strings
- Check if the endpoint URL is correct and doesn't have conflicting route patterns
- Ensure query parameters are properly formatted and expected by the backend
