import { IPopupMode, PopupElements } from "../IPopupMode";

export class NormalMode implements IPopupMode {
    configure(
        elements: PopupElements,
        coverImageUrl: string | undefined,
        getCoverUrl: () => string,
        getGiftDataUrl: () => string,
        isNextButtonVisible: (value: boolean) => boolean,
        backButtonText: string
    ): void {
        elements.gotItButton.isVisible = true;
        elements.centerImage.isVisible = true;
    }
}

