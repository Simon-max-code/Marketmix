// Image Gallery Component
// Displays product images with thumbnail navigation, zoom on hover, and front/back navigation

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
      <!-- Main Image with Zoom and Navigation -->
      <div class="gallery-main-image-container" style="
        background:#f1f5f9;
        border-radius:12px;
        overflow:hidden;
        aspect-ratio:1;
        display:flex;
        align-items:center;
        justify-content:center;
        position:relative
      ">
        <img id="gallery-main-img" src="${mainImage}" alt="${product.name}" style="
          width:100%;
          height:100%;
          object-fit:cover;
          cursor:zoom-in
        ">
        ${images.length > 1 ? `
          <button class="gallery-nav-button prev" id="gallery-prev" style="
            position:absolute;
            top:50%;
            left:12px;
            transform:translateY(-50%);
            background:rgba(249, 115, 22, 0.8);
            color:#fff;
            border:none;
            width:40px;
            height:40px;
            border-radius:50%;
            cursor:pointer;
            font-size:18px;
            display:flex;
            align-items:center;
            justify-content:center;
            transition:all 0.2s ease;
            z-index:10
          ">‹</button>
          <button class="gallery-nav-button next" id="gallery-next" style="
            position:absolute;
            top:50%;
            right:12px;
            transform:translateY(-50%);
            background:rgba(249, 115, 22, 0.8);
            color:#fff;
            border:none;
            width:40px;
            height:40px;
            border-radius:50%;
            cursor:pointer;
            font-size:18px;
            display:flex;
            align-items:center;
            justify-content:center;
            transition:all 0.2s ease;
            z-index:10
          ">›</button>
        ` : ''}
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

      <!-- Image counter -->
      ${images.length > 1 ? `
        <div style="text-align:center;font-size:12px;color:#64748b">
          <span id="gallery-counter">1 / ${images.length}</span>
        </div>
      ` : ''}
    </div>
  `;

  container.innerHTML = html;

  // Thumbnail click handlers
  document.querySelectorAll('.gallery-thumbnail').forEach(thumb => {
    thumb.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-idx'));
      updateGalleryImage(idx);
    });
  });

  // Navigation button handlers
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        updateGalleryImage(currentIndex - 1);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentIndex < images.length - 1) {
        updateGalleryImage(currentIndex + 1);
      }
    });
  }

  // Function to update gallery image
  function updateGalleryImage(idx) {
    currentIndex = idx;
    document.getElementById('gallery-main-img').src = images[idx];
    
    // Update thumbnail borders
    document.querySelectorAll('.gallery-thumbnail').forEach((t, i) => {
      t.style.borderColor = i === idx ? '#f97316' : '#e2e8f0';
    });

    // Update counter
    const counter = document.getElementById('gallery-counter');
    if (counter) {
      counter.textContent = `${idx + 1} / ${images.length}`;
    }

    // Update nav button states
    if (prevBtn) {
      prevBtn.disabled = idx === 0;
    }
    if (nextBtn) {
      nextBtn.disabled = idx === images.length - 1;
    }
  }

  // Initialize nav button states
  if (images.length === 1) {
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
  }
}
