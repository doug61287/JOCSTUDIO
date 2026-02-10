/**
 * JOCHero Invite Code Input Component
 * 
 * Usage:
 * 1. Include this script in your HTML
 * 2. Add <div id="invite-code-container"></div> where you want the input
 * 3. Call InviteCodeInput.init({ apiUrl: 'https://your-api.com' })
 */

const InviteCodeInput = (function() {
  let config = {
    apiUrl: '',
    containerId: 'invite-code-container',
    onValidCode: null,
    onInvalidCode: null,
  };

  let state = {
    code: '',
    isValid: null,
    isLoading: false,
    message: '',
  };

  function init(options = {}) {
    config = { ...config, ...options };
    render();
  }

  function render() {
    const container = document.getElementById(config.containerId);
    if (!container) {
      console.error(`InviteCodeInput: Container #${config.containerId} not found`);
      return;
    }

    container.innerHTML = `
      <div class="invite-code-wrapper" style="margin: 1rem 0;">
        <label for="invite-code" style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: #666;">
          Have an invite code?
        </label>
        <div style="position: relative; display: inline-flex; align-items: center; width: 100%; max-width: 320px;">
          <input 
            type="text" 
            id="invite-code" 
            name="invite_code"
            placeholder="JOCHERO-XXXXXXXX" 
            autocomplete="off"
            spellcheck="false"
            style="
              width: 100%;
              padding: 0.75rem 2.5rem 0.75rem 0.75rem;
              font-size: 1rem;
              font-family: monospace;
              text-transform: uppercase;
              border: 2px solid ${state.isValid === true ? '#22c55e' : state.isValid === false ? '#ef4444' : '#d1d5db'};
              border-radius: 8px;
              outline: none;
              transition: border-color 0.2s;
            "
          />
          <span id="invite-code-status" style="
            position: absolute;
            right: 10px;
            font-size: 1.25rem;
            ${state.isLoading ? 'animation: spin 1s linear infinite;' : ''}
          ">
            ${getStatusIcon()}
          </span>
        </div>
        <p id="invite-code-message" style="
          margin-top: 0.25rem;
          font-size: 0.85rem;
          color: ${state.isValid === true ? '#22c55e' : state.isValid === false ? '#ef4444' : '#666'};
          min-height: 1.25rem;
        ">
          ${state.message}
        </p>
      </div>
      <style>
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        #invite-code:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      </style>
    `;

    // Add event listeners
    const input = document.getElementById('invite-code');
    input.addEventListener('blur', handleBlur);
    input.addEventListener('input', handleInput);
    
    // Restore value if exists
    if (state.code) {
      input.value = state.code;
    }
  }

  function getStatusIcon() {
    if (state.isLoading) return '⏳';
    if (state.isValid === true) return '✓';
    if (state.isValid === false) return '✗';
    return '';
  }

  function handleInput(e) {
    const value = e.target.value.toUpperCase();
    state.code = value;
    
    // Reset validation state on new input
    if (state.isValid !== null) {
      state.isValid = null;
      state.message = '';
      render();
    }
  }

  async function handleBlur(e) {
    const code = e.target.value.trim().toUpperCase();
    
    if (!code) {
      state.isValid = null;
      state.message = '';
      render();
      return;
    }

    // Basic format check
    if (!code.match(/^JOCHERO-[A-Z0-9]{8}$/)) {
      state.isValid = false;
      state.message = 'Invalid format. Expected: JOCHERO-XXXXXXXX';
      render();
      if (config.onInvalidCode) config.onInvalidCode(code, 'Invalid format');
      return;
    }

    // Validate with API
    await validateCode(code);
  }

  async function validateCode(code) {
    state.isLoading = true;
    state.message = 'Checking...';
    render();

    try {
      const response = await fetch(`${config.apiUrl}/invites/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.success && data.data.valid) {
        state.isValid = true;
        state.message = '✓ Valid invite code';
        if (config.onValidCode) config.onValidCode(code);
      } else {
        state.isValid = false;
        state.message = data.data?.message || 'Invalid invite code';
        if (config.onInvalidCode) config.onInvalidCode(code, state.message);
      }
    } catch (error) {
      console.error('Failed to validate invite code:', error);
      state.isValid = false;
      state.message = 'Could not verify code. Please try again.';
      if (config.onInvalidCode) config.onInvalidCode(code, 'Network error');
    } finally {
      state.isLoading = false;
      render();
    }
  }

  function getCode() {
    return state.isValid ? state.code : null;
  }

  function isValid() {
    return state.isValid === true;
  }

  function reset() {
    state = {
      code: '',
      isValid: null,
      isLoading: false,
      message: '',
    };
    render();
  }

  return {
    init,
    getCode,
    isValid,
    reset,
  };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InviteCodeInput;
}
