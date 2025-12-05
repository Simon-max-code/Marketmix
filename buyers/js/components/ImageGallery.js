// Image Gallery Component
// Displays product images with thumbnail navigation

function createImageGallery(product) {
  const container = document.getElementById('image-gallery');
  if (!container) return;

  // Use main image or fallback
  const mainImage = product.main_image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';
  
  // Create gallery images (for now just use main image, can be extended with product_images table)
  const images = [mainImage];

  let currentIndex = 0;

  const html = `
    <div style="display:flex;flex-direction:column;gap:12px">
      <!-- Main Image -->
      <div style="
        background:#f1f5f9;
        border-radius:12px;
        overflow:hidden;
        aspect-ratio:1;
        display:flex;align-items:center;justify-content:center
      ">
        <img id="gallery-main-img" src="${mainImage}" alt="${product.name}" style="
          width:100%;
          height:100%;
          object-fit:cover
        ">
      </div>

      <!-- Thumbnails -->
      <div style="display:flex;gap:8px;overflow-x:auto">
        ${images.map((img, idx) => `
          <img 
            src="${img}" 
            alt="thumbnail ${idx + 1}"
            data-idx="${idx}"
            class="gallery-thumbnail"
            style="
              width:60px;
              height:60px;
              border-radius:8px;
              cursor:pointer;
              border:2px solid ${idx === 0 ? '#f97316' : '#e2e8f0'};
              object-fit:cover;
              transition:all 0.2s ease
            "
          >
        `).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Thumbnail click handlers
  document.querySelectorAll('.gallery-thumbnail').forEach(thumb => {
    thumb.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-idx'));
      currentIndex = idx;
      document.getElementById('gallery-main-img').src = images[idx];
      
      // Update borders
      document.querySelectorAll('.gallery-thumbnail').forEach((t, i) => {
        t.style.borderColor = i === idx ? '#f97316' : '#e2e8f0';
      });
    });
  });
}
