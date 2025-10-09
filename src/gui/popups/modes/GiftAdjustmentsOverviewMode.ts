import { IPopupMode, PopupElements } from "../IPopupMode";

export class GiftAdjustmentsOverviewMode implements IPopupMode {
    configure(
        elements: PopupElements,
        coverImageUrl: string | undefined,
        getCoverUrl: () => string,
        getGiftDataUrl: () => string,
        isNextButtonVisible: (value: boolean) => boolean,
        backButtonText: string
    ): void {
        elements.coverImage.isVisible = true;
        elements.textAreaRect.alpha = 0.8;
        elements.formPanelRect.alpha = 0.8;
        elements.formPanelRect.background = "#F9F6F1FF";
        elements.formPanelRect.width = "97%";
    }
}

