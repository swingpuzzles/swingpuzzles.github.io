import { Container, Control, Rectangle, StackPanel, TextBlock, Image, Button, InputText } from "@babylonjs/gui";
import { Animation, Animatable } from "@babylonjs/core"
import puzzleAssetsManager from "../components/behaviors/PuzzleAssetsManager";
import sceneInitializer from "../components/SceneInitializer";
import ctx from "../components/common/SceneContext";
import screenShader, { ShaderMode } from "./ScreenShader";
import guiManager from "./GuiManager";
import handImagePool from "./HandImagePool";
import puzzleCircleBuilder from "../components/builders/PuzzleCircleBuilder";
import { FormInputModel } from "../model/FormInputModel";
import ISelector from "../interfaces/ISelector";
import Constants from "../components/common/Constants";

export enum PopupMode {
    Normal,
    PreSell,
    Sell,
    Gift_Initial,
    Gift_Adjustments_Hint,
    Gift_Adjustments_Preview
}

class PopupHint {
    private readonly _fadeDuration = 10;

    private inputTextArea!: TextBlock;
    private welcomeText!: TextBlock;
    private topImage!: Image;
    private centerImage!: Image;
    private coverImage!: Image;
    private middleImage!: Image;
    private textAreaRect!: Rectangle;
    private mainContainer!: Container;
    private mainRect!: Rectangle;
    private topRect!: Rectangle;
    private centerRect!: Rectangle;
    private bottomRect!: Rectangle;
    private middleTopStack!: StackPanel;
    private formPanel!: StackPanel;
    private gotItButton!: Button;
    private emptyGreenButton!: Button;
    private getItButton!: Button;
    private notNowButton!: Button;
    private backButton!: Button;
    private nextButton!: Button;
    private xButton!: Button;
    private _sizeCoef = 0.87;
    private _action: () => void = () => {};
    private _closeAction: () => void = () => {};
    private _backAction: () => void = () => {};
    private _currentAnimation: Animatable | null = null;
    private _popupMode!: PopupMode;

