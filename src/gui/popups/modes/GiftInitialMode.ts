import { IPopupMode, PopupElements } from "../IPopupMode";

export class GiftInitialMode implements IPopupMode {
    readonly manualOrientation = false;
    readonly overviewMode = false;

    configure(
        elements: PopupElements,
        coverImageUrl: string | undefined,
        getCoverUrl: () => string,
        getGiftDataUrl: () => string,
        isNextButtonVisible: (value: boolean) => boolean,
        backButtonText: string
    ): void {
        elements.nextButton.isVisible = isNextButtonVisible(true);
        elements.centerImage.isVisible = true;
    }
}

