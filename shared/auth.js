// Utility function to show notifications
function showNotification(message, type = 'success') {
    // Remove any existing notifications
    const existing = document.querySelector('.site-notification');
    if (existing) {
        existing.remove();
    }

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `site-notification ${type === 'error' ? 'error' : ''}`;
    
    // Add icon based on type
    const icon = document.createElement('i');
    icon.className = `fas ${type === 'error' ? 'fa-times-circle' : 'fa-check-circle'}`;
    notification.appendChild(icon);
    
    // Add message
    const text = document.createElement('span');
    text.textContent = message;
    notification.appendChild(text);
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Handle form submission with notification and redirect
// Get API base safely (CONFIG is defined in buyers/config.js)
function apiBase() {
  if (window.CONFIG && CONFIG.API_BASE_URL) return CONFIG.API_BASE_URL;
  // Fallback to relative path
  return '/api';
}

// Handle form submission - performs real login against backend
async function handleFormSubmit(event, formType, redirectUrl) {
    event.preventDefault();

    // Get form inputs
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelector('input[type="password"]').value;

    // Basic validation
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    try {
        const res = await fetch(`${apiBase()}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const json = await res.json();

        if (!res.ok) {
            const msg = (json && json.message) ? json.message : 'Login failed';
            showNotification(msg, 'error');
            return;
        }

        // Backend returns { status, message, data: { user, token } }
        const token = json?.data?.token;
        const user = json?.data?.user;

        if (!token) {
            showNotification('Login succeeded but no token received', 'error');
            return;
        }

        // Save token and user using same keys as CONFIG if available
        const tokenKey = (window.CONFIG && CONFIG.STORAGE_KEYS && CONFIG.STORAGE_KEYS.TOKEN) ? CONFIG.STORAGE_KEYS.TOKEN : 'token';
        const userKey = (window.CONFIG && CONFIG.STORAGE_KEYS && CONFIG.STORAGE_KEYS.USER) ? CONFIG.STORAGE_KEYS.USER : 'user';
        const roleKey = (window.CONFIG && CONFIG.STORAGE_KEYS && CONFIG.STORAGE_KEYS.USER_ROLE) ? CONFIG.STORAGE_KEYS.USER_ROLE : 'userRole';

        localStorage.setItem(tokenKey, token);
        localStorage.setItem(userKey, JSON.stringify(user || {}));
        if (user && user.role) localStorage.setItem(roleKey, user.role);

        showNotification('Login successful');
        
                // Check if there's a redirect URL saved (from checkout gate or other sources)
                let finalRedirectUrl = redirectUrl;
                const savedRedirect = localStorage.getItem('after_login_redirect');
                if (savedRedirect) {
                    // Normalize to absolute path so redirects don't resolve relative to current folder
                    finalRedirectUrl = savedRedirect.startsWith('/') ? savedRedirect : ('/' + savedRedirect);
                    localStorage.removeItem('after_login_redirect'); // Clear it after use
                    console.log('Login: redirecting to saved URL:', finalRedirectUrl);
                }

                setTimeout(() => { window.location.href = finalRedirectUrl; }, 800);
    } catch (err) {
        console.error('Login error:', err);
        showNotification('Network or server error during login', 'error');
    }
}

// Handle Google sign-in with notification and redirect
function handleGoogleSignIn(formType, redirectUrl) {
    showNotification(`${formType} with Google successful!`);
    
    // Check if there's a redirect URL saved (from checkout gate or other sources)
    let finalRedirectUrl = redirectUrl;
    const savedRedirect = localStorage.getItem('after_login_redirect');
    if (savedRedirect) {
      finalRedirectUrl = savedRedirect;
      localStorage.removeItem('after_login_redirect'); // Clear it after use
      console.log('Google login: redirecting to saved URL:', finalRedirectUrl);
    }
    
    setTimeout(() => {
        window.location.href = finalRedirectUrl;
    }, 1000);
}