    init() {
        this.mainContainer = new Container("PopupHintContainer");
        this.mainContainer.isVisible = false;
        this.mainContainer.alpha = 0;
        guiManager.advancedTexture.addControl(this.mainContainer);

        // Main Rectangle
        this.mainRect = new Rectangle("Container");
        this.mainRect.color = "#B15E0AFF";
        this.mainRect.thickness = 1;
        this.mainRect.shadowOffsetX = 2;
        this.mainRect.shadowOffsetY = 2;
        this.mainRect.shadowColor = "#B15E0AFF";
        this.mainRect.isHitTestVisible = true;
        this.mainRect.isPointerBlocker = true;
        this.mainRect.width = "100%";
        this.mainRect.height = "100%";
        this.mainContainer.addControl(this.mainRect);

        // Vertical StackPanel inside Rectangle
        const mainStack = new StackPanel("mainStack");
        mainStack.width = "100%";
        mainStack.height = "100%";
        mainStack.isVertical = true;
        this.mainRect.addControl(mainStack);

        // Top Rectangle (with Welcome text and Image)
        this.topRect = new Rectangle("Rectangle");
        this.topRect.width = "100%";
        this.topRect.background = "#FAF0E5FF";
        this.topRect.color = "#AAAAAA";
        mainStack.addControl(this.topRect);

        const topStack = new StackPanel("topStack");
        topStack.height = "100%";
        topStack.isVertical = false;
        this.topRect.addControl(topStack);

        this.topImage = new Image("Image", "assets/popup/mascot-avatar-small.webp");
        topStack.addControl(this.topImage);

        this.welcomeText = new TextBlock("Textblock", "Welcome!");
        this.welcomeText.height = "100%";
        this.welcomeText.color = "#000000";
        this.welcomeText.fontWeight = "bold";
        this.welcomeText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.welcomeText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        topStack.addControl(this.welcomeText);

        // Top Rectangle (with Welcome text and Image)
        this.centerRect = new Rectangle("Rectangle");
        this.centerRect.width = "100%";
        this.centerRect.height = "100%";
        this.centerRect.background = "#FFFFFFFF";
        this.centerRect.color = "#AAAAAA";
        mainStack.addControl(this.centerRect);

        this.centerImage = new Image("Image", "assets/popup/popup-bg-small.webp");
        this.centerImage.width = "100%";
        this.centerImage.height = "100%";
        this.centerRect.addControl(this.centerImage);

        puzzleAssetsManager.addGuiImageSource(this.centerImage, "assets/popup/popup-bg.webp");

        this.coverImage = new Image("Image", "");
        this.coverImage.stretch = Image.STRETCH_UNIFORM;
        this.coverImage.isVisible = false;
        this.coverImage.paddingBottom = "2%";
        this.coverImage.paddingTop = "2%";
        this.coverImage.paddingLeft = "2%";
        this.coverImage.paddingRight = "2%";
        this.centerRect.addControl(this.coverImage);

        // Middle Rectangle (with InputTextArea)
        const middleStack = new StackPanel("middleStack");
        middleStack.width = "100%";
        middleStack.height = "100%";
        middleStack.isVertical = true;
        this.centerRect.addControl(middleStack);

        this.middleTopStack = new StackPanel("middleTopStack");
        this.middleTopStack.width = "100%";
        this.middleTopStack.isVertical = false;
        middleStack.addControl(this.middleTopStack);

        this.middleImage = new Image("Image", "assets/popup/mascot-avatar-small.webp");
        this.middleImage.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.middleImage.paddingBottom = "5px";
        this.middleImage.paddingLeft = "5px";
        this.middleImage.paddingRight = "5px";
        this.middleTopStack.addControl(this.middleImage);

        puzzleAssetsManager.addGuiImageSourceForMultiple([ this.topImage, this.middleImage ], "assets/popup/mascot-avatar.webp");

        this.textAreaRect = new Rectangle("Rectangle");
        this.textAreaRect.height = "auto";
        this.textAreaRect.background = "#F9F6F1FF";
        this.textAreaRect.color = "#000000";
        this.textAreaRect.thickness = 0;
        this.textAreaRect.adaptHeightToChildren = true;
        this.textAreaRect.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.middleTopStack.addControl(this.textAreaRect);

        this.inputTextArea = new TextBlock("InputText");
        this.inputTextArea.isReadOnly = true;
        this.inputTextArea.text = "";
        this.inputTextArea.width = "95%";
        this.inputTextArea.color = "#000000";
        this.inputTextArea.resizeToFit = true;
        this.inputTextArea.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.inputTextArea.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.inputTextArea.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.textAreaRect.addControl(this.inputTextArea);

        this.formPanel = new StackPanel("formPanel");
        this.formPanel.width = "100%";
        this.formPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.formPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.formPanel.color = "#dddddd";
        middleStack.addControl(this.formPanel);

        // Bottom Rectangle (with Buttons)
        this.bottomRect = new Rectangle("Rectangle");
        this.bottomRect.width = "100%";
        this.bottomRect.background = "#FFE6B5FF";
        this.bottomRect.color = "#AAAAAA";
        mainStack.addControl(this.bottomRect);

        this.gotItButton = Button.CreateImageOnlyButton("gotItButton", "assets/buttons/got-it-button-small.webp");
        this.gotItButton.thickness = 0;
        this.gotItButton.background = "";
        this.gotItButton.hoverCursor = "pointer";
        this.gotItButton.width = "40%";
        this.gotItButton.height = "90%";
        this.gotItButton.isHitTestVisible = true;
        this.gotItButton.isPointerBlocker = true;

        this.gotItButton.onPointerClickObservable.add(() => {
            if (this._action) {
                this._action();
            }
        });

        this.bottomRect.addControl(this.gotItButton);

        puzzleAssetsManager.addGuiImageButtonSource(this.gotItButton, "assets/buttons/got-it-button.webp");

        this.emptyGreenButton = Button.CreateImageWithCenterTextButton("yesIDidButton", "Continue", "assets/buttons/empty-green-button.webp");
        this.emptyGreenButton.thickness = 0;
        this.emptyGreenButton.background = "";
        this.emptyGreenButton.hoverCursor = "pointer";
        this.emptyGreenButton.width = "40%";
        this.emptyGreenButton.height = "90%";
        this.emptyGreenButton.isHitTestVisible = true;
        this.emptyGreenButton.isPointerBlocker = true;
        this.emptyGreenButton.textBlock!.color = "#F8EDB8FF";

        this.emptyGreenButton.onPointerClickObservable.add(() => {
            if (this._action) {
                this._action();
            }
        });

        this.bottomRect.addControl(this.emptyGreenButton);

        this.notNowButton = Button.CreateImageOnlyButton("notNowButton", "assets/buttons/not-now-button.webp");
        this.notNowButton.thickness = 0;
        this.notNowButton.background = "";
        this.notNowButton.hoverCursor = "pointer";
        this.notNowButton.paddingLeft = "5%";
        this.notNowButton.width = "45%";
        this.notNowButton.height = "90%";
        this.notNowButton.isHitTestVisible = true;
        this.notNowButton.isPointerBlocker = true;
        this.notNowButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;

        this.notNowButton.onPointerClickObservable.add(() => {
            this.hide();
        });

        this.bottomRect.addControl(this.notNowButton);

        this.getItButton = Button.CreateImageOnlyButton("getItButton", "assets/buttons/banner.png");
        this.getItButton.thickness = 0;
        this.getItButton.background = "";
        this.getItButton.hoverCursor = "pointer";
        this.getItButton.paddingRight = "5%";
        this.getItButton.width = "50%";
        this.getItButton.height = "92%";
        this.getItButton.isHitTestVisible = true;
        this.getItButton.isPointerBlocker = true;
        this.getItButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;

        this.getItButton.onPointerClickObservable.add(() => {
            if (this._action) {
                this._action();
            }
        });

        this.bottomRect.addControl(this.getItButton);

        this.backButton = Button.CreateImageOnlyButton("backButton", "assets/buttons/back-button-small.webp");
        this.backButton.thickness = 0;
        this.backButton.background = "";
        this.backButton.hoverCursor = "pointer";
        this.backButton.paddingLeft = "5%";
        this.backButton.width = "45%";
        this.backButton.height = "90%";
        this.backButton.isHitTestVisible = true;
        this.backButton.isPointerBlocker = true;
        this.backButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;

        this.backButton.onPointerClickObservable.add(() => {
            if (this._backAction) {
                this._backAction();
            }
        });

        puzzleAssetsManager.addGuiImageButtonSource(this.backButton, "assets/buttons/back-button.webp");

        this.bottomRect.addControl(this.backButton);

        this.nextButton = Button.CreateImageOnlyButton("nextButton", "assets/buttons/next-button-small.webp");
        this.nextButton.thickness = 0;
        this.nextButton.background = "";
        this.nextButton.hoverCursor = "pointer";
        this.nextButton.paddingRight = "5%";
        this.nextButton.width = "50%";
        this.nextButton.height = "92%";
        this.nextButton.isHitTestVisible = true;
        this.nextButton.isPointerBlocker = true;
        this.nextButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;

        this.nextButton.onPointerClickObservable.add(() => {
            if (this._action) {
                this._action();
            }
        });

        puzzleAssetsManager.addGuiImageButtonSource(this.nextButton, "assets/buttons/next-button.webp");

        this.bottomRect.addControl(this.nextButton);

        this.xButton = Button.CreateImageOnlyButton("xButton", "assets/buttons/x-button-trans.webp");
        this.xButton.thickness = 0;
        this.xButton.background = "";
        this.xButton.hoverCursor = "pointer";
        this.xButton.isHitTestVisible = true;
        this.xButton.isPointerBlocker = true;
        this.xButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.xButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;

        this.xButton.onPointerClickObservable.add(() => {
            if (this._closeAction) {
                this._closeAction();
            }
        });

        this.mainContainer.addControl(this.xButton);

        sceneInitializer.addResizeObserver((width, height) => {
            this.resize();
        });
    }

