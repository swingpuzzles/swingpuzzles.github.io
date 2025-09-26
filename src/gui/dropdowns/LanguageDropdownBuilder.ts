import { Control } from "@babylonjs/gui";
import DropdownBuilder from "./DropdownBuilder";
import { GameMode } from "../../core3d/behaviors/GameModeManager";
import localStorageManager, { CommonStorageKeys, GiftStorageKeys } from "../../common/LocalStorageManager";
import analyticsManager from "../../common/AnalyticsManager";
import languageManager, { LanguageNames, SupportedLanguage, SupportedLanguages } from "../../common/i18n/LanguageManager";

export default class LanguageDropdownBuilder extends DropdownBuilder {
    private _optionSelected: boolean = false;

    constructor() {
        super({
            gameModes: [ GameMode.Initial ],
            halign: Control.HORIZONTAL_ALIGNMENT_RIGHT,
            thickness: 0,
            isImageCollapsedAlsoTextExpanded: true,
            isImageOnly: true,
            selectionCallback: (key, userAction) => { this.selectionCallback(key, userAction); }
        });

        // Language is automatically loaded from URL via getLocalStorageItemsFromUrl in PuzzleUrlHelper
        // No need to manually handle it here

        const languageEntries = Object.entries(LanguageNames);
        for (const language of languageEntries) {
            this.addImageOption(language[0], language[1]);
        }
    }

    protected get storageItemName(): string {
        return CommonStorageKeys.Language;
    }

    private selectionCallback(key: string, userAction: boolean = true) {
        const language = Object.entries(LanguageNames).find(c => c[1] === key);

        if (language) {
            this.selectAction((language[0] as SupportedLanguage), language[1], userAction);
        }
    }

    addImageOption(id: string, name: string) {
        this.addOption(name, `assets/flags/${id}.webp`);
    }

    selectAction(id: SupportedLanguage, name: string, userAction: boolean = true) {
        localStorageManager.set(this.storageItemName, id);

        // Track category change in dropdown
        if (userAction) {
            analyticsManager.trackDropdownInteraction('language_dropdown', id);
        }

        languageManager.setLanguage(id);
        localStorageManager.set(GiftStorageKeys.GiftLanguage, id);

        if (userAction) {
            //tutorialManager.showPuzzleChooserHint();    // TODO tutorial action?
        }
    }

    public refreshSelection() {
        const currentLanguage = languageManager.currentLanguage;
        const languageName = LanguageNames[currentLanguage];
        
        if (languageName) {
            this.dropdown.doSelectAction(languageName, `assets/flags/${currentLanguage}.webp`, null, false, false);

            if (!localStorageManager.getString(GiftStorageKeys.GiftLanguage)) {console.trace('refreshSelection set language: ', currentLanguage);
                localStorageManager.set(GiftStorageKeys.GiftLanguage, currentLanguage);
            }
        }
    }
}
