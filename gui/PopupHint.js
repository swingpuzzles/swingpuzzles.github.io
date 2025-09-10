var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Container, Control, Rectangle, StackPanel, TextBlock, Image, Button, InputText } from "@babylonjs/gui";
import { Animation } from "@babylonjs/core";
import puzzleAssetsManager from "../core3d/behaviors/PuzzleAssetsManager";
import sceneInitializer from "../core3d/SceneInitializer";
import ctx from "../core3d/common/SceneContext";
import ScreenShader, { ShaderMode } from "./ScreenShader";
import guiManager from "./GuiManager";
import handImagePool from "./HandImagePool";
import puzzleCircleBuilder from "../core3d/builders/PuzzleCircleBuilder";
import Constants from "../core3d/common/Constants";
import localStorageManager from "../common/LocalStorageManager";
import puzzleEditor from "../core3d/misc/PuzzleEditor";
import openCoverAnimation from "../core3d/animations/OpenCoverAnimation";
import timerManager from "../core3d/misc/TimerManager";
export var PopupMode;
(function (PopupMode) {
    PopupMode[PopupMode["Normal"] = 0] = "Normal";
    PopupMode[PopupMode["PreSell"] = 1] = "PreSell";
    PopupMode[PopupMode["Sell"] = 2] = "Sell";
    PopupMode[PopupMode["Gift_Initial"] = 3] = "Gift_Initial";
    //Gift_Adjustments_Hint,
    PopupMode[PopupMode["Gift_Adjustments_Preview"] = 4] = "Gift_Adjustments_Preview";
    PopupMode[PopupMode["Gift_Adjustments_Overview"] = 5] = "Gift_Adjustments_Overview";
    PopupMode[PopupMode["Gift_Physical_Initial"] = 6] = "Gift_Physical_Initial";
    PopupMode[PopupMode["Gift_Physical_Final"] = 7] = "Gift_Physical_Final";
    PopupMode[PopupMode["GamePaused"] = 8] = "GamePaused";
})(PopupMode || (PopupMode = {}));
class PopupHint {
    constructor(overPopup = false) {
        this._fadeDuration = 10;
        this._sizeCoef = 0.87;
        this._action = () => { };
        this._closeAction = () => { };
        this._backAction = () => { };
        this._currentAnimation = null;
        this._imgVertical = false;
        this._radioButtons = [];
        this._overPopup = false;
        this._shaderMode = ShaderMode.NONE;
        this._inFront = true;
        this.typingSessionId = 0;
        this._overPopup = overPopup;
        this._screenShader = new ScreenShader();
    }
    init() {
        this._screenShader.init();
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
        puzzleAssetsManager.addGuiImageSourceForMultiple([this.topImage, this.middleImage], "assets/popup/mascot-avatar.webp");
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
        this.formPanelRect = new Rectangle("Rectangle");
        this.formPanelRect.thickness = 0;
        this.formPanelRect.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        middleStack.addControl(this.formPanelRect);
        this.formPanel = new StackPanel("formPanel");
        this.formPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.formPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.formPanel.color = "#dddddd";
        this.formPanelRect.addControl(this.formPanel);
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
        this.emptyGreenButton.textBlock.color = "#F8EDB8FF";
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
        this.backButton = Button.CreateImageWithCenterTextButton("backButton", "BACK", "assets/buttons/back-button-small.webp");
        this.backButton.thickness = 0;
        this.backButton.background = "";
        this.backButton.hoverCursor = "pointer";
        this.backButton.paddingLeft = "5%";
        this.backButton.width = "45%";
        this.backButton.height = "90%";
        this.backButton.isHitTestVisible = true;
        this.backButton.isPointerBlocker = true;
        this.backButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.backButton.textBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.backButton.textBlock.paddingRight = "15%"; // push text right
        this.backButton.textBlock.color = "#344612";
        this.backButton.textBlock.fontWeight = "bold";
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
    get formData() {
        const formData = [];
        for (const container of this.formPanel.children) {
            for (const child of container.children) {
                if (child instanceof InputText) {
                    formData.push({ id: child.name, value: child.text });
                }
                else if (child.name === Constants.ISELECTOR) {
                    const selector = child;
                    formData.push({ id: selector.id, value: selector.selectedId });
                }
            }
        }
        return formData;
    }
    set centerImgUrl(url) {
        this.coverImage.source = url;
    }
    get vertical() {
        return this._imgVertical;
    }
    set vertical(value) {
        if (value !== this._imgVertical) {
            this._imgVertical = value;
            this.resize();
            puzzleEditor.resize();
        }
    }
    isManualOrientation() {
        return this._popupMode === PopupMode.Gift_Physical_Initial || this._popupMode === PopupMode.Gift_Physical_Final;
    }
    clearForm() {
        this.clearRecursive(this.formPanel);
        this._radioButtons = [];
    }
    clearRecursive(control) {
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
    createLabeledInput(formRowModel) {
        var _a, _b, _c, _d;
        const labelText = formRowModel.label;
        const placeholder = formRowModel.placeHolder;
        const container = new StackPanel();
        const label = new TextBlock();
        label.text = labelText;
        label.color = "#222";
        label.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        container.addControl(label);
        const savedValue = localStorageManager.getString(formRowModel.id);
        switch (formRowModel.type) {
            case "selection":
                container.addControl(formRowModel.selector.ui);
                break;
            case "button":
                const button = Button.CreateSimpleButton(formRowModel.id, formRowModel.buttonText);
                button.width = "50%";
                button.background = formRowModel.background; // 👈 a standout green (or choose your brand color)
                button.color = (_a = formRowModel.color) !== null && _a !== void 0 ? _a : "#ffffff"; // 👈 white text for contrast
                button.fontWeight = "bold";
                button.cornerRadius = 12;
                button.thickness = 2;
                button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
                button.onPointerClickObservable.add(() => {
                    formRowModel.action();
                });
                container.addControl(button);
                break;
            case "radioButton":
                const radioButton = Button.CreateSimpleButton(formRowModel.id, formRowModel.buttonText);
                radioButton.width = "50%";
                radioButton.background = formRowModel.background; // 👈 a standout green (or choose your brand color)
                radioButton.fontWeight = "bold";
                radioButton.cornerRadius = 12;
                radioButton.thickness = 0;
                radioButton.color = "#888888";
                radioButton.textBlock.color = "#ffffff";
                radioButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
                const selectedThickness = Math.min(ctx.engine.getRenderWidth(), ctx.engine.getRenderHeight()) / 100;
                const padding = formRowModel.selected ? 0 : selectedThickness;
                if (formRowModel.selected) {
                    radioButton.thickness = selectedThickness;
                    radioButton.color = "#FFD700"; // Golden border for selected
                }
                else {
                    radioButton.paddingBottomInPixels = padding;
                    radioButton.paddingTopInPixels = padding;
                    radioButton.paddingLeftInPixels = padding;
                    radioButton.paddingRightInPixels = padding;
                }
                radioButton.onPointerClickObservable.add(() => {
                    const selectedThickness = Math.min(ctx.engine.getRenderWidth(), ctx.engine.getRenderHeight()) / 100;
                    for (let rb of this._radioButtons) {
                        rb.color = "#88888800";
                        rb.thickness = 0;
                        rb.paddingBottomInPixels = selectedThickness;
                        rb.paddingTopInPixels = selectedThickness;
                        rb.paddingLeftInPixels = selectedThickness;
                        rb.paddingRightInPixels = selectedThickness;
                    }
                    radioButton.thickness = selectedThickness;
                    radioButton.color = "#FFD700"; // Golden border for selected
                    radioButton.paddingBottomInPixels = 0;
                    radioButton.paddingTopInPixels = 0;
                    radioButton.paddingLeftInPixels = 0;
                    radioButton.paddingRightInPixels = 0;
                    formRowModel.action();
                });
                this._radioButtons.push(radioButton);
                container.addControl(radioButton);
                break;
            default:
                let input = new InputText(formRowModel.id);
                input.color = "#222";
                input.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
                input.background = "#f0f0f0";
                input.focusedBackground = "#e6e6e6"; // Slightly darker when focused
                input.thickness = 1;
                if (placeholder) {
                    input.placeholderText = placeholder;
                }
                if (savedValue) {
                    input.text = savedValue;
                }
                let rowControl = input;
                switch (formRowModel.type) {
                    case "text":
                        input.width = formRowModel.maxLength ? (Math.min(100, Math.max(formRowModel.maxLength, input.placeholderText.length) * 2.5) + "%") : "100%";
                        input.onTextChangedObservable.add(() => {
                            if (formRowModel.maxLength && input.text.length > formRowModel.maxLength) {
                                input.text = input.text.slice(0, formRowModel.maxLength);
                            }
                        });
                        break;
                    case "number":
                        const maxLength = formRowModel.max ? Math.max(formRowModel.max.toString().length, input.placeholderText.length) : null;
                        input.width = maxLength ? (Math.min(100, maxLength * 2.5) + "%") : "100%";
                        input.onTextChangedObservable.add(() => {
                            input.text = input.text.replace(/\D/g, "");
                            const value = parseInt(input.text, 10);
                            if (isNaN(value)) {
                                input.text = "";
                            }
                            else if (formRowModel.min && value < formRowModel.min) {
                                input.text = "" + formRowModel.min;
                            }
                            else if (formRowModel.max && value > formRowModel.max) {
                                input.text = "" + formRowModel.max;
                            }
                        });
                        break;
                    case "share":
                        input.height = "100%";
                        const giftLink = formRowModel.link;
                        input.text = giftLink;
                        input.onFocusObservable.add(() => {
                            input.selectAllText();
                            input.isReadOnly = true;
                            copyToClipboard();
                        });
                        input.onBlurObservable.add(() => {
                            input.isReadOnly = false;
                        });
                        const horizPanel = new StackPanel();
                        horizPanel.width = "100%";
                        horizPanel.isVertical = false;
                        horizPanel.addControl(input);
                        const copyButton = Button.CreateSimpleButton("copyLinkButton", "🔗 Copy Link");
                        copyButton.width = "200px";
                        copyButton.background = "#6c757d"; // 👈 a standout green (or choose your brand color)
                        copyButton.color = "#ffffff"; // 👈 white text for contrast
                        copyButton.fontWeight = "bold";
                        copyButton.cornerRadius = 12;
                        copyButton.thickness = 2;
                        copyButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
                        copyButton.onPointerClickObservable.add(() => {
                            copyToClipboard();
                        });
                        horizPanel.addControl(copyButton);
                        const shareButton = Button.CreateSimpleButton("shareLinkButton", "📤 Share Link");
                        shareButton.height = "100%";
                        shareButton.background = "#007BFF"; // 👈 a standout green (or choose your brand color)
                        shareButton.color = "#ffffff"; // 👈 white text for contrast
                        shareButton.fontWeight = "bold";
                        shareButton.cornerRadius = 12;
                        shareButton.thickness = 2;
                        shareButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
                        shareButton.onPointerClickObservable.add(() => __awaiter(this, void 0, void 0, function* () {
                            if (navigator.share) {
                                try {
                                    yield navigator.share({
                                        title: "🎁 Puzzle Gift",
                                        text: "Here’s a puzzle I made for you!",
                                        url: formRowModel.link
                                    });
                                }
                                catch (err) {
                                    console.error("Sharing failed:", err);
                                }
                            }
                            else {
                                alert("Sharing is not supported on this device.");
                            }
                        }));
                        horizPanel.addControl(shareButton);
                        function copyToClipboard() {
                            navigator.clipboard.writeText(giftLink).then(() => {
                                var _a;
                                const original = ((_a = copyButton.textBlock) === null || _a === void 0 ? void 0 : _a.text) || "🔗 Copy Link";
                                copyButton.textBlock.text = "✅ Copied!";
                                setTimeout(() => {
                                    copyButton.textBlock.text = original;
                                }, 2000);
                            }).catch(err => {
                                console.error("Copy failed:", err);
                                alert("Failed to copy to clipboard.");
                            });
                        }
                        rowControl = horizPanel;
                        break;
                    case "emailCapture": {
                        const m = formRowModel; // as EmailCaptureActionModel;
                        // container: one horizontal row
                        const row = new StackPanel();
                        row.width = "100%";
                        row.isVertical = false;
                        row.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
                        // input
                        const input = new InputText(`${m.id}_email`);
                        input.width = "65%";
                        input.color = "#222";
                        input.background = "#f0f0f0";
                        input.focusedBackground = "#e6e6e6";
                        input.thickness = 1;
                        input.placeholderText = (_b = m.placeHolder) !== null && _b !== void 0 ? _b : "you@example.com";
                        /*input.onTextChangedObservable.add(() => {
                            const cap = m.maxLength ?? 254;
                            if (input.text.length > cap) input.text = input.text.slice(0, cap);
                        });*/
                        // button
                        const mode = m.isUpdate ? "update" : "subscribe";
                        const btnText = mode === "update"
                            ? ((_c = m.buttonTextUpdate) !== null && _c !== void 0 ? _c : "✏️ Add another")
                            : ((_d = m.buttonTextSubscribe) !== null && _d !== void 0 ? _d : "📧 Add email");
                        const submit = Button.CreateSimpleButton(`${m.id}_submit`, btnText);
                        submit.width = "35%";
                        submit.background = "#2980b9";
                        submit.color = "#ffffff";
                        submit.fontWeight = "bold";
                        submit.cornerRadius = 12;
                        submit.thickness = 2;
                        submit.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
                        input.onPointerClickObservable.add(() => {
                            m.action();
                        });
                        submit.onPointerClickObservable.add(() => {
                            m.action();
                        });
                        /*const pattern = m.validatePattern ?? /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    
                        const doSubmit = async () => {
                            const value = (input.text || "").trim();
                            if (!pattern.test(value)) {
                                alert("Please enter a valid email.");
                                return;
                            }
                            submit.isEnabled = false;
                            try {
                                await m.onSubmit(value, mode);
                                // minimal success feedback without echoing the email
                                const original = submit.textBlock?.text ?? btnText;
                                if (submit.textBlock) submit.textBlock.text = "✅ Sent";
                                setTimeout(() => {
                                    if (submit.textBlock) submit.textBlock.text = original;
                                }, 1600);
                            } catch (e) {
                                console.error(e);
                                alert("Subscription failed. Please try again.");
                            } finally {
                                submit.isEnabled = true;
                            }
                        };
                    
                        submit.onPointerClickObservable.add(doSubmit);
                    
                        // Optional: Enter key quick submit (works in browsers that forward Enter to InputText)
                        input.onBeforeKeyAddObservable.add((key) => {
                            // @ts-ignore: key may be string; guard simple Enter
                            if (key === "\n" || key === "\r") doSubmit();
                        });*/
                        // layout: label above, then [input][button]
                        row.addControl(input);
                        row.addControl(submit);
                        container.addControl(row);
                        break;
                    }
                }
                container.addControl(rowControl);
        }
        this.formPanel.addControl(container);
    }
    resize() {
        const giftPreviewOverview = this._popupMode === PopupMode.Gift_Adjustments_Preview ||
            this._popupMode === PopupMode.Gift_Adjustments_Overview ||
            this._popupMode === PopupMode.Gift_Physical_Initial ||
            this._popupMode === PopupMode.Gift_Physical_Final;
        const vertical = ctx.engine.getRenderHeight() > ctx.engine.getRenderWidth();
        if (this._popupMode !== PopupMode.Gift_Physical_Initial && this._popupMode !== PopupMode.Gift_Physical_Final) {
            this._imgVertical = vertical;
        }
        const minSize = Math.min(ctx.engine.getRenderWidth(), ctx.engine.getRenderHeight());
        const rawMainHeight = minSize * this._sizeCoef;
        const mainHeight = giftPreviewOverview && vertical
            ? Math.min(rawMainHeight * 1.673, 0.88 * ctx.engine.getRenderHeight())
            : rawMainHeight;
        const topHeightOrigCoef = 0.2;
        const topHeightCoef = giftPreviewOverview ? 0.1 : topHeightOrigCoef;
        const topHeightOrig = minSize * topHeightOrigCoef;
        const topHeight = minSize * topHeightCoef;
        const middleHeight = mainHeight - (minSize * (0.1 + 1 / 40)) - topHeight;
        const rawMiddleHeight = rawMainHeight - (minSize * (0.1 + 1 / 40)) - topHeight;
        const containerwidth = giftPreviewOverview && !vertical ? mainHeight * 1.1 : (minSize * 0.87);
        this.mainContainer.widthInPixels = containerwidth;
        this.mainContainer.heightInPixels = mainHeight;
        this.mainRect.cornerRadius = minSize / 16;
        this.mainContainer.paddingTopInPixels = minSize / 80;
        this.mainContainer.paddingBottomInPixels = minSize / 80;
        this.topRect.heightInPixels = topHeight;
        this.centerRect.heightInPixels = middleHeight;
        this.bottomRect.heightInPixels = minSize * 0.1;
        this.welcomeText.widthInPixels = topHeightOrig * 3.1; //0.62;
        this.welcomeText.fontSizeInPixels = topHeight / 2.8 / Math.max(1, this.welcomeText.text.length / 15); //14;
        const imageWidth = topHeight;
        const imageHeight = topHeight * 0.925; //0.185;
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
        this.emptyGreenButton.textBlock.fontSizeInPixels = minSize / 24;
        this.backButton.textBlock.fontSizeInPixels = minSize / 20;
        if (this.formPanelRect.isVisible) {
            const middleTopPanelRatio = 0.99 - 0.16 * this.formPanel.children.length;
            const formPanelRatio = 1 - middleTopPanelRatio;
            const baseFormPanelheight = formPanelRatio * rawMiddleHeight;
            const overviewMode = this._popupMode === PopupMode.Gift_Adjustments_Overview ||
                this._popupMode === PopupMode.Gift_Physical_Initial ||
                this._popupMode === PopupMode.Gift_Physical_Final;
            const formPanelheight = overviewMode ? 0.92 * baseFormPanelheight : baseFormPanelheight;
            const formPanelheightCoef = overviewMode ? 0.96 * formPanelheight : formPanelheight;
            this.middleTopStack.heightInPixels = middleTopPanelRatio * rawMiddleHeight;
            this.formPanelRect.heightInPixels = formPanelheight;
            this.formPanelRect.cornerRadius = minSize / 40;
            this.formPanelRect.paddingLeftInPixels = minSize / 75;
            this.formPanelRect.paddingTopInPixels = formPanelheightCoef / 75;
            this.formPanelRect.paddingBottomInPixels = formPanelheightCoef / 75;
            this.formPanel.paddingLeftInPixels = minSize / 80;
            this.formPanel.paddingRightInPixels = minSize / 80;
            this.formPanel.paddingTopInPixels = formPanelheightCoef / 80;
            this.formPanel.paddingBottomInPixels = formPanelheightCoef / 80;
            const containerHeight = 39 / 40 * formPanelheightCoef / this.formPanel.children.length;
            for (const container of this.formPanel.children) {
                container.heightInPixels = containerHeight;
                const formFontSize = 0.26 * containerHeight;
                for (const child of container.children) {
                    child.fontSize = formFontSize;
                    if (child instanceof TextBlock) {
                        child.heightInPixels = 0.43 * containerHeight;
                    }
                    else if (child.name === Constants.ISELECTOR) {
                        child.resize(0.57 * containerHeight);
                    }
                    else {
                        child.heightInPixels = 0.57 * containerHeight;
                        if (child instanceof StackPanel) {
                            for (let sChild of child.children) {
                                if (sChild instanceof InputText) {
                                    sChild.widthInPixels = containerwidth * 0.4;
                                }
                                else if (sChild instanceof Button) {
                                    sChild.widthInPixels = containerwidth * 0.25;
                                    sChild.paddingLeftInPixels = containerwidth * 0.01;
                                    sChild.fontSize = formFontSize;
                                }
                            }
                        }
                    }
                }
            }
        }
        else {
            this.middleTopStack.heightInPixels = middleHeight;
            this.formPanelRect.heightInPixels = 0;
        }
    }
    updateConfirmButtonText(text) {
        if (this.emptyGreenButton && this.emptyGreenButton.textBlock) {
            this.emptyGreenButton.textBlock.text = text;
        }
    }
    show(fullText, heading, sizeCoef = 0.87, shaderMode = ShaderMode.NONE, verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER, action = () => { }, closeAction = null, backAction = null, afterShowAction = null, mode = PopupMode.Normal, formInputModel = null) {
        timerManager.clearAll();
        this.clearForm();
        if (this.mainContainer.isVisible) {
            this.fadeOut(() => {
                this.showWrapper(fullText, heading, sizeCoef, shaderMode, verticalAlignment, action, closeAction, backAction, afterShowAction, mode, formInputModel);
            }, false);
        }
        else {
            this.showWrapper(fullText, heading, sizeCoef, shaderMode, verticalAlignment, action, closeAction, backAction, afterShowAction, mode, formInputModel);
        }
    }
    showWrapper(fullText, heading, sizeCoef = 0.87, shaderMode = ShaderMode.NONE, verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER, action = () => { }, closeAction = null, backAction = null, afterShowAction = null, mode = PopupMode.Normal, formInputModel = null) {
        if (this.internalShow(fullText, heading, sizeCoef, shaderMode, verticalAlignment, action, closeAction, backAction, mode, formInputModel) && afterShowAction) {
            afterShowAction();
        }
    }
    internalShow(fullText, heading, sizeCoef = 0.87, shaderMode = ShaderMode.NONE, verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER, action = () => { }, closeAction = null, backAction = null, mode = PopupMode.Normal, formInputModel = null) {
        this.gotItButton.isVisible = false;
        this.emptyGreenButton.isVisible = false;
        this.getItButton.isVisible = false;
        this.notNowButton.isVisible = false;
        this.nextButton.isVisible = false;
        this.centerImage.isVisible = false;
        this.coverImage.isVisible = false;
        this.textAreaRect.alpha = 1;
        this.formPanelRect.alpha = 1;
        this.formPanelRect.background = "#FFFFFF00";
        this.formPanelRect.width = "100%";
        this._shaderMode = shaderMode;
        this.backButton.textBlock.text = "BACK";
        switch (mode) {
            case PopupMode.PreSell:
                this.emptyGreenButton.isVisible = true;
                this.centerImage.isVisible = true;
                this.coverImage.source = openCoverAnimation.giftCover ? puzzleEditor.dataUrl : puzzleCircleBuilder.getCoverUrl(ctx.currentCover);
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
            /*case PopupMode.Gift_Adjustments_Hint:
                this.gotItButton.isVisible = true;
                break;*/
            case PopupMode.Gift_Adjustments_Preview:
                this.nextButton.isVisible = true;
                this.coverImage.isVisible = true;
                this.textAreaRect.alpha = 0;
                break;
            case PopupMode.Gift_Adjustments_Overview:
                this.coverImage.isVisible = true;
                this.textAreaRect.alpha = 0.8;
                this.formPanelRect.alpha = 0.8;
                this.formPanelRect.background = "#F9F6F1FF";
                this.formPanelRect.width = "97%";
                break;
            case PopupMode.Gift_Physical_Initial:
                this.nextButton.isVisible = true;
                this.coverImage.isVisible = true;
                this.textAreaRect.alpha = 0.8;
                this.formPanelRect.alpha = 0.8;
                this.formPanelRect.background = "#F9F6F1FF";
                this.formPanelRect.width = "97%";
                break;
            case PopupMode.Gift_Physical_Final:
                this.getItButton.isVisible = true;
                this.coverImage.isVisible = true;
                this.textAreaRect.alpha = 0.8;
                this.formPanelRect.alpha = 0.8;
                this.formPanelRect.background = "#F9F6F1FF";
                this.formPanelRect.width = "97%";
                break;
            case PopupMode.GamePaused:
                this.centerImage.isVisible = true;
                this.nextButton.isVisible = true;
                this.formPanelRect.alpha = 0.8;
                this.formPanelRect.background = "#F9F6F1FF";
                this.formPanelRect.width = "97%";
                this.backButton.textBlock.text = "PREV";
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
        }
        else {
            this.xButton.isVisible = false;
        }
        if (backAction) {
            this._backAction = backAction;
            this.backButton.isVisible = true;
        }
        else {
            this.backButton.isVisible = false;
        }
        if (formInputModel) {
            for (let m of formInputModel) {
                this.createLabeledInput(m);
            }
            this.formPanelRect.isVisible = true;
        }
        else {
            this.formPanelRect.isVisible = false;
        }
        this.resize();
        this.adjustZIndex();
        this.mainContainer.verticalAlignment = verticalAlignment;
        this._screenShader.setShaderMode(shaderMode);
        this.typeTextLetterByLetter(fullText);
        this.mainContainer.isVisible = true;
        this.fadeIn();
        return true;
    }
    toBack() {
        this._inFront = false;
        this.adjustZIndex();
    }
    toFront() {
        this._inFront = true;
        this.adjustZIndex();
    }
    adjustZIndex() {
        this.mainContainer.zIndex = !this._inFront ? 19 : (this._shaderMode === ShaderMode.SHADOW_WINDOW || this._shaderMode === ShaderMode.SHADOW_WINDOW_WIDE) ? 20 : 350;
        if (this._overPopup) {
            this.mainContainer.zIndex += 0.1;
        }
    }
    hide(onComplete) {
        timerManager.clearAll();
        if (!this.mainContainer.isVisible) {
            onComplete === null || onComplete === void 0 ? void 0 : onComplete();
            return;
        }
        this.fadeOut(() => {
            onComplete === null || onComplete === void 0 ? void 0 : onComplete();
        });
    }
    stopCurrentAnim() {
        if (this._currentAnimation) {
            this._currentAnimation.stop();
            this._currentAnimation = null;
        }
    }
    fadeIn() {
        this.stopCurrentAnim();
        const anim = new Animation("fade in", "alpha", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
        const keys = [
            { frame: 0, value: 0 },
            { frame: this._fadeDuration, value: 1 }
        ];
        anim.setKeys(keys);
        this.mainContainer.animations = [anim];
        ctx.scene.beginAnimation(this.mainContainer, 0, this._fadeDuration, false, 1);
    }
    fadeOut(onComplete, exitShader = true) {
        this.stopCurrentAnim();
        const anim = new Animation("fade out", "alpha", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
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
            if (exitShader) {
                this._screenShader.exitShader();
            }
        });
    }
    typeTextLetterByLetter(fullText, delay = 0, wrapLimit = 55) {
        const target = this.inputTextArea;
        let index = 0;
        // Invalidate any previous typing session
        const currentSessionId = ++this.typingSessionId;
        const smartWrap = (text) => {
            const lines = text.split("\n");
            const wrappedLines = [];
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
                    if (spaceIndex <= i)
                        spaceIndex = nextBreak;
                    wrappedLines.push(line.substring(i, spaceIndex));
                    i = spaceIndex + 1;
                }
            }
            return wrappedLines.join("\n");
        };
        const addNextChar = () => {
            // Stop if a new session has started
            if (currentSessionId !== this.typingSessionId)
                return;
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
const overPopup = new PopupHint(true);
export { overPopup };