    public get formData(): IFormField[] {
        const formData: IFormField[] = [];

        for (const container of this.formPanel.children) {
            for (const child of (container as Container).children) {
                if (child instanceof InputText) {
                    formData.push({ id: child.name!, value: child.text });
                } else if (child.name === Constants.ISELECTOR) {
                    const selector = (child as unknown as ISelector)!;
                    formData.push({ id: selector.id, value: selector.selectedItem });
                }
            }
        }

        return formData;
    }

    public set centerImgUrl(url: string) {
        this.coverImage.source = url;
    }
    
    private clearForm() {
        this.clearRecursive(this.formPanel);
    }

    private clearRecursive(control: Container) {  // TODO to library
        if (control.children) { 
            for (let i = control.children.length - 1; i >= 0; i--) {
                const child = control.children[i];

                if (child instanceof Container) {
                    this.clearRecursive(child);
                }

                control.removeControl(child);
                child.dispose();
            }
        }
    }

    // Helper to create styled labeled input fields
    private createLabeledInput(formInputModel: FormInputModel) {
        const labelText = formInputModel.label;
        const placeholder = formInputModel.placeHolder;
        const container = new StackPanel();

        const label = new TextBlock();
        label.text = labelText;
        label.color = "#222";
        label.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        container.addControl(label);

        switch (formInputModel.type) {
            case "selection":
                container.addControl(formInputModel.selector.ui);
                break;
            default:
                const input = new InputText(formInputModel.id);
                input.color = "#222";
                input.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
                input.background = "#f0f0f0";
                input.focusedBackground = "#e6e6e6"; // Slightly darker when focused
                input.thickness = 1;

                if (placeholder) {
                    input.placeholderText = placeholder;
                }

                switch (formInputModel.type) {
                    case "text":
                        input.width = formInputModel.maxLength ? (Math.min(100, Math.max(formInputModel.maxLength, input.placeholderText.length) * 2.5) + "%") : "100%";
                        input.onTextChangedObservable.add(() => {
                            if (formInputModel.maxLength && input.text.length > formInputModel.maxLength) {
                                input.text = input.text.slice(0, formInputModel.maxLength);
                            }
                        });
                        break;
                    case "number":
                        const maxLength = formInputModel.max ? Math.max(formInputModel.max.toString().length, input.placeholderText.length) : null;
                        input.width = maxLength ? (Math.min(100, maxLength * 2.5) + "%") : "100%";
                        input.onTextChangedObservable.add(() => {
                            input.text = input.text.replace(/\D/g, "");
                            const value = parseInt(input.text, 10);
                            if (isNaN(value)) {
                                input.text = "";
                            } else if (formInputModel.min && value < formInputModel.min) {
                                input.text = "" + formInputModel.min;
                            } else if (formInputModel.max && value > formInputModel.max) {
                                input.text = "" + formInputModel.max;
                            }
                        });
                        break;
                }

                container.addControl(input);
        }

        this.formPanel.addControl(container);
    }

