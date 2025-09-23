import { Button, Container, Control, StackPanel, Image, TextBlock, Rectangle, AdvancedDynamicTexture } from "@babylonjs/gui";
import gameModeManager, { GameMode } from "../../core3d/behaviors/GameModeManager";
import { ITranslationEntry } from "../../interfaces/ITranslationEntry";
import { Color3 } from "@babylonjs/core";
import guiManager from "../GuiManager";
import ctx from "../../core3d/common/SceneContext";
import translationManager from "../../core3d/misc/TranslationManager";
import { languageManager } from "../../common/i18n";

export class Dropdown extends Container {
    private button: Button;
    private categoryIcon: Image | null = null;
    private options: StackPanel;
    private dropDownSign: TextBlock;
    private buttonBackground: string;
    private buttonColor: string;
    private itemHeight = 0;
    private _lang: string = "en";
    private translationMap: Map<string, Map<string, string>> = new Map();
    private translationSectionKey?: string;
    private selectionCallback?(key: string, userAction: boolean, text: string): void;

    private _selectedItem!: string;
    private isImageCollapsedAlsoTextExpanded: boolean;
    private isImageOnly: boolean;
    private isDisabled: boolean = false;

    constructor(config: {
        gameModes: GameMode[];
        background: string;
        color: string;
        thickness?: number;
        isImageCollapsedAlsoTextExpanded?: boolean;
        isImageOnly?: boolean;
        valign?: number;
        halign?: number;
        lang?: string;
        translationSectionKey?: string;
        selectionCallback?(key: string, userAction: boolean, text: string): void;
    }) {
        super();

        this.zIndex = 300;

        this.buttonBackground = config.background;
        this.buttonColor = config.color;
        this.translationSectionKey = config.translationSectionKey;
        this._lang = config.lang ?? this._lang;
        this.selectionCallback = config.selectionCallback;
        
        if (config.translationSectionKey) {
            this.translationMap = translationManager.getSection(config.translationSectionKey)!;
        }

        this.verticalAlignment = config.valign ?? Control.VERTICAL_ALIGNMENT_TOP;
        this.horizontalAlignment = config.halign ?? Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.isHitTestVisible = false;

        this.isImageCollapsedAlsoTextExpanded = config.isImageCollapsedAlsoTextExpanded ?? false;
        this.isImageOnly = config.isImageOnly ?? false;

        // Create button
        if (this.isImageOnly) {
            this.button = Button.CreateImageOnlyButton("Dropdown", "")
            this.button.image!.stretch = Image.STRETCH_UNIFORM;
            
            this.button.background = "";
            this.button.horizontalAlignment = config.halign ?? Control.HORIZONTAL_ALIGNMENT_LEFT;

            // Create and store the nested image (category icon)
            if (this.isImageCollapsedAlsoTextExpanded) {
                this.button.width = "20%"
                this.button.image!.source = "assets/buttons/category-button.webp";

                // Create and store the nested image (category icon)
                this.categoryIcon = new Image("categoryIcon", "");
                this.categoryIcon.width = "75%";
                this.categoryIcon.height = "75%";
                this.categoryIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
                this.categoryIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
                this.categoryIcon.paddingRight = "5%";
                this.categoryIcon.paddingBottom = "20%";

                this.button.addControl(this.categoryIcon);
            }

            //this.button.addControl(this.buttonImage);
        } else {
            this.button = Button.CreateSimpleButton("Dropdown", "");
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
        this.dropDownSign.alpha = 0.7;
        this.button.addControl(this.dropDownSign);

        // Create options
        this.options = new StackPanel();
        this.options.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.options.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.options.isVisible = false;
        this.options.isVertical = true;

        this.button.onPointerClickObservable.add(() => {
            this.toggleExpand();

            if (this.options.isVisible) {
                const measure = this.button._currentMeasure;

                this.options.topInPixels = measure.top + measure.height;
                this.options.widthInPixels = this.isImageCollapsedAlsoTextExpanded ? 7 * ctx.engine.getRenderHeight() / 20 : measure.width;

                this.options.zIndex = this.zIndex + 0.1;

                if (this.horizontalAlignment === Control.HORIZONTAL_ALIGNMENT_LEFT) {   
                    this.options.leftInPixels = measure.left;
                } else {
                    this.options.leftInPixels = measure.left - this.options.widthInPixels + measure.width;
                }
            }
        });

        this.addControl(this.button);
        guiManager.advancedTexture.addControl(this.options);
        
        this.isVisible = config.gameModes.includes(gameModeManager.currentMode);

        gameModeManager.addGameModeChangedObserver(() => {
            this.isVisible = config.gameModes.includes(gameModeManager.currentMode) && !this.isDisabled;
        });
    }

    public toggleExpand(): void {
        if (!this.options.isVisible) {  // we have AdvancedDynamicTexture for auto collapse
           this.expand();
        }
    }

    public expand(): void {
        this.options.isVisible = true;
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, ctx.scene);
        const clickOutRectangle = new Rectangle("clickOutRectangle");
        clickOutRectangle.alpha = 0;
        clickOutRectangle.isPointerBlocker = false;
        clickOutRectangle.onPointerClickObservable.add(() => {
            this.collapse();
            advancedTexture.removeControl(clickOutRectangle);
            clickOutRectangle.dispose();
            advancedTexture.dispose();
        });

        advancedTexture.addControl(clickOutRectangle);
    }

