// Flash Sale Component
// Displays flash sale info if available

function createFlashSale(product) {
  const container = document.getElementById('flash-sale-section');
  if (!container) return;

  // Determine flash sale using flash_start/flash_end OR helper flags
  const now = new Date();
  const flashStart = product.flash_start ? new Date(product.flash_start) : null;
  const flashEnd = product.flash_end ? new Date(product.flash_end) : null;
  const isActive = product.flash_sale_active || (flashStart && flashEnd && now >= flashStart && now <= flashEnd);

  // Determine discount and sale price. The backend may return either:
  // - flash_sale_discount: absolute savings (number)
  // - flash_sale_discount_percent: percent discount
  // - effective_price: final sale price
  let salePrice = null;
  let savings = null;
  let percent = null;

  if (product.effective_price) {
    salePrice = Number(product.effective_price);
    savings = Number(product.price) - salePrice;
    percent = ((savings / Number(product.price)) * 100).toFixed(1);
  } else if (product.flash_sale_discount_percent) {
    percent = Number(product.flash_sale_discount_percent);
    salePrice = (Number(product.price) * (100 - percent) / 100);
    savings = Number(product.price) - salePrice;
  } else if (product.flash_sale_discount) {
    // treat as absolute savings if it's less than price, otherwise assume percent
    const val = Number(product.flash_sale_discount);
    if (val > 0 && val < Number(product.price)) {
      // If val seems like savings (e.g., 10 means $10 off)
      savings = val;
      salePrice = Number(product.price) - savings;
      percent = ((savings / Number(product.price)) * 100).toFixed(1);
    } else if (val > 0) {
      // fallback: treat as percent
      percent = val;
      salePrice = (Number(product.price) * (100 - percent) / 100);
      savings = Number(product.price) - salePrice;
    }
  }

  if (!isActive || salePrice === null || isNaN(salePrice)) {
    container.style.display = 'none';
    return;
  }

  salePrice = salePrice.toFixed(2);
  savings = (Number(savings) || 0).toFixed(2);
  const timeRemainingMs = flashEnd ? Math.max(0, flashEnd - now) : 0;
  const hours = Math.floor(timeRemainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const timeStr = `${hours}h ${minutes}m`;

  const html = `
    <div style="
      background:linear-gradient(135deg, #f97316, #EA580C);
      color:#fff;
      padding:16px;
      border-radius:12px;
      margin-bottom:16px
    ">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div>
          <h3 style="margin:0 0 4px;font-size:18px;font-weight:700">⚡ Flash Sale</h3>
          <p style="margin:0;font-size:14px;opacity:0.9">${discount}% OFF • Ends in ${timeStr}</p>
        </div>
        <div style="text-align:right">
          <div style="font-size:32px;font-weight:700">${discount}%</div>
          <div style="font-size:12px;opacity:0.9">OFF</div>
        </div>
      </div>
      
      <div style="background:rgba(0,0,0,0.2);padding:12px;border-radius:8px;font-size:14px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <span style="opacity:0.9">Original: </span>
            <span style="text-decoration:line-through;opacity:0.7">$${product.price}</span>
          </div>
          <div style="font-weight:700">
            Sale Price: <span style="font-size:20px">$${salePrice}</span>
          </div>
        </div>
        <div style="margin-top:8px;opacity:0.9">
          💰 You save: $${savings}
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
  container.style.display = 'block';
}
