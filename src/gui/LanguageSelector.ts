import { Button, Control, StackPanel } from "@babylonjs/gui";
import ISelector from "../interfaces/ISelector";
import puzzleAssetsManager from "../components/behaviors/PuzzleAssetsManager";
import Constants from "../components/common/Constants";
import ctx from "../components/common/SceneContext";

export default class LanguageSelector extends StackPanel implements ISelector {
    private _selectionObserver: ((code: string) => void) | null = null;
    private flagButtons: Record<string, Button> = {};
    private selectedLanguage: string;

    constructor(selectedLanguage: string) {
        super(Constants.ISELECTOR);
        this.isVertical = false;
        this.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

        const languages = [
            { code: "en", flag: "assets/flags/en.webp", flagSmall: "assets/flags/en-small.webp" },
            { code: "es", flag: "assets/flags/es.webp", flagSmall: "assets/flags/es-small.webp" },
            { code: "de", flag: "assets/flags/de.webp", flagSmall: "assets/flags/de-small.webp" },
            { code: "fr", flag: "assets/flags/fr.webp", flagSmall: "assets/flags/fr-small.webp" },
            { code: "it", flag: "assets/flags/it.webp", flagSmall: "assets/flags/it-small.webp" },
            { code: "cs", flag: "assets/flags/cz.webp", flagSmall: "assets/flags/cz-small.webp" },
            { code: "sk", flag: "assets/flags/sk.webp", flagSmall: "assets/flags/sk-small.webp" },
        ];

        this.selectedLanguage = selectedLanguage;

        languages.forEach(lang => {
            const btn = Button.CreateImageOnlyButton(`lang_${lang.code}`, lang.flagSmall);
            btn.color = lang.code === this.selectedLanguage ? "#EA6A15" : "#cccccc"; // selection border

            btn.onPointerClickObservable.add(() => {
                this.selectedItem = lang.code;

                const border = this.heightInPixels / 6;

                // Update visual state of all buttons
                Object.entries(this.flagButtons).forEach(([code, button]) => {
                    button.thickness = code === this.selectedLanguage ? border : 0;
                    button.color = code === this.selectedLanguage ? "#EA6A15" : "#cccccc";
                    button.paddingTopInPixels = code === this.selectedLanguage ? 0 : border;
                    button.paddingBottomInPixels = code === this.selectedLanguage ? 0 : border;
                    button.paddingLeftInPixels = code === this.selectedLanguage ? 0 : border;
                    button.paddingRightInPixels = code === this.selectedLanguage ? 0 : border;
                });

                if (this._selectionObserver) {
                    this._selectionObserver(this.selectedLanguage);
                }
            });

            this.flagButtons[lang.code] = btn;
            this.addControl(btn);

            puzzleAssetsManager.addGuiImageButtonSource(btn, lang.flag);
        });
    }

    get id(): string {
        return "giftLanguage";  // TODO
    }

    get selectedItem(): any {
        return this.selectedLanguage;
    }

    set selectedItem(value: any) {
        this.selectedLanguage = value;
        this.resize(this.heightInPixels);
    }

    resize(height: number): void {
        this.heightInPixels = height;
        const buttonwidth = height * 4 / 3;
        const border = height / 6;
        const cornerRadius = height / 5;
        // Update visual state of all buttons
        Object.entries(this.flagButtons).forEach(([code, button]) => {
            button.widthInPixels = buttonwidth;
            button.heightInPixels = height;
            button.cornerRadius = cornerRadius;
            button.thickness = code === this.selectedLanguage ? border : 0;
            button.paddingTopInPixels = code === this.selectedLanguage ? 0 : border;
            button.paddingBottomInPixels = code === this.selectedLanguage ? 0 : border;
            button.paddingLeftInPixels = code === this.selectedLanguage ? 0 : border;
            button.paddingRightInPixels = code === this.selectedLanguage ? 0 : border;
        });
    }

    get ui(): Control {
        return this;
    }

    public set selectionObserver(value: (code: string) => void) {
        this._selectionObserver = value;
    }
}