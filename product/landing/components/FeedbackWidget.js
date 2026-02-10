/**
 * JOCHero Feedback Widget
 * Embeddable beta tester feedback form
 * 
 * Usage:
 *   <script src="/components/FeedbackWidget.js"></script>
 *   <script>
 *     FeedbackWidget.init({
 *       apiUrl: 'https://api.jochero.dev/feedback',
 *       userEmail: 'user@example.com' // optional, pre-fill if logged in
 *     });
 *   </script>
 */

(function() {
  'use strict';

  const FeedbackWidget = {
    config: {
      apiUrl: '/api/feedback',
      userEmail: '',
      position: 'bottom-right',
      buttonText: '🐛',
      maxChars: 5000,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    },

    state: {
      isOpen: false,
      isSubmitting: false,
      isSuccess: false,
      selectedType: null,
      screenshot: null,
      screenshotPreview: null,
    },

    // Initialize the widget
    init(options = {}) {
      this.config = { ...this.config, ...options };
      this.injectStyles();
      this.createDOM();
      this.bindEvents();
      console.log('[FeedbackWidget] Initialized');
    },

    // Inject CSS if not already loaded
    injectStyles() {
      if (document.getElementById('feedback-widget-styles')) return;

      const link = document.createElement('link');
      link.id = 'feedback-widget-styles';
      link.rel = 'stylesheet';
      link.href = '/components/FeedbackWidget.css';
      document.head.appendChild(link);
    },

    // Create DOM elements
    createDOM() {
      // Floating button
      const btn = document.createElement('button');
      btn.id = 'feedback-btn';
      btn.className = 'feedback-btn';
      btn.setAttribute('aria-label', 'Send Feedback');
      btn.innerHTML = this.config.buttonText;

      // Modal overlay
      const overlay = document.createElement('div');
      overlay.id = 'feedback-overlay';
      overlay.className = 'feedback-overlay';
      overlay.innerHTML = this.getModalHTML();

      document.body.appendChild(btn);
      document.body.appendChild(overlay);

      // Store references
      this.elements = {
        btn,
        overlay,
        modal: overlay.querySelector('.feedback-modal'),
        form: overlay.querySelector('#feedback-form'),
        types: overlay.querySelectorAll('.feedback-type'),
        description: overlay.querySelector('#feedback-description'),
        email: overlay.querySelector('#feedback-email'),
        screenshot: overlay.querySelector('#feedback-screenshot-input'),
        screenshotArea: overlay.querySelector('.feedback-screenshot'),
        preview: overlay.querySelector('.feedback-screenshot-preview'),
        counter: overlay.querySelector('.feedback-counter'),
        error: overlay.querySelector('.feedback-error'),
        submit: overlay.querySelector('.feedback-submit'),
        close: overlay.querySelector('.feedback-close'),
        success: overlay.querySelector('.feedback-success'),
        formContent: overlay.querySelector('.feedback-form-content'),
      };

      // Pre-fill email if provided
      if (this.config.userEmail) {
        this.elements.email.value = this.config.userEmail;
      }
    },

    // Get modal HTML template
    getModalHTML() {
      return `
        <div class="feedback-modal">
          <div class="feedback-header">
            <h3>🐛 Send Feedback</h3>
            <button class="feedback-close" aria-label="Close">&times;</button>
          </div>
          <div class="feedback-body">
            <div class="feedback-form-content">
              <div class="feedback-error hidden">
                <span>⚠️</span>
                <span class="feedback-error-text"></span>
              </div>
              <form id="feedback-form">
                <div class="feedback-group">
                  <label>Type <span>*</span></label>
                  <div class="feedback-types">
                    <label class="feedback-type" data-type="BUG">
                      <input type="radio" name="type" value="BUG">
                      <span class="feedback-type-icon">🐛</span>
                      <span class="feedback-type-label">Bug Report</span>
                    </label>
                    <label class="feedback-type" data-type="FEATURE_REQUEST">
                      <input type="radio" name="type" value="FEATURE_REQUEST">
                      <span class="feedback-type-icon">💡</span>
                      <span class="feedback-type-label">Feature Request</span>
                    </label>
                    <label class="feedback-type" data-type="GENERAL">
                      <input type="radio" name="type" value="GENERAL">
                      <span class="feedback-type-icon">💬</span>
                      <span class="feedback-type-label">General</span>
                    </label>
                  </div>
                </div>
                <div class="feedback-group">
                  <label for="feedback-description">Description <span>*</span></label>
                  <textarea 
                    id="feedback-description" 
                    class="feedback-textarea" 
                    placeholder="Describe your feedback in detail..."
                    required
                    minlength="10"
                    maxlength="5000"
                  ></textarea>
                  <div class="feedback-counter">0 / 5000</div>
                </div>
                <div class="feedback-group">
                  <label>Screenshot (optional)</label>
                  <div class="feedback-screenshot">
                    <input type="file" id="feedback-screenshot-input" accept="image/*">
                    <div class="feedback-screenshot-icon">📷</div>
                    <div class="feedback-screenshot-text">Click or drag to upload</div>
                    <img class="feedback-screenshot-preview hidden" alt="Screenshot preview">
                  </div>
                </div>
                <div class="feedback-group">
                  <label for="feedback-email">Email (optional)</label>
                  <input 
                    type="email" 
                    id="feedback-email" 
                    class="feedback-input" 
                    placeholder="your@email.com"
                  >
                </div>
                <button type="submit" class="feedback-submit">
                  <span class="feedback-submit-text">Submit Feedback</span>
                </button>
              </form>
            </div>
            <div class="feedback-success hidden">
              <div class="feedback-success-icon">✅</div>
              <h4>Thank you!</h4>
              <p>Your feedback has been submitted successfully.</p>
            </div>
          </div>
          <div class="feedback-powered">
            <a href="https://jochero.dev" target="_blank">JOCHero</a> Beta
          </div>
        </div>
      `;
    },

    // Bind event handlers
    bindEvents() {
      // Open modal
      this.elements.btn.addEventListener('click', () => this.open());

      // Close modal
      this.elements.close.addEventListener('click', () => this.close());
      this.elements.overlay.addEventListener('click', (e) => {
        if (e.target === this.elements.overlay) this.close();
      });

      // Escape key closes modal
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.state.isOpen) this.close();
      });

      // Type selection
      this.elements.types.forEach((type) => {
        type.addEventListener('click', () => this.selectType(type.dataset.type));
      });

      // Character counter
      this.elements.description.addEventListener('input', () => this.updateCounter());

      // Screenshot upload
      this.elements.screenshot.addEventListener('change', (e) => this.handleScreenshot(e));
      this.elements.screenshotArea.addEventListener('dragover', (e) => e.preventDefault());
      this.elements.screenshotArea.addEventListener('drop', (e) => this.handleDrop(e));

      // Form submission
      this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));
    },

    // Open modal
    open() {
      this.state.isOpen = true;
      this.elements.overlay.classList.add('open');
      this.elements.btn.classList.add('hidden');
      this.elements.description.focus();
    },

    // Close modal
    close() {
      this.state.isOpen = false;
      this.elements.overlay.classList.remove('open');
      this.elements.btn.classList.remove('hidden');

      // Reset after animation
      setTimeout(() => {
        if (this.state.isSuccess) {
          this.reset();
        }
      }, 300);
    },

    // Reset form
    reset() {
      this.state.selectedType = null;
      this.state.screenshot = null;
      this.state.screenshotPreview = null;
      this.state.isSuccess = false;

      this.elements.form.reset();
      this.elements.types.forEach((t) => t.classList.remove('selected'));
      this.elements.preview.classList.add('hidden');
      this.elements.screenshotArea.classList.remove('has-image');
      this.elements.success.classList.add('hidden');
      this.elements.formContent.classList.remove('hidden');
      this.updateCounter();

      if (this.config.userEmail) {
        this.elements.email.value = this.config.userEmail;
      }
    },

    // Select feedback type
    selectType(type) {
      this.state.selectedType = type;
      this.elements.types.forEach((t) => {
        t.classList.toggle('selected', t.dataset.type === type);
      });
    },

    // Update character counter
    updateCounter() {
      const count = this.elements.description.value.length;
      const max = this.config.maxChars;
      this.elements.counter.textContent = `${count} / ${max}`;
      this.elements.counter.classList.toggle('warning', count > max * 0.8);
      this.elements.counter.classList.toggle('error', count >= max);
    },

    // Handle screenshot file
    handleScreenshot(e) {
      const file = e.target.files[0];
      if (file) this.processScreenshot(file);
    },

    // Handle drag and drop
    handleDrop(e) {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.processScreenshot(file);
      }
    },

    // Process screenshot file
    processScreenshot(file) {
      if (file.size > this.config.maxFileSize) {
        this.showError('Screenshot must be under 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.state.screenshot = e.target.result;
        this.elements.preview.src = e.target.result;
        this.elements.preview.classList.remove('hidden');
        this.elements.screenshotArea.classList.add('has-image');
      };
      reader.readAsDataURL(file);
    },

    // Show error message
    showError(message) {
      this.elements.error.querySelector('.feedback-error-text').textContent = message;
      this.elements.error.classList.remove('hidden');
      this.elements.modal.classList.add('feedback-shake');
      setTimeout(() => this.elements.modal.classList.remove('feedback-shake'), 300);
    },

    // Hide error message
    hideError() {
      this.elements.error.classList.add('hidden');
    },

    // Handle form submission
    async handleSubmit(e) {
      e.preventDefault();
      this.hideError();

      // Validate type selection
      if (!this.state.selectedType) {
        this.showError('Please select a feedback type');
        return;
      }

      // Validate description
      const description = this.elements.description.value.trim();
      if (description.length < 10) {
        this.showError('Description must be at least 10 characters');
        return;
      }

      // Prepare payload
      const payload = {
        type: this.state.selectedType,
        description,
        pageUrl: window.location.href,
        email: this.elements.email.value || undefined,
        screenshot: this.state.screenshot || undefined,
      };

      // Submit
      this.setSubmitting(true);

      try {
        const response = await fetch(this.config.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error?.message || 'Failed to submit feedback');
        }

        // Show success
        this.state.isSuccess = true;
        this.elements.formContent.classList.add('hidden');
        this.elements.success.classList.remove('hidden');

        // Auto-close after delay
        setTimeout(() => this.close(), 3000);

      } catch (error) {
        console.error('[FeedbackWidget] Submit error:', error);
        this.showError(error.message || 'Failed to submit feedback. Please try again.');
      } finally {
        this.setSubmitting(false);
      }
    },

    // Set submitting state
    setSubmitting(isSubmitting) {
      this.state.isSubmitting = isSubmitting;
      this.elements.submit.disabled = isSubmitting;
      this.elements.submit.classList.toggle('loading', isSubmitting);
      
      const text = this.elements.submit.querySelector('.feedback-submit-text');
      if (isSubmitting) {
        text.innerHTML = '<div class="feedback-spinner"></div> Submitting...';
      } else {
        text.textContent = 'Submit Feedback';
      }
    },

    // Programmatic methods
    show() { this.open(); },
    hide() { this.close(); },
    destroy() {
      this.elements.btn?.remove();
      this.elements.overlay?.remove();
      document.getElementById('feedback-widget-styles')?.remove();
    },
  };

  // Export to global scope
  window.FeedbackWidget = FeedbackWidget;

  // Auto-init if data attribute present
  document.addEventListener('DOMContentLoaded', () => {
    const autoInit = document.querySelector('[data-feedback-widget]');
    if (autoInit) {
      FeedbackWidget.init({
        apiUrl: autoInit.dataset.apiUrl || '/api/feedback',
        userEmail: autoInit.dataset.userEmail || '',
      });
    }
  });

})();
