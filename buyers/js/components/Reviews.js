// Reviews Component
// Displays ratings and customer reviews

function createReviews(product) {
  const container = document.getElementById('reviews-section');
  if (!container) return;

  const rating = product.rating || 0;
  const reviewCount = product.review_count || 0;
  const reviews = product.reviews || [];

  // Generate star rating
  function renderStars(rating, size = '16') {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars += `<span style="color:#f97316;font-size:${size}px">★</span>`;
      } else if (i - rating < 1 && i - rating > 0) {
        stars += `<span style="color:#f97316;font-size:${size}px">★</span>`;
      } else {
        stars += `<span style="color:#cbd5e1;font-size:${size}px">★</span>`;
      }
    }
    return stars;
  }

  const html = `
    <div style="padding:16px;border:1px solid #e2e8f0;border-radius:12px;background:#fafafa">
      <!-- Rating Summary -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid #e2e8f0">
        <div style="text-align:center">
          <div style="font-size:36px;font-weight:700;color:#1e293b">${rating.toFixed(1)}</div>
          <div style="display:flex;gap:2px">${renderStars(rating, '14')}</div>
          <div style="font-size:12px;color:#64748b;margin-top:4px">${reviewCount} reviews</div>
        </div>
      </div>

      <!-- Reviews List -->
      <div>
        <h3 style="margin:0 0 16px;font-size:16px;font-weight:700;color:#1e293b">Customer Reviews</h3>
        
        ${reviews.length > 0 ? `
          ${reviews.slice(0, 5).map((review, idx) => `
            <div style="padding:12px 0;border-bottom:1px solid #e2e8f0">
              <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
                <div style="font-weight:600;color:#334155">Anonymous User</div>
                <div style="display:flex;gap:2px;font-size:12px">${renderStars(review.rating || 0, '12')}</div>
              </div>
              <p style="margin:0;font-size:14px;color:#475569;line-height:1.5">${review.comment || 'Good product'}</p>
              <div style="font-size:12px;color:#94a3b8;margin-top:4px">${new Date(review.created_at).toLocaleDateString()}</div>
            </div>
          `).join('')}
        ` : `
          <p style="color:#94a3b8;font-size:14px;text-align:center;padding:20px">No reviews yet. Be the first to review!</p>
        `}
      </div>
    </div>
  `;

  container.innerHTML = html;
}