    private resize() {
        const vertical = ctx.engine.getRenderHeight() > ctx.engine.getRenderWidth();
        const minSize = Math.min(ctx.engine.getRenderWidth(), ctx.engine.getRenderHeight());
        const mainHeight = this._popupMode === PopupMode.Gift_Adjustments_Preview && vertical
            ? Math.min(minSize * this._sizeCoef * 1.673, 0.88 * ctx.engine.getRenderHeight())
            : (minSize * this._sizeCoef);
        const topHeightCoef = this._popupMode === PopupMode.Gift_Adjustments_Preview ? 0.1 : 0.2;
        const topHeight = minSize * topHeightCoef;
        const middleHeight = mainHeight - (minSize * (0.1 + 1 / 40)) - topHeight;
        this.mainContainer.widthInPixels = this._popupMode === PopupMode.Gift_Adjustments_Preview && !vertical ? mainHeight * 1.1 : (minSize * 0.87);
        this.mainContainer.heightInPixels = mainHeight;
        this.mainRect.cornerRadius = minSize / 16;
        this.mainContainer.paddingTopInPixels = minSize / 80;
        this.mainContainer.paddingBottomInPixels = minSize / 80;
        this.topRect.heightInPixels = topHeight;
        this.centerRect.heightInPixels = middleHeight;
        this.bottomRect.heightInPixels = minSize * 0.1;
        this.welcomeText.widthInPixels = topHeight * 3.1;//0.62;
        this.welcomeText.fontSizeInPixels = topHeight / 2.8;//14;

        const imageWidth = topHeight;
        const imageHeight = topHeight * 0.925;//0.185;
        this.topImage.widthInPixels = imageWidth;
        this.topImage.heightInPixels = imageHeight;
        this.middleImage.widthInPixels = imageWidth * 0.45;
        this.middleImage.heightInPixels = imageHeight * 0.45;

        this.textAreaRect.widthInPixels = 0.76 * minSize;
        this.textAreaRect.cornerRadius = minSize / 40;

        this.textAreaRect.paddingBottomInPixels = minSize / 160;
        this.inputTextArea.fontSizeInPixels = minSize / 36;

        this.inputTextArea.paddingBottomInPixels = minSize / 80;
        this.inputTextArea.paddingLeftInPixels = 3 * minSize / 160;
        this.inputTextArea.paddingRightInPixels = 3 * minSize / 160;
        this.inputTextArea.paddingTopInPixels = minSize / 80;

        this.xButton.widthInPixels = minSize / 15;
        this.xButton.heightInPixels = minSize / 15;
        this.xButton.paddingTopInPixels = minSize / 240;
        this.xButton.paddingRightInPixels = minSize / 240;

        this.emptyGreenButton.textBlock!.fontSizeInPixels = minSize / 24;

        if (this.formPanel.isVisible) {
            const middleTopPanelRatio = 0.5;
            const formPanelRatio = 1 - middleTopPanelRatio;
            const formPanelheight = formPanelRatio * middleHeight;

            this.middleTopStack.heightInPixels = middleTopPanelRatio * middleHeight;
            this.formPanel.heightInPixels = formPanelheight;

            this.formPanel.paddingLeftInPixels = minSize / 80;
            this.formPanel.paddingRightInPixels = minSize / 80;
            this.formPanel.paddingTopInPixels = formPanelheight / 80;
            this.formPanel.paddingBottomInPixels = formPanelheight / 80;

            const containerHeight = 39 / 40 * formPanelheight / this.formPanel.children.length;

            for (const container of this.formPanel.children) {

                container.heightInPixels = containerHeight;

                for (const child of (container as Container).children) {
                    child.fontSize = 0.26 * containerHeight;
                    if (child instanceof TextBlock) {
                        child.heightInPixels = 0.43 * containerHeight;
                    } else if (child instanceof InputText) {
                        child.heightInPixels = 0.57 * containerHeight;
                    } else if (child.name === Constants.ISELECTOR) {
                        (child as unknown as ISelector)!.resize(0.57 * containerHeight);
                    }
                }
            }
        } else {
            this.middleTopStack.heightInPixels = middleHeight;
            this.formPanel.heightInPixels = 0;
        }
    }
    
