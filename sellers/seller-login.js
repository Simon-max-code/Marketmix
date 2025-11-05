// Seller login handling and Google Sign-In (demo)
function handleGoogleSignIn(response) {
  // In production, verify token server-side.
  redirectToSellersPage();
}

function redirectToSellersPage() {
  window.location.href = 'sellers layout.html';
}

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('sellerLoginForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      if (!email || !password) {
        alert('Please enter email and password');
        return;
      }
      // TODO: Perform authentication with backend here.
      // For demo, redirect directly.
      redirectToSellersPage();
    });
  }

  // Initialize Google button if library is present and container exists
  // Initialize Google button with a small retry loop so the async library has time to load.
  function initGoogleOnce(attemptsLeft = 20) {
    const container = document.getElementById('google-login');
    if (!container) return; // no container on page

    if (window.google && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: 'YOUR_GOOGLE_CLIENT_ID', // <-- replace with your real client id
        callback: handleGoogleSignIn
      });
      google.accounts.id.renderButton(
        container,
        { theme: 'outline', size: 'large', text: 'continue_with' }
      );
      // Optionally prompt for credential one-tap (commented out):
      // google.accounts.id.prompt();
      return;
    }

    if (attemptsLeft > 0) {
      setTimeout(() => initGoogleOnce(attemptsLeft - 1), 200);
    } else {
      // Fallback: render a simple button if the library never loaded
      container.innerHTML = '<button type="button" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ddd;background:#fff;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;">\n        <img src="https://www.svgrepo.com/show/355037/google.svg" alt="G" style="width:20px;height:20px;"> Sign in with Google\n      </button>';
      const btn = container.querySelector('button');
      if (btn) btn.addEventListener('click', () => redirectToSellersPage());
    }
  }

  initGoogleOnce();
});