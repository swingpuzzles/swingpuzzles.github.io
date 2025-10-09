import { IPopupMode, PopupElements } from "../IPopupMode";

export class PreSellMode implements IPopupMode {
    configure(
        elements: PopupElements,
        coverImageUrl: string | undefined,
        getCoverUrl: () => string,
        getGiftDataUrl: () => string,
        isNextButtonVisible: (value: boolean) => boolean,
        backButtonText: string
    ): void {
        elements.emptyGreenButton.isVisible = true;
        elements.centerImage.isVisible = true;
        elements.coverImage.source = coverImageUrl || getGiftDataUrl() || getCoverUrl();
    }
}

