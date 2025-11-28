/**
 * GoVisibleModal - Simple modal for prompting user to go visible
 *
 * Shown when user clicks on visibility section while toggle is "No"
 */
declare class GoVisibleModal {
    private modal;
    private isOpen;
    /**
     * Show the Go Visible modal
     */
    show(): void;
    /**
     * Hide the modal
     */
    hide(): void;
    /**
     * Create modal HTML
     */
    private createModal;
}
declare const goVisibleModalInstance: GoVisibleModal;
export { GoVisibleModal, goVisibleModalInstance };
export default GoVisibleModal;
//# sourceMappingURL=GoVisibleModal.d.ts.map