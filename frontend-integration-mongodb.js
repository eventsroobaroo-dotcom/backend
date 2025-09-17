// =============================================
// FRONTEND INTEGRATION UPDATE - MongoDB Version
// =============================================
// Replace the relevant parts in your app.js with this updated code

// ===== BACKEND INTEGRATION CONFIGURATION =====
const API_CONFIG = {
    // Replace this with your deployed MongoDB backend URL from Render
    BASE_URL: 'https://your-mongodb-backend.onrender.com/api',
    // For local development, use: 'http://localhost:5000/api'
    // Request timeout in milliseconds
    TIMEOUT: 15000, // Increased timeout for MongoDB operations
    // Enable detailed logging
    DEBUG: false
};

// =============================================
// ENHANCED BACKEND INTEGRATION FUNCTION
// =============================================
async function submitRegistrationToBackend(registrationData) {
    try {
        console.log('Submitting registration to MongoDB backend:', registrationData);
        
        // Show network status
        if (!navigator.onLine) {
            throw new Error('No internet connection. Please check your network and try again.');
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registrationData),
            signal: AbortSignal.timeout(API_CONFIG.TIMEOUT)
        });

        const result = await response.json();
        
        if (!response.ok) {
            // Handle specific MongoDB backend error codes
            if (result.code === 'DUPLICATE_EMAIL') {
                throw new Error('This email is already registered for the event. Please use a different email or contact support.');
            }
            if (result.code === 'RATE_LIMIT_EXCEEDED') {
                throw new Error('Too many registration attempts. Please try again in 15 minutes.');
            }
            if (result.code === 'VALIDATION_ERROR') {
                throw new Error(result.details ? result.details.join(', ') : result.error);
            }
            
            throw new Error(result.error || `HTTP error! status: ${response.status}`);
        }

        console.log('Registration successful:', result);
        return result;
    } catch (error) {
        console.error('Registration submission error:', error);
        
        // Handle specific error types
        if (error.name === 'AbortError') {
            throw new Error('Request timeout. The server might be sleeping. Please wait 30 seconds and try again.');
        } else if (error.message.includes('Failed to fetch')) {
            throw new Error('Network error. Please check your connection and try again.');
        } else {
            throw error;
        }
    }
}

// =============================================
// ENHANCED REGISTRATION FORM HANDLER
// =============================================
function initializeRegistrationForm() {
    const registrationForm = document.getElementById('registration-form');
    const successPopup = document.getElementById('success-popup');
    
    if (!registrationForm) return;

    registrationForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Clear any existing error messages
        clearAllErrorMessages();

        // Show loading state
        const submitButton = document.getElementById('registration-submit') || 
                            registrationForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        submitButton.style.opacity = '0.7';

        try {
            if (validateRegistrationForm()) {
                // Collect form data
                const registrationData = {
                    name: document.getElementById('name').value.trim(),
                    email: document.getElementById('email').value.trim(),
                    phone: document.getElementById('phone').value.trim(),
                    status: document.querySelector('input[name="status"]:checked').value
                };

                // Submit to MongoDB backend
                const result = await submitRegistrationToBackend(registrationData);

                // Store registration data globally for payment page
                window.registrationData = registrationData;

                // Show success message with registration details
                showSuccessMessage(`Thank you ${registrationData.name}! Your registration was successful. 
                                   Registration ID: ${result.data.id.substring(0, 8)}`);

                // Navigate to payment page after delay
                setTimeout(() => {
                    hideSuccessMessage();
                    showPage('payment');
                    updatePaymentPage();
                }, 3000);
            }
        } catch (error) {
            // Show detailed error messages to user
            if (error.message.includes('duplicate') || error.message.includes('already registered')) {
                showErrorMessage('email', error.message);
            } else if (error.message.includes('rate limit') || error.message.includes('too many')) {
                showErrorMessage('general', error.message);
            } else {
                showErrorMessage('general', error.message || 'Registration failed. Please try again.');
            }
            
            // Auto-hide error after 10 seconds
            setTimeout(() => clearErrorMessage({ id: 'general' }), 10000);
        } finally {
            // Reset submit button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            submitButton.style.opacity = '1';
        }
    });

    // Real-time validation with improved feedback
    const formInputs = registrationForm.querySelectorAll('input[required]');
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearErrorMessage(this);
            // Add visual feedback for valid input
            if (validateField(this)) {
                this.style.borderColor = 'rgba(33, 128, 141, 0.5)'; // Success color
            }
        });
    });

    // Enhanced status selection with visual feedback
    document.querySelectorAll('input[name="status"]').forEach(radio => {
        radio.addEventListener('change', function() {
            clearErrorMessage(this);
            // Update visual selection
            document.querySelectorAll('.status-button').forEach(btn => {
                btn.classList.remove('selected');
            });
            this.nextElementSibling.classList.add('selected');
        });
    });
}

