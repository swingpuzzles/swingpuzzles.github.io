import { IPopupMode, PopupElements } from "../IPopupMode";

export class GamePausedMode implements IPopupMode {
    readonly manualOrientation = false;

    configure(
        elements: PopupElements,
        coverImageUrl: string | undefined,
        getCoverUrl: () => string,
        getGiftDataUrl: () => string,
        isNextButtonVisible: (value: boolean) => boolean,
        backButtonText: string
    ): void {
        elements.centerImage.isVisible = true;
        elements.nextButton.isVisible = isNextButtonVisible(true);
        elements.formPanelRect.alpha = 0.8;
        elements.formPanelRect.background = "#F9F6F1FF";
        elements.formPanelRect.width = "97%";
        
        // Override back button text for this mode
        if (elements.backButton.textBlock) {
            elements.backButton.textBlock.text = backButtonText; // Will be "PREVIOUS" instead of "BACK"
        }
    }
}

