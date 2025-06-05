import { Button, Container, Control, StackPanel, Image, TextBlock } from "@babylonjs/gui";
import gameModeManager, { GameMode } from "../../components/behaviors/GameModeManager";
import { ITranslationEntry } from "../../interfaces/ITranslationEntry";
import { Color3 } from "@babylonjs/core";

export class Dropdown extends Container {
    private button: Button;
    private options: StackPanel;
    private categoryIcon: Image | null = null;
    private dropDownSign: TextBlock;
    private buttonBackground: string;
    private buttonColor: string;
    private itemHeight = 0;
    private _lang: string = "en";
    private translationMap: Map<string, Map<string, string>> = new Map();
    private selectionCallback?(key: string, userAction: boolean): void;
    //private width = 0;

    constructor(config: {
        gameModes: GameMode[];
        background: string;
        color: string;
        thickness?: number;
        icon?: string;
        valign?: number;
        halign?: number;
        lang?: string;
        translationEntry?: ITranslationEntry[];
        selectionCallback?(key: string, userAction: boolean): void;
    }) {
        super();

        this.buttonBackground = config.background;
        this.buttonColor = config.color;
        this._lang = config.lang ?? this._lang;
        this.selectionCallback = config.selectionCallback;
        
        if (config.translationEntry) {
            for (let te of config.translationEntry) {
                let innerMap: Map<string, string> = new Map();

                for (const [lang, text] of Object.entries(te.translations)) {
                    innerMap.set(lang, text);
                }

                this.translationMap.set(te.id, innerMap);
            }
        }

        this.verticalAlignment = config.valign ?? Control.VERTICAL_ALIGNMENT_TOP;
        this.horizontalAlignment = config.halign ?? Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.isHitTestVisible = false;
        this.zIndex = 30;

        // Create button
        if (config.icon) {
            this.button = Button.CreateImageOnlyButton("Please Select", config.icon)
            
            this.button.background = "";
            this.button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            this.button.width = "20%"

            // Create and store the nested image (category icon)
            this.categoryIcon = new Image("categoryIcon", "");
            this.categoryIcon.width = "75%";
            this.categoryIcon.height = "75%";
            this.categoryIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            this.categoryIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            this.categoryIcon.paddingRight = "5%";
            this.categoryIcon.paddingBottom = "20%";

            this.button.addControl(this.categoryIcon);
        } else {
            this.button = Button.CreateSimpleButton("Please Select", "Please Select");
            this.button.background = this.buttonBackground;
            this.button.textBlock!.lineSpacing = 0;
        }

        this.button.hoverCursor = "pointer";
        this.button.thickness = config.thickness ?? 1;
        this.button.color = this.buttonColor;
        this.button.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        this.dropDownSign = new TextBlock("dropDownSign", "▼");
        this.dropDownSign.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.dropDownSign.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.dropDownSign.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.dropDownSign.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.button.addControl(this.dropDownSign);

        // Create options
        this.options = new StackPanel();
        this.options.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.options.isVisible = false;
        this.options.isVertical = true;

        this.button.onPointerClickObservable.add(() => {
            this.options.isVisible = !this.options.isVisible;
        });

        this.onPointerEnterObservable.add(() => {
            this.zIndex = 555;
        });

        this.onPointerOutObservable.add(() => {
            this.zIndex = 30;
            this.options.isVisible = false;
        });

        this.addControl(this.button);
        this.addControl(this.options);
        
        gameModeManager.addGameModeChangedObserver(() => {
            this.isVisible = config.gameModes.includes(gameModeManager.currentMode);
        });
    }

    public set lang(value: string) {
        if (value === this._lang) {
            return;
        }

        this._lang = value;

        for (const child of this.options.children) {
            if (child instanceof Button && child.textBlock && child.name) {
                child.textBlock.text = this.translationMap.get(child.name)?.get(this.lang) ?? child.name
            }
        }
    }

    public set foreground(value: Color3) {
        const color = value.toHexString();

        const brightness = 0.299 * value.r + 0.587 * value.g + 0.114 * value.b;
        const bg = brightness > 0.5 ? "black" : "white";

        this.button.color = color; // convert Color3 to CSS hex string

        this.button.background = bg;

        for (const o of this.options.children) {
            o.color = color;
            (o as Button).background = bg;
        }
    }

    resize(height: number) {
        this.itemHeight = height;
        const width = height * 7;

        this.widthInPixels = width;
        this.topInPixels = this.itemHeight / 4;
        this.options.topInPixels = this.itemHeight;

        if (this.button.textBlock) {
            this.button.textBlock.fontSizeInPixels = this.itemHeight / 2;
            this.button.heightInPixels = this.itemHeight;
            this.dropDownSign.paddingRightInPixels = this.itemHeight / 10;
            this.dropDownSign.paddingBottomInPixels = this.itemHeight / 6;
        } else {
            this.leftInPixels = this.itemHeight / 4;
            this.button.heightInPixels = this.itemHeight * 1.8;
            this.dropDownSign.paddingBottomInPixels = this.itemHeight / 5;
        }

        this.dropDownSign.fontSizeInPixels = this.itemHeight / 2;

        for (const o of this.options.children) {
            o.heightInPixels = this.itemHeight;
            (o as Button).textBlock!.fontSizeInPixels = this.itemHeight / 2;
        }
    }

    setContent(text: string, url: string | null = null, fontFamily: string | null = null) {
        if (this.button.textBlock) {
            this.button.textBlock.text = text;

            if (fontFamily) {
                this.button.textBlock.fontFamily = fontFamily;
            }
        }

        if (url && this.categoryIcon) {
            this.categoryIcon.source = url;
        }
    }

    doSelectAction(idText: string, imageUrl: string | null = null, fontFamily: string | null = null, userAction: boolean = true): void {
        this.options.isVisible = false;

        const text = this.translationMap.get(idText)?.get(this._lang) ?? idText;

        this.setContent(text, imageUrl, fontFamily);

        if (this.selectionCallback) {
            this.selectionCallback(idText, userAction);
        }
    }

    addItem(idText: string, imageUrl: string | null = null, fontFamily: string | null = null): void {
        let button: Button;

        const text = this.translationMap.get(idText)?.get(this._lang) ?? idText;

        if (imageUrl) {
            button = Button.CreateImageButton(idText, text, imageUrl);
            button.image!.width = "22%";
            button.image!.stretch = Image.STRETCH_UNIFORM;
            button.image!.paddingTop = "1%";
            button.image!.paddingBottom = "1%";
            button.image!.paddingLeft = "5%";
            button.image!.paddingRight = "5%";
        } else {
            button = Button.CreateSimpleButton(idText, text);
        }

        if (fontFamily && button.textBlock) {
            button.textBlock.fontFamily = fontFamily;
        }

        button.heightInPixels = this.itemHeight;
        button.paddingTopInPixels = -1;
        button.background = this.buttonBackground;
        button.color = this.buttonColor;

        button.onPointerClickObservable.add(() => {
            this.doSelectAction(idText, imageUrl, fontFamily);
        });

        this.options.addControl(button);
    }
}
