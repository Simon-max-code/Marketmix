// Category Options Component
// Displays color and size options based on category rules
// Disables Add to Cart until required options are selected

function createCategoryOptions(product) {
  const container = document.getElementById('category-options');
  if (!container) return;

  const rules = getCategoryRules(product.category);
  const { showColors, showSizes } = rules;

  // Helper function to parse color/size data from various formats
  function parseOptions(data) {
    if (!data) return [];
    
    // If already an array, return it
    if (Array.isArray(data)) {
      return data.filter(item => item); // Remove null/undefined
    }
    
    // If string, try to parse as JSON array
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => item);
        }
      } catch (e) {
        // If JSON parse fails, split by comma
        return data.split(',').map(item => item.trim()).filter(item => item);
      }
    }
    
    return [];
  }

  // Options come from product data when available
  let colors = parseOptions(product.color);
  let sizes = parseOptions(product.size);

  // Console logging for debugging
  console.log('Product data:', { 
    id: product.id, 
    name: product.name,
    color_raw: product.color,
    color_parsed: colors,
    size_raw: product.size,
    size_parsed: sizes,
    showColors,
    showSizes
  });

  // Fallback to default options if none found but category requires them
  if (colors.length === 0 && showColors) {
    colors = ['Black', 'White', 'Red', 'Blue', 'Green'];
  }
  if (sizes.length === 0 && showSizes) {
    sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  }

  let selectedColor = null;
  let selectedSize = null;

  const html = `
    <div style="padding:16px;border:1px solid #e2e8f0;border-radius:12px;background:#fafafa">
      ${showColors ? `
        <div style="margin-bottom:16px">
          <label style="display:block;font-weight:600;margin-bottom:8px;color:#334155">Color</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap" id="color-options">
            ${colors.map((color, idx) => `
              <button 
                class="color-btn"
                data-color="${color}"
                style="
                  padding:8px 12px;
                  border:2px solid #d1d5db;
                  border-radius:8px;
                  background:#fff;
                  cursor:pointer;
                  font-size:14px;
                  font-weight:500;
                  transition:all 0.2s ease;
                  color:#475569
                "
              >
                ${color}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${showSizes ? `
        <div style="margin-bottom:16px">
          <label style="display:block;font-weight:600;margin-bottom:8px;color:#334155">Size</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap" id="size-options">
            ${sizes.map((size) => `
              <button 
                class="size-btn"
                data-size="${size}"
                style="
                  padding:8px 12px;
                  border:2px solid #d1d5db;
                  border-radius:8px;
                  background:#fff;
                  cursor:pointer;
                  font-size:14px;
                  font-weight:500;
                  transition:all 0.2s ease;
                  color:#475569;
                  min-width:40px;
                  text-align:center
                "
              >
                ${size}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div id="options-status" style="font-size:12px;color:#f97316;margin-top:8px;display:none">
        ⚠️ Please select all options above before adding to cart
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Color button handlers
  if (showColors) {
    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.color-btn').forEach(b => {
          b.style.borderColor = '#d1d5db';
          b.style.backgroundColor = '#fff';
          b.style.color = '#475569';
        });
        e.target.style.borderColor = '#f97316';
        e.target.style.backgroundColor = '#f97316';
        e.target.style.color = '#fff';
        selectedColor = e.target.getAttribute('data-color');
        checkCanAddToCart();
      });

  // Size button handlers
  if (showSizes) {
    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.size-btn').forEach(b => {
          b.style.borderColor = '#d1d5db';
          b.style.backgroundColor = '#fff';
          b.style.color = '#475569';
        });
        e.target.style.borderColor = '#f97316';
        e.target.style.backgroundColor = '#f97316';
        e.target.style.color = '#fff';
        selectedSize = e.target.getAttribute('data-size');
        checkCanAddToCart();
      });
    });
  }

  function checkCanAddToCart() {
    const addToCartBtn = document.getElementById('product-add-to-cart');
    const statusDiv = document.getElementById('options-status');

    const colorRequired = showColors && !selectedColor;
    const sizeRequired = showSizes && !selectedSize;

    if (colorRequired || sizeRequired) {
      addToCartBtn.disabled = true;
      addToCartBtn.style.opacity = '0.5';
      addToCartBtn.style.cursor = 'not-allowed';
          // Get category rules, but override based on actual product data
          const rules = getCategoryRules(product.category);
  
          // If product has color data, show colors (override category rules)
          const showColors = colors.length > 0 || rules.showColors;
  
          // If product has size data, show sizes (override category rules)
          const showSizes = sizes.length > 0 || rules.showSizes;
      statusDiv.style.display = 'block';
    } else {
      addToCartBtn.disabled = false;
      addToCartBtn.style.opacity = '1';
      addToCartBtn.style.cursor = 'pointer';
            category: product.category,
      statusDiv.style.display = 'none';
    }
  }

            categoryRules: { showColors: rules.showColors, showSizes: rules.showSizes },
            finalShowColors: showColors,
            finalShowSizes: showSizes
    setTimeout(() => checkCanAddToCart(), 100);
  }

  // Store selections globally for add-to-cart
  window.productOptions = {
    color: () => selectedColor,
    size: () => selectedSize
  };
}
