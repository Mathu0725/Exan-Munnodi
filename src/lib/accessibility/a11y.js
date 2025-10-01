/**
 * Accessibility utilities and helpers
 */

/**
 * Generate unique ID for accessibility
 */
export function generateId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * ARIA live region announcements
 */
export class AriaLiveAnnouncer {
  constructor() {
    this.liveRegion = null;
    this.init();
  }

  init() {
    if (typeof document !== 'undefined') {
      this.liveRegion = document.getElementById('aria-live-region');
      if (!this.liveRegion) {
        this.liveRegion = document.createElement('div');
        this.liveRegion.id = 'aria-live-region';
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.className = 'sr-only';
        document.body.appendChild(this.liveRegion);
      }
    }
  }

  announce(message, priority = 'polite') {
    if (this.liveRegion) {
      this.liveRegion.setAttribute('aria-live', priority);
      this.liveRegion.textContent = message;
    }
  }

  announceAssertive(message) {
    this.announce(message, 'assertive');
  }

  announcePolite(message) {
    this.announce(message, 'polite');
  }
}

// Create singleton instance
export const ariaLiveAnnouncer = new AriaLiveAnnouncer();

/**
 * Focus management utilities
 */
export class FocusManager {
  constructor() {
    this.focusHistory = [];
    this.trapStack = [];
  }

  /**
   * Save current focus
   */
  saveFocus() {
    if (typeof document !== 'undefined') {
      this.focusHistory.push(document.activeElement);
    }
  }

  /**
   * Restore previous focus
   */
  restoreFocus() {
    if (this.focusHistory.length > 0) {
      const previousFocus = this.focusHistory.pop();
      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
    }
  }

  /**
   * Focus first focusable element in container
   */
  focusFirst(container) {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  /**
   * Focus last focusable element in container
   */
  focusLast(container) {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }

  /**
   * Get all focusable elements in container
   */
  getFocusableElements(container) {
    if (!container) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors));
  }

  /**
   * Create focus trap
   */
  createFocusTrap(container) {
    const trap = {
      container,
      firstFocusable: null,
      lastFocusable: null,
      handleKeyDown: e => {
        if (e.key === 'Tab') {
          const focusableElements = this.getFocusableElements(container);
          if (focusableElements.length === 0) return;

          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === focusableElements[0]) {
              e.preventDefault();
              focusableElements[focusableElements.length - 1].focus();
            }
          } else {
            // Tab
            if (
              document.activeElement ===
              focusableElements[focusableElements.length - 1]
            ) {
              e.preventDefault();
              focusableElements[0].focus();
            }
          }
        }
      },
    };

    trap.firstFocusable = this.getFocusableElements(container)[0];
    trap.lastFocusable = this.getFocusableElements(container).slice(-1)[0];

    container.addEventListener('keydown', trap.handleKeyDown);
    this.trapStack.push(trap);

    return trap;
  }

  /**
   * Remove focus trap
   */
  removeFocusTrap(trap) {
    if (trap && trap.container) {
      trap.container.removeEventListener('keydown', trap.handleKeyDown);
      this.trapStack = this.trapStack.filter(t => t !== trap);
    }
  }

  /**
   * Remove all focus traps
   */
  removeAllFocusTraps() {
    this.trapStack.forEach(trap => this.removeFocusTrap(trap));
  }
}

// Create singleton instance
export const focusManager = new FocusManager();

/**
 * Keyboard navigation utilities
 */
export const keyboardNavigation = {
  /**
   * Handle arrow key navigation
   */
  handleArrowKeys: (event, items, currentIndex, onSelect) => {
    const { key } = event;
    let newIndex = currentIndex;

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        newIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return currentIndex;
    }

    if (onSelect) {
      onSelect(newIndex);
    }

    return newIndex;
  },

  /**
   * Handle escape key
   */
  handleEscape: (event, onEscape) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (onEscape) {
        onEscape();
      }
    }
  },

  /**
   * Handle enter key
   */
  handleEnter: (event, onEnter) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (onEnter) {
        onEnter();
      }
    }
  },

  /**
   * Handle space key
   */
  handleSpace: (event, onSpace) => {
    if (event.key === ' ') {
      event.preventDefault();
      if (onSpace) {
        onSpace();
      }
    }
  },
};

/**
 * Screen reader utilities
 */
export const screenReader = {
  /**
   * Announce to screen readers
   */
  announce: (message, priority = 'polite') => {
    ariaLiveAnnouncer.announce(message, priority);
  },

  /**
   * Announce error
   */
  announceError: message => {
    ariaLiveAnnouncer.announceAssertive(`Error: ${message}`);
  },

  /**
   * Announce success
   */
  announceSuccess: message => {
    ariaLiveAnnouncer.announcePolite(`Success: ${message}`);
  },

  /**
   * Announce warning
   */
  announceWarning: message => {
    ariaLiveAnnouncer.announceAssertive(`Warning: ${message}`);
  },

  /**
   * Announce info
   */
  announceInfo: message => {
    ariaLiveAnnouncer.announcePolite(`Info: ${message}`);
  },
};

/**
 * Color contrast utilities
 */
export const colorContrast = {
  /**
   * Calculate relative luminance
   */
  getLuminance: (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio
   */
  getContrastRatio: (color1, color2) => {
    const [r1, g1, b1] = color1;
    const [r2, g2, b2] = color2;

    const lum1 = this.getLuminance(r1, g1, b1);
    const lum2 = this.getLuminance(r2, g2, b2);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Check if contrast meets WCAG AA standards
   */
  meetsWCAGAA: (color1, color2) => {
    const ratio = this.getContrastRatio(color1, color2);
    return ratio >= 4.5; // WCAG AA standard
  },

  /**
   * Check if contrast meets WCAG AAA standards
   */
  meetsWCAGAAA: (color1, color2) => {
    const ratio = this.getContrastRatio(color1, color2);
    return ratio >= 7; // WCAG AAA standard
  },
};

/**
 * Form accessibility utilities
 */
export const formA11y = {
  /**
   * Generate error message ID
   */
  getErrorId: fieldName => `${fieldName}-error`,

  /**
   * Generate help text ID
   */
  getHelpId: fieldName => `${fieldName}-help`,

  /**
   * Get aria-describedby for form field
   */
  getDescribedBy: (fieldName, hasError, hasHelp) => {
    const ids = [];
    if (hasError) ids.push(this.getErrorId(fieldName));
    if (hasHelp) ids.push(this.getHelpId(fieldName));
    return ids.length > 0 ? ids.join(' ') : undefined;
  },

  /**
   * Get aria-invalid for form field
   */
  getAriaInvalid: hasError => hasError || undefined,
};

/**
 * Common ARIA attributes
 */
export const aria = {
  /**
   * Get button ARIA attributes
   */
  button: (props = {}) => ({
    role: 'button',
    tabIndex: 0,
    ...props,
  }),

  /**
   * Get dialog ARIA attributes
   */
  dialog: (props = {}) => ({
    role: 'dialog',
    'aria-modal': true,
    ...props,
  }),

  /**
   * Get alert ARIA attributes
   */
  alert: (props = {}) => ({
    role: 'alert',
    'aria-live': 'assertive',
    ...props,
  }),

  /**
   * Get status ARIA attributes
   */
  status: (props = {}) => ({
    role: 'status',
    'aria-live': 'polite',
    ...props,
  }),

  /**
   * Get progressbar ARIA attributes
   */
  progressbar: (value, max = 100, props = {}) => ({
    role: 'progressbar',
    'aria-valuenow': value,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    ...props,
  }),
};
