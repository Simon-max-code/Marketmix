// Wait DOM
document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------
     Elements
  ------------------------- */
  const form = document.getElementById('storeSetupForm');

  // ensure we have a Supabase client instance available for any page that needs it
  // if a client already exists globally, reuse it; otherwise load the CDN and create one
  let supabaseClientInstance;
  async function getSupabaseClient() {
    if (supabaseClientInstance) return supabaseClientInstance;

    // ensure global CONFIG is available (load config.js if not yet present)
    if (typeof CONFIG === 'undefined') {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = '../config.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      }).catch(err => {
        console.warn('Failed loading config.js', err);
      });
    }

    // helper to read config from various places
    function retrieveConfig() {
      if (typeof CONFIG !== 'undefined' && CONFIG && CONFIG.SUPABASE && CONFIG.SUPABASE.URL && CONFIG.SUPABASE.KEY) {
        return { url: CONFIG.SUPABASE.URL, key: CONFIG.SUPABASE.KEY };
      }
      if (typeof window !== 'undefined' && window.CONFIG && window.CONFIG.SUPABASE && window.CONFIG.SUPABASE.URL && window.CONFIG.SUPABASE.KEY) {
        return { url: window.CONFIG.SUPABASE.URL, key: window.CONFIG.SUPABASE.KEY };
      }
      // allow overrides via localStorage for quick testing
      const urlLS = localStorage.getItem('SUPABASE_URL');
      const keyLS = localStorage.getItem('SUPABASE_KEY');
      if (urlLS && keyLS) return { url: urlLS, key: keyLS };
      return null;
    }

    const cfg = retrieveConfig();
    if (!cfg) {
      throw new Error('Supabase configuration not found');
    }

    // if a namespace is already present with createClient, use it
    if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
      supabaseClientInstance = window.supabase.createClient(cfg.url, cfg.key);
      return supabaseClientInstance;
    }

    // otherwise dynamically load the CDN build of supabase-js
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });

    if (!(window.supabase && typeof window.supabase.createClient === 'function')) {
      throw new Error('Failed to load Supabase client library');
    }
    supabaseClientInstance = window.supabase.createClient(cfg.url, cfg.key);
    return supabaseClientInstance;
  }

  // seller profile initialization logic will run on load to sync with Supabase
  async function initializeSellerProfile() {
    try {
      const supabase = await getSupabaseClient();
      let user = null;
      try {
        const {
          data: { user: u },
          error: userErr
        } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        user = u;
      } catch (authErr) {
        console.warn('initializeSellerProfile: supabase.auth.getUser failed', authErr);
        // If the auth session is missing (e.g. redirect after signup lost session),
        // try to recover user info from localStorage where signup/login may have saved it.
        const userKey = (typeof CONFIG !== 'undefined' && CONFIG && CONFIG.STORAGE_KEYS && CONFIG.STORAGE_KEYS.USER) ? CONFIG.STORAGE_KEYS.USER : 'user';
        try {
          const raw = localStorage.getItem(userKey);
          if (raw) {
            user = JSON.parse(raw);
            console.log('initializeSellerProfile: recovered user from localStorage key', userKey, user);
          }
        } catch (lsErr) {
          console.warn('initializeSellerProfile: failed to parse user from localStorage', lsErr);
        }

        // If still no user, only proceed if we can obtain minimal info; otherwise abort silently
        if (!user) {
          console.log('initializeSellerProfile: no authenticated user available; aborting initialization');
          return;
        }
      }

      // decide whether we had an active Supabase session
      let hadActiveSession = false;

      // Try to detect an active session
      try {
        const sessionRes = await supabase.auth.getSession();
        if (sessionRes && sessionRes.data && sessionRes.data.session) hadActiveSession = true;
      } catch (e) {
        // no active session
      }

      // Try backend fallback first if no active Supabase session
      let profile = null;
      if (!hadActiveSession) {
        const tokenKey = (typeof CONFIG !== 'undefined' && CONFIG && CONFIG.STORAGE_KEYS && CONFIG.STORAGE_KEYS.TOKEN) ? CONFIG.STORAGE_KEYS.TOKEN : 'token';
        const token = sessionStorage.getItem(tokenKey) || localStorage.getItem(tokenKey);
        const overrideUrl = localStorage.getItem('API_BASE_URL');
        const apiBase = overrideUrl || ((typeof CONFIG !== 'undefined' && CONFIG && CONFIG.API_BASE_URL) ? CONFIG.API_BASE_URL : (window.location.origin + '/api'));
        const url = `${apiBase.replace(/\/+$/, '')}/seller/profile`;

        if (token) {
          try {
            const res = await fetch(url, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            if (res.ok) {
              const json = await res.json();
              profile = json?.data?.seller?.profile || null;
              console.log('initializeSellerProfile: recovered profile from backend', profile);
            } else {
              console.warn('initializeSellerProfile: backend profile fetch failed', res.status, await res.text());
            }
          } catch (e) {
            console.warn('initializeSellerProfile: backend fetch error', e);
          }
        } else {
          console.log('initializeSellerProfile: no token found for backend fetch');
        }
      }

      // If we still don't have a profile and we do have an active session, query Supabase directly
      if (!profile && hadActiveSession) {
        let { data: fetched, error: selErr } = await supabase
          .from('seller_profiles')
          .select('id,user_id,business_email,business_phone,business_name,business_address')
          .eq('user_id', user.id)
          .single();

        if (selErr && selErr.code !== 'PGRST116') {
          throw selErr;
        }
        profile = fetched;
        console.log('initializeSellerProfile: fetched profile via supabase', profile);

        if (!profile) {
          // create only when session active
          const insertObj = {
            user_id: user.id,
            business_email: user.email
          };
          if (user.phone) insertObj.business_phone = user.phone;
          if (user?.user_metadata?.business_name) insertObj.business_name = user.user_metadata.business_name;
          if (user?.user_metadata?.business_address) insertObj.business_address = user.user_metadata.business_address;

          const {
            data: inserted,
            error: insertErr
          } = await supabase
            .from('seller_profiles')
            .insert(insertObj)
            .select('id,user_id,business_email,business_phone,business_name,business_address')
            .single();
          if (insertErr) throw insertErr;
          profile = inserted;
          console.log('initializeSellerProfile: created new profile via supabase', profile);
        }
      }

      // helper to read either snake_case (supabase) or camelCase (backend) property
      function pick(field) {
        return profile?.[field] ?? profile?.[field.replace(/_([a-z])/g, (m,p)=>p.toUpperCase())];
      }

      console.log('initializeSellerProfile: raw profile object', JSON.stringify(profile));

      const emailVal = pick('business_email');
      const phoneVal = pick('business_phone');
      const nameVal = pick('business_name');
      const addressVal = pick('business_address');

      if (emailVal) email.value = emailVal;
      if (phoneVal) phone.value = phoneVal;
      if (nameVal) {
        storeName.value = nameVal;
      } else if (user?.user_metadata?.business_name) {
        storeName.value = user.user_metadata.business_name;
      }
      if (addressVal) {
        address.value = addressVal;
      } else if (user?.user_metadata?.business_address) {
        address.value = user.user_metadata.business_address;
      }

      // Manually update preview elements (setting input.value doesn't trigger 'input' event listeners)
      previewEmail.textContent = emailVal || '—';
      previewPhone.textContent = phoneVal || '—';
      previewAddress.textContent = addressVal || '—';
      previewName.textContent = (nameVal || user?.user_metadata?.business_name || 'Your Store Name');
      previewDesc.textContent = storeDesc.value.trim() || 'Store description will appear here.';

      console.log('initializeSellerProfile: after populate form', {
        email: email.value,
        phone: phone.value,
        storeName: storeName.value,
        address: address.value
      });

      // if profile already has email verified, update UI accordingly
      if (profile && profile.isVerified) {
        verifyEmailBtn.textContent = 'Verified';
        verifyEmailBtn.disabled = true;
        emailError.textContent = 'Email already verified.';
        emailError.style.color = 'green';
      }

      // preselect category: try localStorage first, then parse from businessDescription if available
      try {
        let sc = localStorage.getItem('signupCategory');
        console.log('initializeSellerProfile: signupCategory from localStorage', sc);
        
        // if not in localStorage, try to extract from businessDescription (backend format)
        if (!sc && profile?.businessDescription) {
          console.log('initializeSellerProfile: parsing businessDescription', profile.businessDescription);
          const match = profile.businessDescription.match(/Product Category:\s*([^|]+)/);
          if (match && match[1]) {
            sc = match[1].trim();
            console.log('initializeSellerProfile: extracted category from businessDescription', sc);
          }
        }
        
        if (sc) {
          console.log('initializeSellerProfile: attempting to match category', sc, 'against defaults:', defaultCategories);
          // normalize to find matching category (case-insensitive)
          const normalized = sc.toLowerCase();
          const matchedCat = defaultCategories.find(cat => cat.toLowerCase() === normalized);
          
          if (matchedCat) {
            selectedCategory = matchedCat;
            renderChips();
            updatePreviewCategories();
            console.log('initializeSellerProfile: preselected category', matchedCat);
          } else {
            console.log('initializeSellerProfile: no matching category found for', sc, '(normalized:', normalized + ')');
          }
          // clear localStorage so we don't reuse it later
          localStorage.removeItem('signupCategory');
        } else {
          console.log('initializeSellerProfile: no category found to preselect');
        }
      } catch (e) {
        console.warn('Failed to process signupCategory', e);
      }
    } catch (err) {
      console.error('initializeSellerProfile error:', err);
    }
  }

  // Logo drop & preview
  const logoInput = document.getElementById('storeLogo');
  const logoDrop = document.getElementById('logoDrop');
  const logoPreview = document.getElementById('logoPreview');
  const logoPreviewWrap = document.getElementById('logoPreviewWrap');
  const removeLogoBtn = document.getElementById('removeLogo');
  const errorLogo = document.getElementById('error-logo');

  // Fields
  const storeName = document.getElementById('storeName');
  const storeDesc = document.getElementById('storeDesc');
  const wordCount = document.getElementById('wordCount');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  const address = document.getElementById('address');
  const website = document.getElementById('website');

  // Category chips & modal
  const categoryChips = document.getElementById('categoryChips');
  const openAddCategory = document.getElementById('openAddCategory');
  const categoryModal = document.getElementById('categoryModal');
  const closeCategoryModal = document.getElementById('closeCategoryModal');
  const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
  const saveCategoryBtn = document.getElementById('saveCategoryBtn');
  const newCategoryInput = document.getElementById('newCategoryInput');
  const errorCategory = document.getElementById('error-category');

  // Gallery (multiple images)
  const galleryInput = document.getElementById('galleryInput');
  const galleryGrid = document.getElementById('galleryGrid');
  let galleryFiles = []; // store dataurl objects

  // Socials
  const toggleSocials = document.getElementById('toggleSocials');
  const socialsSection = document.getElementById('socialsSection');

  // Preview elements
  const previewLogo = document.getElementById('previewLogo');
  const previewNoImg = document.getElementById('previewNoImg');
  const previewName = document.getElementById('previewName');
  const previewDesc = document.getElementById('previewDesc');
  const previewAddress = document.getElementById('previewAddress');
  const previewEmail = document.getElementById('previewEmail');
  const previewPhone = document.getElementById('previewPhone');
  const previewCats = document.getElementById('previewCats');
  const previewGallery = document.getElementById('previewGallery');
  const previewSocials = document.getElementById('previewSocials');
  const mapFrame = document.getElementById('mapFrame');


  /* -------------------------
     Utilities
  ------------------------- */
  function showError(el, msg){
    if(!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    el.previousElementSibling && el.previousElementSibling.classList && el.previousElementSibling.classList.add('invalid');
  }
  function clearError(el){
    if(!el) return;
    el.textContent = '';
    el.style.display = 'none';
    el.previousElementSibling && el.previousElementSibling.classList && el.previousElementSibling.classList.remove('invalid');
  }
  function wordCountValue(text){
    if(!text) return 0;
    // count words
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  /* -------------------------
     Default categories (chips)
  ------------------------- */
  const defaultCategories = ['Fashion','Electronics','Beauty & Personal Care','Home & Living','Sports & Outdoors'];
  let selectedCategory = ''; // single selection for now

  function renderChips(){
    categoryChips.innerHTML = '';
    [...defaultCategories].forEach(cat => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = cat;
      if(cat === selectedCategory) chip.classList.add('selected');
      chip.addEventListener('click', () => {
        selectedCategory = cat;
        renderChips();
        updatePreviewCategories();
        clearError(errorCategory);
      });
      categoryChips.appendChild(chip);
    });
  }
  renderChips();

  // after rendering categories ensure seller profile exists and fields are prefilling
  initializeSellerProfile();

  /* -------------------------
     Category modal logic
  ------------------------- */
  openAddCategory.addEventListener('click', () => {
    categoryModal.style.display = 'flex';
    newCategoryInput.value = '';
    newCategoryInput.focus();
  });
  closeCategoryModal.addEventListener('click', () => categoryModal.style.display = 'none');
  cancelCategoryBtn.addEventListener('click', () => categoryModal.style.display = 'none');
  saveCategoryBtn.addEventListener('click', () => {
    const v = newCategoryInput.value.trim();
    if(!v) return alert('Please enter a category name.');
    // add to defaults and select
    defaultCategories.push(v);
    selectedCategory = v;
    renderChips();
    categoryModal.style.display = 'none';
    updatePreviewCategories();
    clearError(errorCategory);
  });
  window.addEventListener('click', (e) => {
    if(e.target === categoryModal) categoryModal.style.display = 'none';
  });

  /* -------------------------
     Logo drag & drop + preview + remove
  ------------------------- */
  logoDrop.addEventListener('dragover', (e) => { e.preventDefault(); logoDrop.classList.add('dragover'); });
  logoDrop.addEventListener('dragleave', () => logoDrop.classList.remove('dragover'));
  logoDrop.addEventListener('drop', (e) => {
    e.preventDefault();
    logoDrop.classList.remove('dragover');
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if(f) logoInputFileHandler(f);
  });

  logoInput.addEventListener('change', (e) => {
    const f = e.target.files[0];
    if(f) logoInputFileHandler(f);
  });

  function logoInputFileHandler(file){
    if(!file.type.startsWith('image/')) return alert('Please upload an image file.');
    const reader = new FileReader();
    reader.onload = (ev) => {
      logoPreview.src = ev.target.result;
      logoPreview.style.display = 'block';
      previewLogo.src = ev.target.result;
      previewLogo.style.display = 'block';
      previewNoImg.style.display = 'none';
      removeLogoBtn.style.display = 'inline-block';
      clearError(errorLogo);
    };
    reader.readAsDataURL(file);
  }

  removeLogoBtn.addEventListener('click', () => {
    logoInput.value = '';
    logoPreview.src = '';
    logoPreview.style.display = 'none';
    removeLogoBtn.style.display = 'none';
    previewLogo.src = '';
    previewLogo.style.display = 'none';
    previewNoImg.style.display = 'block';
  });

  /* -------------------------
     Gallery multiple images (max 3)
  ------------------------- */
  galleryInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files).slice(0,3 - galleryFiles.length);
    files.forEach(file => {
      if(!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        galleryFiles.push(ev.target.result);
        renderGallery();
      };
      reader.readAsDataURL(file);
    });
    // clear file input so same file can be reselected later if removed
    galleryInput.value = '';
  });

  function renderGallery(){
    galleryGrid.innerHTML = '';
    previewGallery.innerHTML = '';
    galleryFiles.forEach((src, idx) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      // NOTE: Validate or sanitize user-supplied image URLs before inserting them into the DOM
      item.innerHTML = `<img src="${src}" alt="showcase ${idx+1}"><button type="button" class="remove-gallery" data-i="${idx}">✕</button>`;
      galleryGrid.appendChild(item);

      const pImg = document.createElement('img');
      pImg.src = src;
      previewGallery.appendChild(pImg);
    });

    // attach remove handlers
    galleryGrid.querySelectorAll('.remove-gallery').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.i);
        galleryFiles.splice(i,1);
        renderGallery();
      });
    });
  }

  /* -------------------------
     Socials toggling and preview
  ------------------------- */
  if(toggleSocials) {
    toggleSocials.addEventListener('click', () => {
      socialsSection.classList.toggle('active');
      toggleSocials.textContent = socialsSection.classList.contains('active') ? '− Hide Social Links' : '+ Add Social Links';
    });
  }

  // update preview socials when inputs change
  ['social-facebook','social-x','social-tiktok','social-ig','social-telegram'].forEach(id => {
    const el = document.getElementById(id);
    if(el){
      el.addEventListener('input', updatePreviewSocials);
    }
  });

  function updatePreviewSocials(){
    previewSocials.innerHTML = '';
    const map = [
      {id:'social-facebook', icon:'fab fa-facebook', label:'Facebook'},
      {id:'social-x', icon:'fab fa-x-twitter', label:'X'},
      {id:'social-tiktok', icon:'fab fa-tiktok', label:'TikTok'},
      {id:'social-ig', icon:'fab fa-instagram', label:'Instagram'},
      {id:'social-telegram', icon:'fab fa-telegram', label:'Telegram'}
    ];
    map.forEach(s => {
      const v = document.getElementById(s.id)?.value.trim();
      if(v){
        const a = document.createElement('a');
        a.href = v;
        a.target = '_blank';
        a.rel = 'noopener';
        // NOTE: Ensure s.icon and s.label originate from trusted sources or are sanitized
        a.innerHTML = `<i class="${s.icon}"></i> ${s.label}`;
        previewSocials.appendChild(a);
      }
    });
  }

  /* -------------------------
     Live validation & preview updates
  ------------------------- */

  // live preview for name & description & contact & address
  storeName.addEventListener('input', () => {
    previewName.textContent = storeName.value.trim() || 'Your Store Name';
    if(storeName.value.trim()) clearError(document.getElementById('error-storeName'));
    validateField(storeName);
  });

  storeDesc.addEventListener('input', () => {
    const wc = wordCountValue(storeDesc.value);
    wordCount.textContent = `${wc} / 250 words`;
    previewDesc.textContent = storeDesc.value.trim() || 'Store description will appear here.';
    if(wc > 250) wordCount.style.color = 'var(--danger)';
    else wordCount.style.color = '';
  });

  email.addEventListener('input', () => {
    previewEmail.textContent = email.value.trim() || '—';
    validateField(email);
  });

  phone.addEventListener('input', () => {
    previewPhone.textContent = phone.value.trim() || '—';
    validateField(phone);
  });

  address.addEventListener('input', () => {
    previewAddress.textContent = address.value.trim() || '—';
    validateField(address);
    updateMap(address.value.trim());
  });

  website.addEventListener('input', () => {
    // no validation for optional website in live mode
  });

  // generic validator for required simple fields
  function validateField(input){
    const id = input.id;
    const err = document.getElementById('error-' + id);
    if(!input.value || !input.value.trim()){
      showError(err, `${labelOf(input)} is required.`);
      input.style.borderColor = 'rgba(255,77,77,0.6)';
      return false;
    } else {
      // additional checks
      if(input.type === 'email'){
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!re.test(input.value.trim())){
          showError(err, 'Enter a valid email.');
          input.style.borderColor = 'rgba(255,77,77,0.6)';
          return false;
        }
      }
      // phone min length check (basic)
      if(input.id === 'phone' && input.value.trim().length < 6){
        showError(err, 'Enter a valid phone number.');
        input.style.borderColor = 'rgba(255,77,77,0.6)';
        return false;
      }

      input.style.borderColor = 'rgba(77,163,255,0.6)';
      clearError(err);
      return true;
    }
  }

  function labelOf(el){
    const lbl = el.closest('.form-group')?.querySelector('label')?.textContent || el.id;
    return lbl.replace('*','').trim();
  }

  /* -------------------------
     Preview categories
  ------------------------- */
  function updatePreviewCategories(){
    previewCats.innerHTML = '';
    if(selectedCategory){
      const c = document.createElement('div');
      c.className = 'preview-cat';
      c.textContent = selectedCategory;
      previewCats.appendChild(c);
      clearError(errorCategory);
    }
  }

  /* -------------------------
     Map update (frontend only)
     Uses google maps query embed - no API key required
  ------------------------- */
  function updateMap(addr){
    if(!addr){
      mapFrame.src = '';
      return;
    }
    const q = encodeURIComponent(addr);
    mapFrame.src = `https://www.google.com/maps?q=${q}&output=embed`;
  }

  /* -------------------------
     Word-limit enforcement on submit (250 words)
  ------------------------- */
  function checkDescriptionLimit(){
    const wc = wordCountValue(storeDesc.value);
    if(wc > 250){
      wordCount.style.color = 'var(--danger)';
      return false;
    }
    return true;
  }

  /* -------------------------
     Form submission validation (final)
  ------------------------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // clear errors
    ['logo','storeName','email','phone','address','category'].forEach(id => {
      const el = document.getElementById('error-'+id);
      if(el) clearError(el);
    });

    let valid = true;

    // Logo required
    if(!logoInput.value){
      showError(errorLogo,'Store logo is required.');
      valid = false;
    }

    // name
    if(!validateField(storeName)) valid = false;

    // email
    if(!validateField(email)) valid = false;

    // phone
    if(!validateField(phone)) valid = false;

    // address
    if(!validateField(address)) valid = false;

    // category selected?
    if(!selectedCategory){
      showError(errorCategory, 'Please select or add a category.');
      valid = false;
    }

    // description limit
    if(!checkDescriptionLimit()){
      valid = false;
      alert('Description exceeds 250 words. Please shorten it.');
    }

    if(!valid){
      // scroll top of form to show errors
      form.scrollIntoView({behavior:'smooth', block:'center'});
      return;
    }

    // All good: show success notifications and redirect
    showNotification('Store setup completed successfully! 🎉', 'success');
    
    setTimeout(() => {
      showNotification('Preparing KYC verification...', 'success');
    }, 1500);

    setTimeout(() => {
      window.location.href = 'kyc.html';
    }, 3000);
  });

  /* -------------------------
     Utility: live validation on blur and input
  ------------------------- */
  [storeName, email, phone, address].forEach(el => {
    el.addEventListener('blur', () => validateField(el));
    el.addEventListener('input', () => {
      if(el.value.trim()) validateField(el);
    });
  });

  /* -------------------------
     Update preview categories once
  ------------------------- */
  updatePreviewCategories();

  /* -------------------------
     Update preview on startup
  ------------------------- */
  previewNoImg.style.display = 'block';
  previewLogo.style.display = 'none';

  // helper for preview name & contact
  previewName.textContent = storeName.value.trim() || 'Your Store Name';
  previewDesc.textContent = storeDesc.value.trim() || 'Store description will appear here.';

  // CSS spinner keyframes reinforcement
  const styleTag = document.createElement('style');
  styleTag.innerHTML = '@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }';
  document.head.appendChild(styleTag);

  // ✅ Email Verify Flow - INSIDE DOMContentLoaded
  const verifyEmailBtn = document.getElementById("verifyEmail");
  const emailOtpSection = document.getElementById("emailOtpSection");
  const emailError = document.getElementById("error-email");

  console.log('✅ Email verify elements loaded:', { verifyEmailBtn, emailOtpSection, emailError });

  verifyEmailBtn.addEventListener("click", () => {
    console.log('verifyEmailBtn clicked');
    // always show OTP section so user can at least type something and see feedback
    emailOtpSection.style.display = 'flex';
    (async () => {
      const emailInput = document.getElementById("email").value.trim();
      console.log('verifyEmailBtn handler running, emailInput=', emailInput);
      if (!emailInput) {
        emailError.textContent = "Please enter your email before verifying.";
        emailError.style.color = 'red';
        return;
      }

      const overrideUrl = localStorage.getItem('API_BASE_URL');
      const apiBase = overrideUrl || ((typeof CONFIG !== 'undefined' && CONFIG && CONFIG.API_BASE_URL) ? CONFIG.API_BASE_URL : (window.location.origin + '/api'));
      const sendUrl = apiBase.replace(/\/+$/, '') + '/auth/send-otp';
      console.log('will POST to', sendUrl);

      try {
        const res = await fetch(sendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailInput })
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body.error || body.message || `status ${res.status}`);
        }

        // success
        console.log('sendOtp response body', body);
        if (body.emailFailed) {
          emailError.textContent = 'Could not send OTP email; using demo code below.';
          emailError.style.color = 'orange';
        } else {
          emailError.textContent = 'OTP sent to your email.';
          emailError.style.color = 'green';
        }
        if (body.code) {
          console.info('Demo OTP code (from backend):', body.code);
          try { sessionStorage.setItem('emailOtp', JSON.stringify({ email: emailInput, code: body.code, expiresAt: Date.now() + 5 * 60 * 1000 })); } catch(e) {}
        }
        emailOtpSection.style.display = 'flex';
      } catch (err) {
        console.warn('verifyEmail: backend send-otp failed, falling back to demo or showing error', err);
        emailError.textContent = 'Could not send OTP. Check console for demo code.';
        emailError.style.color = 'orange';
        emailOtpSection.style.display = 'flex';
        // optional demo fallback
        const code = String(Math.floor(100000 + Math.random() * 900000));
        console.info('Demo OTP for', emailInput, 'is', code);
        try { sessionStorage.setItem('emailOtp', JSON.stringify({ email: emailInput, code, expiresAt: Date.now() + 5 * 60 * 1000 })); } catch(e) {}
      }

      // start simple resend cooldown (30s)
      verifyEmailBtn.disabled = true;
      let cooldown = 30;
      const origText = verifyEmailBtn.textContent;
      verifyEmailBtn.textContent = `Resend (${cooldown}s)`;
      const t = setInterval(() => {
        cooldown -= 1;
        if (cooldown <= 0) {
          clearInterval(t);
          verifyEmailBtn.disabled = false;
          verifyEmailBtn.textContent = origText;
        } else {
          verifyEmailBtn.textContent = `Resend (${cooldown}s)`;
        }
      }, 1000);
    })();
  });

  document.getElementById("submitEmailOtp").addEventListener("click", () => {
    console.log('submitEmailOtp clicked');
    (async () => {
      const entered = document.getElementById('emailOtp').value.trim();
      console.log('submitEmailOtp handler, entered=', entered);
      if (!entered) {
        emailError.textContent = 'Please enter the OTP.';
        emailError.style.color = 'red';
        return;
      }

      const emailInput = document.getElementById('email').value.trim();
      const overrideUrl = localStorage.getItem('API_BASE_URL');
      const apiBase = overrideUrl || ((typeof CONFIG !== 'undefined' && CONFIG && CONFIG.API_BASE_URL) ? CONFIG.API_BASE_URL : (window.location.origin + '/api'));
      const verifyUrl = apiBase.replace(/\/+$/, '') + '/auth/verify-otp';

      try {
        // include token if we have one (sessionStorage or localStorage)
        const tokenKey = (typeof CONFIG !== 'undefined' && CONFIG && CONFIG.STORAGE_KEYS && CONFIG.STORAGE_KEYS.TOKEN) ? CONFIG.STORAGE_KEYS.TOKEN : 'token';
        const token = sessionStorage.getItem(tokenKey) || localStorage.getItem(tokenKey);
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(verifyUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ email: emailInput, code: entered })
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body.error || body.message || `status ${res.status}`);
        }
        emailError.textContent = '✅ Email verified successfully.';
        emailError.style.color = 'green';
        emailOtpSection.style.display = 'none';      // mark verify button state
      verifyEmailBtn.textContent = 'Verified';
      verifyEmailBtn.disabled = true;      } catch (err) {
        console.warn('submitEmailOtp: backend verify failed', err);
        // fallback to demo storage check
        let stored = null;
        try { stored = JSON.parse(sessionStorage.getItem('emailOtp') || 'null'); } catch(e){}
        if (stored && entered === String(stored.code) && Date.now() <= (stored.expiresAt||0)) {
          emailError.textContent = '✅ Email verified (demo fallback).';
          emailError.style.color = 'green';
          emailOtpSection.style.display = 'none';
        } else {
          emailError.textContent = 'Invalid OTP. Please try again.';
          emailError.style.color = 'red';
        }
      }
    })();
  });

  // Auto year in footer
  document.querySelector(".footer-copy").innerHTML =
    "&copy; " + new Date().getFullYear() + " MarketMix. All rights reserved.";

});
