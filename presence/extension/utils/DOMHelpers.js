/**
 * DOM Helpers
 * Utility functions for DOM manipulation and queries
 */
export class DOMHelpers {
    static findParentByClass(element, className) {
        let current = element.parentElement;
        while (current) {
            if (current.classList.contains(className)) {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }
    static findParentByTag(element, tagName) {
        let current = element.parentElement;
        while (current) {
            if (current.tagName.toLowerCase() === tagName.toLowerCase()) {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }
    static findParentBySelector(element, selector) {
        let current = element.parentElement;
        while (current) {
            if (current.matches(selector)) {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }
    static getElementOffset(element) {
        const rect = element.getBoundingClientRect();
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return {
            top: rect.top + scrollTop,
            left: rect.left + scrollLeft
        };
    }
    static isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 &&
            rect.top >= 0 && rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth;
    }
    static isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight &&
            rect.left < window.innerWidth &&
            rect.bottom > 0 &&
            rect.right > 0;
    }
    static getScrollParent(element) {
        if (!element)
            return document.body;
        const overflow = window.getComputedStyle(element).overflow;
        if (overflow === 'auto' || overflow === 'scroll') {
            return element;
        }
        return element.parentElement ? this.getScrollParent(element.parentElement) : document.body;
    }
    static smoothScrollTo(element, options = {}) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
            ...options
        });
    }
    static createElementFromHTML(htmlString) {
        const div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        return div.firstElementChild;
    }
    static removeElement(element) {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }
    static addClass(element, className) {
        element.classList.add(className);
    }
    static removeClass(element, className) {
        element.classList.remove(className);
    }
    static toggleClass(element, className) {
        element.classList.toggle(className);
    }
    static hasClass(element, className) {
        return element.classList.contains(className);
    }
    static setAttribute(element, name, value) {
        element.setAttribute(name, value);
    }
    static getAttribute(element, name) {
        return element.getAttribute(name);
    }
    static removeAttribute(element, name) {
        element.removeAttribute(name);
    }
    static setDataAttribute(element, name, value) {
        element.setAttribute(`data-${name}`, value);
    }
    static getDataAttribute(element, name) {
        return element.getAttribute(`data-${name}`);
    }
    static querySelector(selector, context = document) {
        return context.querySelector(selector);
    }
    static querySelectorAll(selector, context = document) {
        return context.querySelectorAll(selector);
    }
    static createElement(tagName, options = {}) {
        const element = document.createElement(tagName);
        if (options.className)
            element.className = options.className;
        if (options.id)
            element.id = options.id;
        return element;
    }
}
// Export convenience functions
export function querySelector(selector, context) {
    return DOMHelpers.querySelector(selector, context);
}
export function createElement(tagName, options) {
    return DOMHelpers.createElement(tagName, options);
}
// Export singleton instance
let domHelpersInstance = null;
export function getDOMHelpers() {
    if (!domHelpersInstance) {
        domHelpersInstance = new DOMHelpers();
    }
    return domHelpersInstance;
}
//# sourceMappingURL=DOMHelpers.js.map