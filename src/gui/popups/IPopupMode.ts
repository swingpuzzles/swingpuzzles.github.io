import { Image, Rectangle, TextBlock } from "@babylonjs/gui";

/**
 * Configuration settings for popup elements
 */
export interface PopupElements {
    emptyGreenButton: { isVisible: boolean };
    centerImage: { isVisible: boolean };
    coverImage: { isVisible: boolean; source?: string };
    textAreaRect: { alpha: number };
    getItButton: { isVisible: boolean };
    notNowButton: { isVisible: boolean };
    gotItButton: { isVisible: boolean };
    nextButton: { isVisible: boolean };
    formPanelRect: { 
        alpha: number; 
        background: string; 
        width: string; 
    };
    backButton: { textBlock: TextBlock | null };
}

/**
 * Interface for popup mode configuration
 */
export interface IPopupMode {
    /**
     * Configure popup elements for this mode
     * @param elements The popup elements to configure
     * @param coverImageUrl Optional cover image URL
     * @param getCoverUrl Function to get cover URL for current puzzle
     * @param getGiftDataUrl Function to get gift puzzle data URL
     * @param isNextButtonVisible Function to check if next button should be visible
     * @param backButtonText The text for back button (may be overridden)
     */
    configure(
        elements: PopupElements, 
        coverImageUrl: string | undefined,
        getCoverUrl: () => string,
        getGiftDataUrl: () => string,
        isNextButtonVisible: (value: boolean) => boolean,
        backButtonText: string
    ): void;
}

