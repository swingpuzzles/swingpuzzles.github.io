import { i18nManager, TranslationKeys } from "../../../common/i18n";
import { IPopupMode, PopupElements } from "../IPopupMode";
import popupHint from "../PopupHint";

export class CalendarMode implements IPopupMode {
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
        elements.emptyGreenButton.isVisible = true;
        elements.coverImage.isVisible = true;
        elements.textAreaRect.alpha = 0.8;
        
        if (coverImageUrl) {
            elements.coverImage.source = coverImageUrl;
        }

        popupHint.updateConfirmButtonText(i18nManager.translate(TranslationKeys.UI.BUTTONS.PLAY));
    }
}

