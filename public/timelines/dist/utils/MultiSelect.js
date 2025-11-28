/**
 * Multi-Select Dropdown Component
 * X-style dark mode multi-select dropdown
 */
export class MultiSelect {
    constructor(container, options, config = {}) {
        this.isOpen = false;
        this.dropdownElement = null;
        this.triggerElement = null;
        this.container = container;
        this.options = options;
        this.selectedValues = new Set(options.filter(opt => opt.selected).map(opt => opt.value));
        this.config = {
            placeholder: config.placeholder || 'Select...',
            maxHeight: config.maxHeight || '200px',
            showCount: config.showCount !== false
        };
    }
    render() {
        const selectedCount = this.selectedValues.size;
        const displayText = selectedCount > 0
            ? (this.config.showCount ? `${selectedCount} selected` : this.getSelectedLabels().join(', '))
            : this.config.placeholder || 'Select...';
        this.container.innerHTML = `
      <div class="multi-select-wrapper">
        <button 
          type="button" 
          class="multi-select-trigger"
          aria-haspopup="listbox"
          aria-expanded="false"
        >
          <span class="multi-select-text">${this.escapeHtml(displayText)}</span>
          <span class="multi-select-arrow">▼</span>
        </button>
        <div class="multi-select-dropdown" role="listbox" style="display: none;">
          ${this.options.map(opt => `
            <label class="multi-select-option">
              <input 
                type="checkbox" 
                value="${this.escapeHtml(opt.value)}"
                ${this.selectedValues.has(opt.value) ? 'checked' : ''}
              >
              <span>${this.escapeHtml(opt.label)}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
        this.triggerElement = this.container.querySelector('.multi-select-trigger');
        this.dropdownElement = this.container.querySelector('.multi-select-dropdown');
        this.setupEventListeners();
    }
    setupEventListeners() {
        if (!this.triggerElement || !this.dropdownElement)
            return;
        // Toggle dropdown
        this.triggerElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });
        // Handle checkbox changes
        const checkboxes = this.dropdownElement.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const target = e.target;
                if (target.checked) {
                    this.selectedValues.add(target.value);
                }
                else {
                    this.selectedValues.delete(target.value);
                }
                this.updateDisplay();
                this.dispatchChangeEvent();
            });
        });
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.close();
            }
        });
        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }
    toggle() {
        if (this.isOpen) {
            this.close();
        }
        else {
            this.open();
        }
    }
    open() {
        if (!this.dropdownElement || !this.triggerElement)
            return;
        this.isOpen = true;
        this.dropdownElement.style.display = 'block';
        this.triggerElement.setAttribute('aria-expanded', 'true');
        this.triggerElement.classList.add('active');
    }
    close() {
        if (!this.dropdownElement || !this.triggerElement)
            return;
        this.isOpen = false;
        this.dropdownElement.style.display = 'none';
        this.triggerElement.setAttribute('aria-expanded', 'false');
        this.triggerElement.classList.remove('active');
    }
    updateDisplay() {
        if (!this.triggerElement)
            return;
        const selectedCount = this.selectedValues.size;
        const displayText = selectedCount > 0
            ? (this.config.showCount ? `${selectedCount} selected` : this.getSelectedLabels().join(', '))
            : this.config.placeholder || 'Select...';
        const textElement = this.triggerElement.querySelector('.multi-select-text');
        if (textElement) {
            textElement.textContent = displayText;
        }
    }
    getSelectedLabels() {
        return this.options
            .filter(opt => this.selectedValues.has(opt.value))
            .map(opt => opt.label);
    }
    getSelectedValues() {
        return Array.from(this.selectedValues);
    }
    setSelectedValues(values) {
        this.selectedValues = new Set(values);
        this.updateCheckboxes();
        this.updateDisplay();
    }
    updateCheckboxes() {
        if (!this.dropdownElement)
            return;
        const checkboxes = this.dropdownElement.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const input = checkbox;
            const value = input.value;
            input.checked = this.selectedValues.has(value);
        });
    }
    dispatchChangeEvent() {
        this.container.dispatchEvent(new CustomEvent('multiselect:change', {
            detail: {
                selectedValues: this.getSelectedValues()
            },
            bubbles: true
        }));
    }
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
//# sourceMappingURL=MultiSelect.js.map