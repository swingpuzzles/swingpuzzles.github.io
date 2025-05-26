import { Button, Control, StackPanel } from "@babylonjs/gui";
import ISelector from "../interfaces/ISelector";
import puzzleAssetsManager from "../components/behaviors/PuzzleAssetsManager";

export default class LanguageSelector extends StackPanel implements ISelector {
    private _selectionObserver: ((code: string) => void) | null = null;

    constructor() {
        super();
        this.isVertical = false;
        this.height = "30px";
        //this.spacing = "10px";
        this.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

        const languages = [
            { code: "en", flag: "assets/flags/en.webp", flagSmall: "assets/flags/en-small.webp" },
            { code: "es", flag: "assets/flags/es.webp", flagSmall: "assets/flags/es-small.webp" },
            { code: "de", flag: "assets/flags/de.webp", flagSmall: "assets/flags/de-small.webp" },
            { code: "fr", flag: "assets/flags/fr.webp", flagSmall: "assets/flags/fr-small.webp" },
            { code: "it", flag: "assets/flags/it.webp", flagSmall: "assets/flags/it-small.webp" },
            { code: "cz", flag: "assets/flags/cz.webp", flagSmall: "assets/flags/cz-small.webp" },
            { code: "sk", flag: "assets/flags/sk.webp", flagSmall: "assets/flags/sk-small.webp" },
        ];

        let selectedLanguage = "en";

        const flagButtons: Record<string, Button> = {};

        languages.forEach(lang => {
            const btn = Button.CreateImageOnlyButton(`lang_${lang.code}`, lang.flagSmall);
            btn.width = "40px";
            btn.height = "30px";
            btn.cornerRadius = 6;
            btn.thickness = lang.code === selectedLanguage ? 5 : 0;
            btn.color = lang.code === selectedLanguage ? "#AF504C" : "#cccccc"; // selection border
            btn.paddingTopInPixels = lang.code === selectedLanguage ? 0 : 5;
            btn.paddingBottomInPixels = lang.code === selectedLanguage ? 0 : 5;
            btn.paddingLeftInPixels = lang.code === selectedLanguage ? 0 : 5;
            btn.paddingRightInPixels = lang.code === selectedLanguage ? 0 : 5;
            btn.background = "#ffffff";

            btn.onPointerClickObservable.add(() => {
                selectedLanguage = lang.code;

                // Update visual state of all buttons
                Object.entries(flagButtons).forEach(([code, button]) => {
                    button.thickness = code === selectedLanguage ? 5 : 0;
                    button.color = code === selectedLanguage ? "#AF504C" : "#cccccc";
                    button.paddingTopInPixels = code === selectedLanguage ? 0 : 5;
                    button.paddingBottomInPixels = code === selectedLanguage ? 0 : 5;
                    button.paddingLeftInPixels = code === selectedLanguage ? 0 : 5;
                    button.paddingRightInPixels = code === selectedLanguage ? 0 : 5;
                });

                if (this._selectionObserver) {
                    this._selectionObserver(selectedLanguage);
                }
            });

            flagButtons[lang.code] = btn;
            this.addControl(btn);

            puzzleAssetsManager.addGuiImageButtonSource(btn, lang.flag);
        });
    }

    get ui(): Control {
        return this;
    }

    public set selectionObserver(value: (code: string) => void) {
        this._selectionObserver = value;
    }
}