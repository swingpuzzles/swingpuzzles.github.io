import { IPopupMode, PopupElements } from "../IPopupMode";

export class SellMode implements IPopupMode {
    configure(
        elements: PopupElements,
        coverImageUrl: string | undefined,
        getCoverUrl: () => string,
        getGiftDataUrl: () => string,
        isNextButtonVisible: (value: boolean) => boolean,
        backButtonText: string
    ): void {
        elements.getItButton.isVisible = true;
        elements.notNowButton.isVisible = true;
        elements.coverImage.isVisible = true;
        elements.textAreaRect.alpha = 0.8;
        
        if (coverImageUrl) {
            elements.coverImage.source = coverImageUrl;
        }
    }
}

