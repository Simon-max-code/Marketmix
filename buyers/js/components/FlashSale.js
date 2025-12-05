// Flash Sale Component
// Displays flash sale info if available

function createFlashSale(product) {
  const container = document.getElementById('flash-sale-section');
  if (!container) return;

  // Check if flash sale is active
  if (!product.flash_sale_active || !product.flash_sale_discount) {
    container.style.display = 'none';
    return;
  }

  const discount = product.flash_sale_discount || 0;
  const salePrice = (product.price * (100 - discount) / 100).toFixed(2);
  const savings = (product.price - salePrice).toFixed(2);

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
          <p style="margin:0;font-size:14px;opacity:0.9">${discount}% OFF</p>
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