// =============================================
// ENHANCED SUCCESS/ERROR MESSAGE FUNCTIONS
// =============================================
function showSuccessMessage(message) {
    const successPopup = document.getElementById('success-popup');
    if (successPopup) {
        successPopup.innerHTML = `<p>${message}</p>`;
        successPopup.classList.remove('hidden');
        
        // Add celebration animation
        successPopup.style.animation = 'successBounce 0.5s ease-out';
    }
}

function hideSuccessMessage() {
    const successPopup = document.getElementById('success-popup');
    if (successPopup) {
        successPopup.classList.add('hidden');
        successPopup.style.animation = '';
    }
}

function clearAllErrorMessages() {
    document.querySelectorAll('.error-message').forEach(error => {
        error.classList.remove('show');
    });
    
    // Remove general error if it exists
    const generalError = document.getElementById('general-error');
    if (generalError) {
        generalError.remove();
    }
}

// =============================================
// BACKEND STATUS CHECKER
// =============================================
async function checkBackendStatus() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
            signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
            console.log('✅ Backend is online and ready');
            return true;
        }
    } catch (error) {
        console.warn('⚠️ Backend might be sleeping. It will wake up on first registration.');
        return false;
    }
}

// =============================================
// ENHANCED PAYMENT PAGE UPDATES
// =============================================
function updatePaymentPage() {
    const priceDisplay = document.getElementById('price-display');
    if (priceDisplay && window.registrationData) {
        const price = window.registrationData.status === 'single' ? '₹799' : '₹1400';
        priceDisplay.textContent = price;
        
        // Show registration details on payment page
        const paymentContainer = document.querySelector('.payment-container');
        if (paymentContainer) {
            let existingInfo = paymentContainer.querySelector('.registration-info');
            if (!existingInfo) {
                existingInfo = document.createElement('div');
                existingInfo.className = 'registration-info payment-section';
                existingInfo.innerHTML = `
                    <h3>Registration Details</h3>
                    <p><strong>Name:</strong> ${window.registrationData.name}</p>
                    <p><strong>Email:</strong> ${window.registrationData.email}</p>
                    <p><strong>Status:</strong> ${window.registrationData.status.toUpperCase()}</p>
                    <p><strong>Amount:</strong> ${price}</p>
                `;
                paymentContainer.insertBefore(existingInfo, paymentContainer.firstChild);
            }
        }
    }
}

// =============================================
// REGISTRATION STATISTICS (OPTIONAL)
// =============================================
async function fetchRegistrationStats() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/stats`);
        if (response.ok) {
            const stats = await response.json();
            console.log('📊 Registration Stats:', stats);
            // You can display these stats somewhere on your website if desired
            return stats;
        }
    } catch (error) {
        console.log('Stats not available:', error.message);
    }
}

// =============================================
// INITIALIZATION WITH BACKEND STATUS CHECK
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    // Check backend status on page load
    checkBackendStatus();
    
    // Initialize all existing functions
    initializeCursorGlow();
    initializeLoadingScreen();
    initializeNavigation();
    initializeCountdownTimer();
    initializeRegistrationForm(); // Enhanced version
    initializePaymentPage();

    // Load registration stats (optional)
    setTimeout(fetchRegistrationStats, 2000);

    // Initialize enhanced features after a delay
    setTimeout(() => {
        addEnhancedHoverEffects();
        addDemoAutoFill();
        addSmoothTransitions();
        improveAccessibility();
        handleMobileInteractions();
    }, 1000);
});

// =============================================
// ADD SUCCESS BOUNCE ANIMATION
// =============================================
const style = document.createElement('style');
style.textContent = `
    @keyframes successBounce {
        0% { transform: translateX(-50%) scale(0.8) translateY(20px); opacity: 0; }
        50% { transform: translateX(-50%) scale(1.1) translateY(0); opacity: 1; }
        100% { transform: translateX(-50%) scale(1) translateY(0); opacity: 1; }
    }
    
    .registration-info {
        background: rgba(33, 128, 141, 0.1);
        border: 1px solid rgba(33, 128, 141, 0.3);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 24px;
    }
    
    .registration-info h3 {
        color: #32B8C6;
        margin-bottom: 16px;
    }
    
    .registration-info p {
        margin: 8px 0;
        color: var(--color-text);
    }
`;
document.head.appendChild(style);