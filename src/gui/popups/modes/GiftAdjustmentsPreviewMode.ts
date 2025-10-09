import { IPopupMode, PopupElements } from "../IPopupMode";

export class GiftAdjustmentsPreviewMode implements IPopupMode {
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
        elements.coverImage.isVisible = true;
        elements.textAreaRect.alpha = 0;
    }
}

