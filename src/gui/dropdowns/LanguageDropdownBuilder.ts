import { Control } from "@babylonjs/gui";
import DropdownBuilder from "./DropdownBuilder";
import gameModeManager, { GameMode } from "../../core3d/behaviors/GameModeManager";
import localStorageManager, { CommonStorageKeys } from "../../common/LocalStorageManager";
import puzzleUrlHelper from "../../common/PuzzleUrlHelper";
import analyticsManager from "../../common/AnalyticsManager";
import languageManager, { LanguageNames, SupportedLanguage, SupportedLanguages } from "../../common/i18n/LanguageManager";

export default class LanguageDropdownBuilder extends DropdownBuilder {
    private _optionSelected: boolean = false;

    constructor() {
        super({
            gameModes: [ GameMode.Initial ],
            halign: Control.HORIZONTAL_ALIGNMENT_RIGHT,
            thickness: 0,
            isCategory: true,
            isImageOnly: true,
            selectionCallback: (key, userAction) => { this.selectionCallback(key, userAction); }
        });

        // Language is automatically loaded from URL via getLocalStorageItemsFromUrl in PuzzleUrlHelper
        // No need to manually handle it here

        const languageEntries = Object.entries(LanguageNames);
        for (let i = 0; i < languageEntries.length; i++) {
            const language = languageEntries[i];
            const isLast = i === languageEntries.length - 1;
            this.addImageOption(language[0], language[1], isLast);
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

    addImageOption(id: string, name: string, last: boolean = false) {
        this.addOption(name, `assets/flags/${id}.webp`);

        if (!localStorageManager.getString(this.storageItemName) || (Object.keys(SupportedLanguages).indexOf(localStorageManager.getString(this.storageItemName)!) <= -1)) {
            localStorageManager.set(this.storageItemName, id);
        }

        if (localStorageManager.getString(this.storageItemName) === id || last && !this._optionSelected) {
            this.dropdown.doSelectAction(name, `assets/flags/${id}.webp`, null, false, false);
            this._optionSelected = true;
        }
    }

    selectAction(id: SupportedLanguage, name: string, userAction: boolean = true) {
        localStorageManager.set(this.storageItemName, id);

        // Track category change in dropdown
        if (userAction) {
            analyticsManager.trackDropdownInteraction('language_dropdown', id);
        }
        // TODO: implement language change
        languageManager.setLanguage(id);
        //gameModeManager.handleLanguageChange(id, userAction);

        if (userAction) {
            //tutorialManager.showPuzzleChooserHint();    // TODO tutorial action?
        }
    }
}
