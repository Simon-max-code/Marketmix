



       document.addEventListener("DOMContentLoaded", function () {
  const toggler = document.getElementById("navbar-toggler");
  const offcanvasMenu = document.getElementById("offcanvasMenu");
  const offcanvasClose = document.getElementById("offcanvasClose");

  // Open Offcanvas Menu
  toggler.addEventListener("click", function () {
    offcanvasMenu.classList.add("show");
  });

  // Close Offcanvas Menu
  offcanvasClose.addEventListener("click", function () {
    offcanvasMenu.classList.remove("show");
  });

  // Close Offcanvas when clicking outside, but not when clicking inside
  document.addEventListener("click", function (event) {
    if (!offcanvasMenu.contains(event.target) && !toggler.contains(event.target)) {
      offcanvasMenu.classList.remove("show");
    }
  });

  // Ensure clicking inside doesn't close menu
  offcanvasMenu.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  // Close offcanvas when clicking any menu link (for better UX)
  document.querySelectorAll('.offcanvas-body a').forEach(link => {
    link.addEventListener('click', () => {
      offcanvasMenu.classList.remove('show');
    });
  });

  });


function toggleProfileDropdown() {
    const dropdown = document.getElementById("profileDropdown");
    dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
  }

  // Close dropdown if clicking outside
  document.addEventListener("click", function (e) {
    const dropdown = document.getElementById("profileDropdown");
    const profile = document.querySelector(".profile-icon");

    if (!dropdown.contains(e.target) && !profile.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });













document.addEventListener('DOMContentLoaded', () => {
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(dropdown => {
    dropdown.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDropdown(dropdown);
      }
      if (e.key === 'Escape') {
        closeDropdown(dropdown);
        dropdown.querySelector('a').focus();
      }
    });
    dropdown.addEventListener('click', () => {
      toggleDropdown(dropdown);
    });
  });

  function toggleDropdown(dropdown) {
    const expanded = dropdown.getAttribute('aria-expanded') === 'true';
    closeAllDropdowns();
    if (!expanded) {
      dropdown.setAttribute('aria-expanded', 'true');
    }
  }
  function closeDropdown(dropdown) {
    dropdown.setAttribute('aria-expanded', 'false');
  }
  function closeAllDropdowns() {
    dropdowns.forEach(d => d.setAttribute('aria-expanded', 'false'));
  }
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      closeAllDropdowns();
    }
  });

  // Handle logo preview and size/type validation
  const shopLogoInput = document.getElementById('shop-logo');
  const logoPreview = document.getElementById('logo-preview');

  shopLogoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) {
      logoPreview.style.display = 'none';
      logoPreview.src = '';
      return;
    }
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      alert('Invalid file type. Only PNG and JPG allowed.');
      shopLogoInput.value = '';
      logoPreview.style.display = 'none';
      return;
    }
    if (file.size > 1024 * 1024) {
      alert('File too large. Max size is 1MB.');
      shopLogoInput.value = '';
      logoPreview.style.display = 'none';
      return;
    }
    const reader = new FileReader();
    reader.onload = function(event) {
      logoPreview.src = event.target.result;
      logoPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });

  // Form validation and submission
  const form = document.getElementById('shop-settings');
  const formMessage = document.getElementById('form-message');
  const saveBtn = form.querySelector('button.save-btn');
  const spinner = saveBtn.querySelector('.loading-spinner');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    formMessage.textContent = '';
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    // Password confirm check
    const newPassword = form.elements['newPassword'].value;
    const confirmPassword = form.elements['confirmPassword'].value;
    if (newPassword && newPassword !== confirmPassword) {
      formMessage.textContent = 'New password and confirm password do not match.';
      formMessage.style.color = 'red';
      return;
    }

    // Simulate loading state
    saveBtn.setAttribute('aria-busy', 'true');
    spinner.classList.remove('hidden');
    saveBtn.disabled = true;
    formMessage.textContent = 'Saving...';
    formMessage.style.color = '#000';

    setTimeout(() => {
      saveBtn.setAttribute('aria-busy', 'false');
      spinner.classList.add('hidden');
      saveBtn.disabled = false;
      formMessage.textContent = 'Settings saved successfully!';
      formMessage.style.color = 'green';
    }, 2000);
  });

  // Reset button
  const resetBtn = document.getElementById('reset-btn');
  resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all settings?')) {
      form.reset();
      logoPreview.style.display = 'none';
      logoPreview.src = '';
      formMessage.textContent = 'Settings reset.';
      formMessage.style.color = 'black';
    }
  });

  // Preview shop button (for demo just alert)
  const previewBtn = document.getElementById('preview-btn');
  previewBtn.addEventListener('click', () => {
    alert('Preview feature coming soon!');
  });

  // Dark mode toggle
  const darkModeToggle = document.getElementById('darkmode-toggle');
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    darkModeToggle.setAttribute('aria-pressed', isDark);
  });
});
