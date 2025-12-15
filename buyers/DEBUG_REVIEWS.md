# Review Submission Debugging Guide

## Steps to Debug Review Creation Error

### 1. Open Browser DevTools
- Press **F12** (or Right-click → Inspect)
- Go to the **Console** tab

### 2. Try Submitting a Review
- Go to any product page
- Click "⭐ Write Review" button
- Fill in:
  - Rating: Click 4–5 stars
  - Review text: Type at least 4 characters (e.g., "Great product!")
- Click "Submit Review"

### 3. Check Console for Errors
Look for any of these messages in the Console:

```
✅ GOOD: 
- "Submitting review to: https://marketmix-backend-production.up.railway.app/api/reviews"
- "Response status: 201"
- "Response data: {status: 'success', ...}"

❌ PROBLEMS:

1. "No authentication token found. Please log in."
   → Solution: Login first at buyers/login for buyers.html

2. "Network error - could not reach server"
   → Solution: Check internet connection; verify backend is running

3. "Response status: 400 or 422"
   → The backend rejected the data format
   → Check: Is product.id defined? Are all fields correct?

4. "Response status: 401"
   → Token expired or invalid
   → Solution: Logout and login again

5. "Response status: 500"
   → Backend error
   → Solution: Check backend logs
```

### 4. Check Network Tab
- Go to **Network** tab in DevTools
- Try submitting review again
- Look for a POST request to `/reviews`
- Click on it and check:
  - **Request Body**: Should show `{ review_type: "product", product_id: "...", rating: 4, body: "..." }`
  - **Response**: Should show `{ status: "success", data: {...} }`

### 5. Common Issues & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "NaN" rating | Star not clicked | Click a star before submitting |
| Empty review | Text not entered | Type at least 4 characters |
| "product.id undefined" | Product not loaded | Refresh page; check URL has `?id=X` |
| 401 Unauthorized | Bad/expired token | Check `localStorage.getItem('token')` in console |
| 500 Server Error | Backend issue | Contact backend team; check backend logs |

### 6. Test Token in Console
Run this in DevTools Console:
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('CONFIG.API_BASE_URL:', CONFIG.API_BASE_URL);
```

Expected output:
```
Token: eyJhbGc... (long string)
CONFIG.API_BASE_URL: https://marketmix-backend-production.up.railway.app/api
```

If Token is `null`, user is not logged in.

### 7. Manual Test (Advanced)
Test the API endpoint directly in Console:

```javascript
const token = localStorage.getItem('token');
const API_BASE_URL = CONFIG.API_BASE_URL;

fetch(`${API_BASE_URL}/reviews`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    review_type: 'product',
    product_id: '1',
    rating: 4,
    body: 'Test review from console'
  })
}).then(r => r.json()).then(d => console.log('Result:', d));
```

Check the console output for the response.

---

## Still Stuck?

1. Take a **screenshot** of the error in Console
2. Check **Network tab** → POST /reviews → Response
3. Verify you're **logged in** (`localStorage.getItem('token')` returns a value)
4. Confirm **product ID** is in the URL: `product.html?id=1`

Then share these details for further debugging.