    public updateConfirmButtonText(text: string) {
        if (this.emptyGreenButton && this.emptyGreenButton.textBlock) {
            this.emptyGreenButton.textBlock.text = text;
        }
    }

    public show(
        fullText: string,
        heading = "Welcome!",
        sizeCoef: number = 0.87,
        shaderMode: ShaderMode = ShaderMode.NONE,
        verticalAlignment: number = Control.VERTICAL_ALIGNMENT_CENTER,
        action: () => void = () => {},
        closeAction: (() => void) | null = null,
        backAction: (() => void) | null = null,
        afterShowAction: (() => void) | null = null,
        mode: PopupMode = PopupMode.Normal,
        formInputModel: FormInputModel[] | null = null
    ): void {

        if (mode === PopupMode.Normal && localStorage.getItem("tutorialDone") === "true") {
            return;
        }

        this.clearForm();

        if (this.mainContainer.isVisible) {
            this.fadeOut(() => {
                this.showWrapper(fullText, heading, sizeCoef, shaderMode, verticalAlignment, action, closeAction, backAction, afterShowAction, mode, formInputModel);
            });
        } else {
            this.showWrapper(fullText, heading, sizeCoef, shaderMode, verticalAlignment, action, closeAction, backAction, afterShowAction, mode, formInputModel);
        }
    }

