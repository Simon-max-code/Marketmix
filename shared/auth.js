// Utility function to show notifications
function showNotification(message, type = 'success') {
    // Remove any existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type === 'error' ? 'error' : ''}`;
    
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
function handleFormSubmit(event, formType, redirectUrl) {
    event.preventDefault();
    
    // Get form inputs
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    
    // Basic validation
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Show success and redirect
    showNotification(`${formType} successful!`);
    setTimeout(() => {
        window.location.href = redirectUrl;
    }, 1000);
}

// Handle Google sign-in with notification and redirect
function handleGoogleSignIn(formType, redirectUrl) {
    showNotification(`${formType} with Google successful!`);
    setTimeout(() => {
        window.location.href = redirectUrl;
    }, 1000);
}