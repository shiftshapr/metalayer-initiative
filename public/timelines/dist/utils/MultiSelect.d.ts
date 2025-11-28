/**
 * Multi-Select Dropdown Component
 * X-style dark mode multi-select dropdown
 */
export interface MultiSelectOption {
    value: string;
    label: string;
    selected?: boolean;
}
export interface MultiSelectConfig {
    placeholder?: string;
    maxHeight?: string;
    showCount?: boolean;
}
export declare class MultiSelect {
    private container;
    private options;
    private selectedValues;
    private config;
    private isOpen;
    private dropdownElement;
    private triggerElement;
    constructor(container: HTMLElement, options: MultiSelectOption[], config?: MultiSelectConfig);
    render(): void;
    private setupEventListeners;
    private toggle;
    private open;
    private close;
    private updateDisplay;
    private getSelectedLabels;
    getSelectedValues(): string[];
    setSelectedValues(values: string[]): void;
    private updateCheckboxes;
    private dispatchChangeEvent;
    private escapeHtml;
}
//# sourceMappingURL=MultiSelect.d.ts.map