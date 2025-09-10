import { Button, Container, Control, StackPanel, Image, TextBlock, Rectangle, AdvancedDynamicTexture } from "@babylonjs/gui";
import gameModeManager from "../../core3d/behaviors/GameModeManager";
import guiManager from "../GuiManager";
import ctx from "../../core3d/common/SceneContext";
import translationManager from "../../core3d/misc/TranslationManager";
export class Dropdown extends Container {
    constructor(config) {
        var _a, _b, _c, _d, _e, _f;
        super();
        this.categoryIcon = null;
        this.itemHeight = 0;
        this._lang = "en";
        this.translationMap = new Map();
        this.zIndex = 300;
        this.buttonBackground = config.background;
        this.buttonColor = config.color;
        this._lang = (_a = config.lang) !== null && _a !== void 0 ? _a : this._lang;
        this.selectionCallback = config.selectionCallback;
        if (config.translationSectionKey) {
            this.translationMap = translationManager.getSection(config.translationSectionKey);
        }
        this.verticalAlignment = (_b = config.valign) !== null && _b !== void 0 ? _b : Control.VERTICAL_ALIGNMENT_TOP;
        this.horizontalAlignment = (_c = config.halign) !== null && _c !== void 0 ? _c : Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.isHitTestVisible = false;
        this.isCategory = (_d = config.isCategory) !== null && _d !== void 0 ? _d : false;
        this.isImageOnly = (_e = config.isImageOnly) !== null && _e !== void 0 ? _e : false;
        // Create button
        if (this.isImageOnly) {
            this.button = Button.CreateImageOnlyButton("Dropdown", "");
            this.button.image.stretch = Image.STRETCH_UNIFORM;
            this.button.background = "";
            this.button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            // Create and store the nested image (category icon)
            if (this.isCategory) {
                this.button.width = "20%";
                this.button.image.source = "assets/buttons/category-button.webp";
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
        }
        else {
            this.button = Button.CreateSimpleButton("Dropdown", "");
            this.button.background = this.buttonBackground;
            this.button.textBlock.lineSpacing = 0;
        }
        this.button.hoverCursor = "pointer";
        this.button.thickness = (_f = config.thickness) !== null && _f !== void 0 ? _f : 1;
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
                this.options.leftInPixels = measure.left;
                this.options.topInPixels = measure.top + measure.height;
                this.options.widthInPixels = this.isCategory ? 7 * ctx.engine.getRenderHeight() / 20 : measure.width;
                this.options.zIndex = this.zIndex + 0.1;
            }
        });
        this.addControl(this.button);
        guiManager.advancedTexture.addControl(this.options);
        this.isVisible = config.gameModes.includes(gameModeManager.currentMode);
        gameModeManager.addGameModeChangedObserver(() => {
            this.isVisible = config.gameModes.includes(gameModeManager.currentMode);
        });
    }
    toggleExpand() {
        if (!this.options.isVisible) { // we have AdvancedDynamicTexture for auto collapse
            this.expand();
        }
    }
    expand() {
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
    collapse() {
        this.options.isVisible = false;
    }
    set lang(value) {
        var _a, _b;
        if (value === this._lang) {
            return;
        }
        this._lang = value;
        for (const child of this.options.children) {
            if (child instanceof Button && child.textBlock && child.name) {
                child.textBlock.text = (_b = (_a = this.translationMap.get(child.name)) === null || _a === void 0 ? void 0 : _a.get(this._lang)) !== null && _b !== void 0 ? _b : child.name;
                if (child.name === this._selectedItem) {
                    this.doSelectAction(child.name, null, null, false);
                }
            }
        }
    }
    set foreground(value) {
        const color = value.toHexString();
        const brightness = 0.299 * value.r + 0.587 * value.g + 0.114 * value.b;
        const bright = brightness > 0.5;
        const bg = bright ? "black" : "white";
        this.button.textBlock.color = color; // convert Color3 to CSS hex string
        this.dropDownSign.color = bright ? "white" : "black";
        this.button.background = bg;
        for (const o of this.options.children) {
            o.color = color;
            o.background = bg;
        }
    }
    set dropdownFontFamily(value) {
        if (this.button.textBlock) {
            this.button.textBlock.fontFamily = value;
        }
        this.options.fontFamily = value;
    }
    resize(width, height, optionWidth, ignoreTop = false) {
        this.itemHeight = height;
        this.widthInPixels = width;
        this.options.width = this.isCategory ? width : optionWidth;
        if (!ignoreTop) {
            this.topInPixels = this.itemHeight / 4;
        }
        if (!this.isCategory) {
            if (this.button.textBlock) {
                this.button.textBlock.fontSizeInPixels = width / 13;
            }
            this.button.heightInPixels = this.itemHeight - 1;
            if (!this.isImageOnly) {
                this.dropDownSign.paddingRightInPixels = this.itemHeight / 10;
                this.dropDownSign.paddingBottomInPixels = this.itemHeight / 6;
            }
        }
        else {
            this.leftInPixels = this.itemHeight / 4;
            this.button.heightInPixels = this.itemHeight * 1.8;
            this.dropDownSign.paddingBottomInPixels = this.itemHeight / 5;
        }
        this.dropDownSign.fontSizeInPixels = this.itemHeight / 2;
        for (const o of this.options.children) {
            if (this.isImageOnly && !this.isCategory) {
                o.widthInPixels = this.itemHeight;
            }
            o.heightInPixels = this.itemHeight - 1;
            if (o.textBlock) {
                o.textBlock.fontSizeInPixels = width / 14;
            }
        }
    }
    setContent(text, url = null, fontFamily = null) {
        if (this.button.textBlock) {
            this.button.textBlock.text = text;
            if (fontFamily) {
                this.button.textBlock.fontFamily = fontFamily;
            }
        }
        if (url && this.button.image) {
            if (this.isCategory) {
                this.categoryIcon.source = url;
            }
            else {
                this.button.image.source = url;
            }
        }
    }
    doSelectAction(idText, imageUrl = null, fontFamily = null, userAction = true, callCallbackAction = true) {
        var _a, _b;
        this._selectedItem = idText;
        const text = (_b = (_a = this.translationMap.get(idText)) === null || _a === void 0 ? void 0 : _a.get(this._lang)) !== null && _b !== void 0 ? _b : idText;
        this.setContent(text, imageUrl, fontFamily);
        if (this.selectionCallback && callCallbackAction) {
            this.selectionCallback(idText, userAction, text);
        }
    }
    selectByCondition(cond) {
        for (const child of this.options.children) {
            if (child instanceof Button && child.textBlock && child.name) {
                if (cond(child.name)) {
                    this.doSelectAction(child.name, null, null, false);
                    break;
                }
            }
        }
    }
    addItem(idText, imageUrl = null, fontFamily = null, imageOnly) {
        var _a, _b;
        let button;
        const text = (_b = (_a = this.translationMap.get(idText)) === null || _a === void 0 ? void 0 : _a.get(this._lang)) !== null && _b !== void 0 ? _b : idText;
        if (imageOnly) {
            button = Button.CreateImageOnlyButton(idText, imageUrl);
            button.image.width = "100%";
            button.image.height = "100%";
            button.image.stretch = Image.STRETCH_UNIFORM;
        }
        else if (imageUrl) {
            button = Button.CreateImageButton(idText, text, imageUrl);
            button.image.width = "22%";
            button.image.stretch = Image.STRETCH_UNIFORM;
            button.image.paddingTop = "1%";
            button.image.paddingBottom = "1%";
            button.image.paddingLeft = "5%";
            button.image.paddingRight = "5%";
        }
        else {
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