    private showWrapper(fullText: string, heading = "Welcome!", sizeCoef: number = 0.87, shaderMode: ShaderMode = ShaderMode.NONE,
            verticalAlignment: number = Control.VERTICAL_ALIGNMENT_CENTER,
            action: () => void = () => {},
            closeAction: (() => void) | null = null,
            backAction: (() => void) | null = null,
            afterShowAction: (() => void) | null = null,
            mode: PopupMode = PopupMode.Normal,
            formInputModel: FormInputModel[] | null = null) : void {

        if (this.internalShow(fullText, heading, sizeCoef, shaderMode, verticalAlignment, action, closeAction, backAction, mode, formInputModel) && afterShowAction) {
            afterShowAction();
        }
    }

    private internalShow(fullText: string, heading = "Welcome!", sizeCoef: number = 0.87, shaderMode: ShaderMode = ShaderMode.NONE,
            verticalAlignment: number = Control.VERTICAL_ALIGNMENT_CENTER,
            action: () => void = () => {},
            closeAction: (() => void) | null = null,
            backAction: (() => void) | null = null,
            mode: PopupMode = PopupMode.Normal,
            formInputModel: FormInputModel[] | null = null) : boolean {

        this.gotItButton.isVisible = false;
        this.emptyGreenButton.isVisible = false;
        this.getItButton.isVisible = false;
        this.notNowButton.isVisible = false;
        this.nextButton.isVisible = false;
        this.centerImage.isVisible = false;
        this.coverImage.isVisible = false;
        this.textAreaRect.alpha = 1;

        switch (mode) {
            case PopupMode.PreSell:
                this.emptyGreenButton.isVisible = true;
                this.centerImage.isVisible = true;
                this.coverImage.source = puzzleCircleBuilder.selectedCoverUrl;
                break;
            case PopupMode.Sell:
                this.getItButton.isVisible = true;
                this.notNowButton.isVisible = true;
                this.coverImage.isVisible = true;
                this.textAreaRect.alpha = 0.8;
                break;
            case PopupMode.Normal:
                this.gotItButton.isVisible = true;
                this.centerImage.isVisible = true;
                break;
            case PopupMode.Gift_Initial:
                this.nextButton.isVisible = true;
                this.centerImage.isVisible = true;
                break;
            case PopupMode.Gift_Adjustments_Hint:
                this.gotItButton.isVisible = true;
                break;
            case PopupMode.Gift_Adjustments_Preview:
                this.nextButton.isVisible = true;
                this.coverImage.isVisible = true;
                this.textAreaRect.alpha = 0;
                break;
        }

        this.welcomeText.text = heading;
        this.inputTextArea.text = "";
        this._sizeCoef = sizeCoef;
        this._action = action;
        this._popupMode = mode;

        if (closeAction) {
            this._closeAction = closeAction;
            this.xButton.isVisible = true;
        } else {
            this.xButton.isVisible = false;
        }

        if (backAction) {
            this._backAction = backAction;
            this.backButton.isVisible = true;
        } else {
            this.backButton.isVisible = false;
        }

        if (formInputModel) {
            for (let m of formInputModel) {
                this.createLabeledInput(m);
            }

            this.formPanel.isVisible = true;
        } else {
            this.formPanel.isVisible = false;
        }
        
        this.resize();
        this.mainContainer.zIndex = shaderMode === ShaderMode.SHADOW_WINDOW ? 20 : 50;
        this.mainContainer.verticalAlignment = verticalAlignment;
        screenShader.setShaderMode(shaderMode);
        this.typeTextLetterByLetter(fullText);
        this.mainContainer.isVisible = true;

        this.fadeIn();

        return true;
    }

