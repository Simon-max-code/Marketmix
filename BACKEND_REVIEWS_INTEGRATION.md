# Backend Integration Guide for Reviews System

## Required Endpoints

### 1. **POST /reviews** - Create a new review
**Purpose:** Submit a new product review

**Request:**
```json
{
  "review_type": "product",
  "product_id": "1",
  "rating": 4,
  "body": "Great product! Highly recommend."
}
```

**Response (Success - 201):**
```json
{
  "status": "success",
  "data": {
    "id": "rev_123",
    "review_type": "product",
    "product_id": "1",
    "user_id": "user_123",
    "rating": 4,
    "body": "Great product! Highly recommend.",
    "createdAt": "2025-12-15T10:30:00Z",
    "userName": "John Doe"
  }
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Invalid rating. Must be between 1 and 5."
}
```

**Validations:**
- ✓ User must be authenticated (Bearer token required)
- ✓ `rating` must be 1-5 (integer)
- ✓ `body` must be 4-1200 characters
- ✓ `product_id` must exist
- ✓ `review_type` must be "product"

---

### 2. **GET /reviews/product/{productId}** - Get product reviews
**Purpose:** Fetch all reviews for a specific product (displayed on product page)

**Response:**
```json
{
  "status": "success",
  "data": {
    "reviews": [
      {
        "id": "rev_1",
        "rating": 5,
        "body": "Amazing quality!",
        "userName": "Alice",
        "createdAt": "2025-12-10T15:00:00Z"
      },
      {
        "id": "rev_2",
        "rating": 4,
        "body": "Good but could be better",
        "userName": "Bob",
        "createdAt": "2025-12-08T12:00:00Z"
      }
    ],
    "count": 2,
    "averageRating": 4.5
  }
}
```

**Query Parameters (Optional):**
- `limit` - Number of reviews (default: 10)
- `offset` - Pagination offset (default: 0)
- `sort` - "newest", "oldest", "highest", "lowest" (default: "newest")

---

### 3. **GET /reviews/my-reviews** - Get user's reviews
**Purpose:** Fetch reviews written by the logged-in user

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "reviews": [
      {
        "id": "rev_123",
        "product_id": "1",
        "productName": "Wireless Headphones",
        "rating": 5,
        "body": "Love it!",
        "createdAt": "2025-12-15T10:30:00Z",
        "status": "approved"
      }
    ]
  }
}
```

---

### 4. **PUT /reviews/{reviewId}** - Update a review
**Purpose:** Edit an existing review

**Request:**
```json
{
  "rating": 3,
  "body": "Changed my mind, not as good"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "rev_123",
    "rating": 3,
    "body": "Changed my mind, not as good",
    "updatedAt": "2025-12-15T11:00:00Z"
  }
}
```

**Validations:**
- ✓ User can only edit their own reviews
- ✓ Same validations as POST

---

### 5. **DELETE /reviews/{reviewId}** - Delete a review
**Purpose:** Remove a review

**Response:**
```json
{
  "status": "success",
  "message": "Review deleted successfully"
}
```

**Validations:**
- ✓ User can only delete their own reviews

---

### 6. **GET /orders/purchased-products** - Get user's purchased products
**Purpose:** Populate the product dropdown in "My Reviews" page

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "id": "prod_1",
        "name": "Wireless Headphones",
        "orderId": "order_123",
        "alreadyReviewed": false
      },
      {
        "id": "prod_2",
        "name": "USB-C Charger",
        "orderId": "order_124",
        "alreadyReviewed": true
      }
    ]
  }
}
```

---

## Database Schema