    public collapse(): void {
        this.options.isVisible = false;
    }

    public disable(): void {
        this.isDisabled = true;
        this.isVisible = false;
    }

    public set lang(value: string) {
        if (value === this._lang) {
            return;
        }

        this._lang = value;

        for (const child of this.options.children) {
            if (child instanceof Button && child.textBlock && child.name) {
                child.textBlock.text = this.translationMap.get(child.name)?.get(this._lang) ?? child.name;

                if (child.name === this._selectedItem) {
                    this.doSelectAction(child.name, null, null, false);
                }
            }
        }
    }

    public set foreground(value: Color3) {
        const color = value.toHexString();

        const brightness = 0.299 * value.r + 0.587 * value.g + 0.114 * value.b;
        const bright = brightness > 0.5;
        const bg = bright ? "black" : "white";

        this.button.textBlock!.color = color; // convert Color3 to CSS hex string

        this.dropDownSign.color = bright ? "white" : "black";
        this.button.background = bg;

        for (const o of this.options.children) {
            o.color = color;
            (o as Button).background = bg;
        }
    }

    public set dropdownFontFamily(value: string) {
        if (this.button.textBlock) {
            this.button.textBlock.fontFamily = value;
        }

        this.options.fontFamily = value;
    }

    resize(width: number, height: number, optionWidth: number, ignoreTop: boolean = false) {
        this.itemHeight = height;

        this.widthInPixels = width;
        this.options.width = this.isImageCollapsedAlsoTextExpanded ? width : optionWidth;

        if (!ignoreTop) {
            this.topInPixels = this.itemHeight / 4;
        }

        if (this.isImageCollapsedAlsoTextExpanded) {
            this.leftInPixels = this.horizontalAlignment === Control.HORIZONTAL_ALIGNMENT_LEFT ? this.itemHeight / 4 : -this.itemHeight / 4;
            //this.paddingRightInPixels = this.itemHeight / 2;
            this.button.heightInPixels = this.itemHeight * 1.8;
            this.dropDownSign.paddingBottomInPixels = this.itemHeight / 5;
        } else {
            if (this.button.textBlock) {
                this.button.textBlock.fontSizeInPixels = width / 13;
            }

            this.button.heightInPixels = this.itemHeight - 1;

            if (!this.isImageOnly) {
                this.dropDownSign.paddingRightInPixels = this.itemHeight / 10;
                this.dropDownSign.paddingBottomInPixels = this.itemHeight / 6;
            }
        }

        this.dropDownSign.fontSizeInPixels = this.itemHeight / 2;

        for (const o of this.options.children) {
            if (this.isImageOnly && !this.isImageCollapsedAlsoTextExpanded) {
                o.widthInPixels = this.itemHeight;
            }

            o.heightInPixels = this.itemHeight - 1;
            if ((o as Button).textBlock) {
                (o as Button).textBlock!.fontSizeInPixels = width / 14;
            }
        }
    }

    setContent(text: string, url: string | null = null, fontFamily: string | null = null) {
        if (this.button.textBlock) {
            this.button.textBlock.text = text;

            if (fontFamily) {
                this.button.textBlock.fontFamily = fontFamily;
            }
        }

        if (url && this.button.image!) {
            if (this.isImageCollapsedAlsoTextExpanded) {
                this.categoryIcon!.source = url;
            } else {
                this.button.image!.source = url;
            }
        }
    }

    doSelectAction(idText: string, imageUrl: string | null = null, fontFamily: string | null = null,
            userAction: boolean = true, callCallbackAction: boolean = true): void {
        this._selectedItem = idText;

        const text = this.translationMap.get(idText)?.get(this._lang) ?? idText;

        this.setContent(text, imageUrl, fontFamily);

        if (this.selectionCallback && callCallbackAction) {
            this.selectionCallback(idText, userAction, text);
        }
    }

    selectByCondition(cond: (name: string) => boolean) {
        for (const child of this.options.children) {
            if (child instanceof Button && child.textBlock && child.name) {
                if (cond(child.name)) {
                    this.doSelectAction(child.name, null, null, false);
                    break;
                }
            }
        }
    }

    addItem(idText: string, imageUrl: string | null = null, fontFamily: string | null = null, imageOnly: boolean): void {
        let button: Button;

        const currentLang = languageManager.currentLanguage;
        const text = this.translationMap.get(idText)?.get(currentLang) ?? idText;

        if (imageOnly) {
            button = Button.CreateImageOnlyButton(idText, imageUrl!);
            button.image!.width = "100%";
            button.image!.height = "100%";
            button.image!.stretch = Image.STRETCH_UNIFORM;
        } else if (imageUrl) {
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

    public clearOptions() {
        this.options.clearControls();
    }

    public refreshTranslationMap() {
        if (this.translationSectionKey) {
            this.translationMap = translationManager.getSection(this.translationSectionKey) ?? new Map();
            const currentLang = languageManager.currentLanguage;
            
            // Refresh all button texts with new translation map
            for (const child of this.options.children) {
                if (child instanceof Button && child.textBlock && child.name) {
                    child.textBlock.text = this.translationMap.get(child.name)?.get(currentLang) ?? child.name;
                }
            }
            
            // Refresh the main button text if there's a selected item
            if (this._selectedItem) {
                const text = this.translationMap.get(this._selectedItem)?.get(currentLang) ?? this._selectedItem;
                this.setContent(text, null, null);
            }
        }
    }
}