    public hide(onComplete?: () => void) {
        if (!this.mainContainer.isVisible) {
            return;
        }

        this.fadeOut(() => {
            onComplete?.();
        });
    }

    private stopCurrentAnim() {
        if (this._currentAnimation) {
            this._currentAnimation.stop();
            this._currentAnimation = null;
        }
    }

    private fadeIn() {
        this.stopCurrentAnim();

        const anim = new Animation(
            "fade in",
            "alpha",
            30,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keys = [
            { frame: 0, value: 0 },
            { frame: this._fadeDuration, value: 1 }
        ];
        anim.setKeys(keys);
        this.mainContainer.animations = [anim];

        ctx.scene.beginAnimation(this.mainContainer, 0, this._fadeDuration, false, 1);
    }

    private fadeOut(onComplete: () => void) {
        this.stopCurrentAnim();

        const anim = new Animation(
            "fade out",
            "alpha",
            30,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keys = [
            { frame: 0, value: 1 },
            { frame: this._fadeDuration, value: 0 }
        ];
        anim.setKeys(keys);
        this.mainContainer.animations = [anim];

        ctx.scene.beginAnimation(this.mainContainer, 0, this._fadeDuration, false, 1, () => {
            this.mainContainer.isVisible = false;
            this.mainContainer.alpha = 1;
            handImagePool.releaseAll();
            onComplete();
            screenShader.exitShader();
        });
    }

    private typingSessionId = 0;
    
    public typeTextLetterByLetter(fullText: string, delay = 0, wrapLimit = 55) {
        const target = this.inputTextArea;
        let index = 0;
    
        // Invalidate any previous typing session
        const currentSessionId = ++this.typingSessionId;
    
        const smartWrap = (text: string): string => {
            const lines = text.split("\n");
            const wrappedLines: string[] = [];
    
            for (const line of lines) {
                if (line.trim() === "") {
                    wrappedLines.push(""); // preserve empty line
                    continue;
                }
    
                let i = 0;
                while (i < line.length) {
                    let nextBreak = i + wrapLimit;
    
                    if (nextBreak >= line.length) {
                        wrappedLines.push(line.substring(i));
                        break;
                    }
    
                    let spaceIndex = line.lastIndexOf(" ", nextBreak);
                    if (spaceIndex <= i) spaceIndex = nextBreak;
    
                    wrappedLines.push(line.substring(i, spaceIndex));
                    i = spaceIndex + 1;
                }
            }
    
            return wrappedLines.join("\n");
        };
    
        const addNextChar = () => {
            // Stop if a new session has started
            if (currentSessionId !== this.typingSessionId) return;
    
            if (index <= fullText.length) {
                const currentRaw = fullText.substring(0, index);
                const currentWrapped = smartWrap(currentRaw);
                target.text = currentWrapped;
    
                index++;
                window.setTimeout(addNextChar, delay);
            }
        };
    
        // Start typing
        addNextChar();
    }
}

const popupHint = new PopupHint();
export default popupHint;