### `reviews` table
```sql
CREATE TABLE reviews (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body TEXT NOT NULL CHECK (LENGTH(body) >= 4 AND LENGTH(body) <= 1200),
  review_type VARCHAR(50) DEFAULT 'product', -- 'product', 'seller', etc.
  status VARCHAR(50) DEFAULT 'approved', -- 'approved', 'pending', 'flagged'
  helpful_count INT DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_product_id (product_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

### `review_media` table (Optional - for photos/videos)
```sql
CREATE TABLE review_media (
  id VARCHAR(50) PRIMARY KEY,
  review_id VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  media_type VARCHAR(20), -- 'image', 'video'
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  INDEX idx_review_id (review_id)
);
```

---

## Implementation Checklist

### Backend Requirements:
- [ ] Create `reviews` table
- [ ] Create `review_media` table (optional)
- [ ] Implement POST `/reviews` endpoint
- [ ] Implement GET `/reviews/product/{productId}` endpoint
- [ ] Implement GET `/reviews/my-reviews` endpoint
- [ ] Implement PUT `/reviews/{reviewId}` endpoint
- [ ] Implement DELETE `/reviews/{reviewId}` endpoint
- [ ] Implement GET `/orders/purchased-products` endpoint
- [ ] Add authentication middleware (verify Bearer token)
- [ ] Add input validation (rating 1-5, body length, etc.)
- [ ] Add authorization checks (users can only edit/delete their own reviews)
- [ ] Calculate and cache `averageRating` for products

### Frontend (Already Done):
- ✓ Review form with star rating UI
- ✓ Modal popup for submitting reviews
- ✓ Product page review display
- ✓ My Reviews page with filters/search
- ✓ API calls to endpoints

---

## Example Backend Implementation (Node.js/Express)

```javascript
// POST /reviews
app.post('/api/reviews', authenticate, async (req, res) => {
  try {
    const { review_type, product_id, rating, body } = req.body;
    const user_id = req.user.id;

    // Validate inputs
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ status: 'error', message: 'Rating must be 1-5' });
    }
    if (!body || body.length < 4 || body.length > 1200) {
      return res.status(400).json({ status: 'error', message: 'Review must be 4-1200 characters' });
    }
    if (!product_id || !review_type) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    // Check if product exists
    const product = await db.query('SELECT id FROM products WHERE id = ?', [product_id]);
    if (!product.length) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    // Create review
    const review_id = generateId('rev_');
    await db.query(
      'INSERT INTO reviews (id, product_id, user_id, rating, body, review_type) VALUES (?, ?, ?, ?, ?, ?)',
      [review_id, product_id, user_id, rating, body, review_type]
    );

    // Get user name
    const user = await db.query('SELECT firstName FROM users WHERE id = ?', [user_id]);
    const userName = user[0]?.firstName || 'Anonymous';

    res.status(201).json({
      status: 'success',
      data: {
        id: review_id,
        product_id,
        rating,
        body,
        userName,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /reviews/product/{productId}
app.get('/api/reviews/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 10, offset = 0, sort = 'newest' } = req.query;

    let orderBy = 'r.created_at DESC';
    if (sort === 'oldest') orderBy = 'r.created_at ASC';
    if (sort === 'highest') orderBy = 'r.rating DESC';
    if (sort === 'lowest') orderBy = 'r.rating ASC';

    const reviews = await db.query(
      `SELECT r.id, r.rating, r.body, u.firstName as userName, r.created_at as createdAt
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.status = 'approved'
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [productId, limit, offset]
    );

    const countResult = await db.query(
      'SELECT COUNT(*) as count, AVG(rating) as averageRating FROM reviews WHERE product_id = ? AND status = "approved"',
      [productId]
    );

    res.json({
      status: 'success',
      data: {
        reviews,
        count: countResult[0].count,
        averageRating: Math.round(countResult[0].averageRating * 10) / 10
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /reviews/my-reviews
app.get('/api/reviews/my-reviews', authenticate, async (req, res) => {
  try {
    const user_id = req.user.id;

    const reviews = await db.query(
      `SELECT r.id, r.product_id, p.name as productName, r.rating, r.body, r.created_at as createdAt, r.status
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [user_id]
    );

    res.json({
      status: 'success',
      data: { reviews }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT /reviews/{reviewId}
app.put('/api/reviews/:reviewId', authenticate, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, body } = req.body;
    const user_id = req.user.id;

    // Validate
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ status: 'error', message: 'Rating must be 1-5' });
    }
    if (body && (body.length < 4 || body.length > 1200)) {
      return res.status(400).json({ status: 'error', message: 'Review must be 4-1200 characters' });
    }

    // Check ownership
    const review = await db.query('SELECT user_id FROM reviews WHERE id = ?', [reviewId]);
    if (!review.length || review[0].user_id !== user_id) {
      return res.status(403).json({ status: 'error', message: 'Unauthorized' });
    }

    // Update
    await db.query(
      'UPDATE reviews SET rating = ?, body = ?, updated_at = NOW() WHERE id = ?',
      [rating, body, reviewId]
    );

    res.json({ status: 'success', message: 'Review updated' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DELETE /reviews/{reviewId}
app.delete('/api/reviews/:reviewId', authenticate, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const user_id = req.user.id;

    // Check ownership
    const review = await db.query('SELECT user_id FROM reviews WHERE id = ?', [reviewId]);
    if (!review.length || review[0].user_id !== user_id) {
      return res.status(403).json({ status: 'error', message: 'Unauthorized' });
    }

    // Soft delete
    await db.query('UPDATE reviews SET deleted_at = NOW() WHERE id = ?', [reviewId]);

    res.json({ status: 'success', message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /orders/purchased-products
app.get('/api/orders/purchased-products', authenticate, async (req, res) => {
  try {
    const user_id = req.user.id;

    const products = await db.query(
      `SELECT DISTINCT p.id, p.name, oi.order_id as orderId,
              EXISTS(SELECT 1 FROM reviews r WHERE r.product_id = p.id AND r.user_id = ?) as alreadyReviewed
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = ? AND o.status = 'completed'`,
      [user_id, user_id]
    );

    res.json({
      status: 'success',
      data: { products }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
```

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "status: 'success'" not returned | Ensure response JSON includes `{ status: 'success', data: {...} }` |
| Token not sent | Frontend must send `Authorization: Bearer {token}` header |
| Product not found | Product ID must match exactly in database |
| Rating validation fails | Ensure rating is integer 1-5, not string |
| 401 Unauthorized | Check token validity and auth middleware |
| User can edit others' reviews | Add user ID verification before update |

---

## Testing with Postman/cURL

```bash
# Test creating a review
curl -X POST http://localhost:5000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "review_type": "product",
    "product_id": "1",
    "rating": 4,
    "body": "Great product, works as described!"
  }'

# Test getting product reviews
curl http://localhost:5000/api/reviews/product/1

# Test getting my reviews
curl http://localhost:5000/api/reviews/my-reviews \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Next Steps

1. **Create the database tables** (reviews + review_media)
2. **Implement the 6 endpoints** above
3. **Add proper error handling** and validation
4. **Test with Postman** before connecting frontend
5. **Deploy to production** (your Railway backend)
6. **Test end-to-end** on your site

Once backend is ready, the frontend will work seamlessly!
