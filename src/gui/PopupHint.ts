import { Container, Control, Rectangle, StackPanel, TextBlock, Image, InputTextArea, Button } from "@babylonjs/gui";
import puzzleAssetsManager from "../components/behaviors/PuzzleAssetsManager";
import sceneInitializer from "../components/SceneInitializer";
import ctx from "../components/common/SceneContext";
import screenShader, { ShaderMode } from "./ScreenShader";
import guiManager from "./GuiManager";
import handImagePool from "./HandImagePool";

class PopupHint {
    private inputTextArea!: TextBlock;
    private welcomeText!: TextBlock;
    private topImage!: Image;
    private middleImage!: Image;
    private textAreaRect!: Rectangle;
    private mainContainer!: Container;
    private mainRect!: Rectangle;
    private topRect!: Rectangle;
    private centerRect!: Rectangle;
    private bottomRect!: Rectangle;
    private xButton!: Button;
    private _sizeCoef = 0.87;
    private _action: () => void = () => {};
    private _closeAction: () => void = () => {};

    init() {
        this.mainContainer = new Container("PopupHintContainer");
        this.mainContainer.isVisible = false;
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
        const mainStack = new StackPanel("StackPanel");
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

        const topStack = new StackPanel("StackPanel");
        topStack.height = "100%";
        topStack.isVertical = false;
        this.topRect.addControl(topStack);

        this.topImage = new Image("Image", "assets/mascot-avatar-small.webp");
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
        this.centerRect.background = "#FAF0E5FF";
        this.centerRect.color = "#AAAAAA";
        mainStack.addControl(this.centerRect);

        const centerImage = new Image("Image", "assets/popup-bg.webp");
        centerImage.width = "100%";
        centerImage.height = "100%";
        this.centerRect.addControl(centerImage);

        puzzleAssetsManager.addGuiImageSource(centerImage, "assets/popup-bg.webp");

        // Middle Rectangle (with InputTextArea)
        const middleStack = new StackPanel("StackPanel");
        middleStack.height = "100%";
        middleStack.isVertical = false;
        this.centerRect.addControl(middleStack);

        this.middleImage = new Image("Image", "assets/mascot-avatar-small.webp");
        this.middleImage.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.middleImage.paddingBottom = "5px";
        this.middleImage.paddingLeft = "5px";
        this.middleImage.paddingRight = "5px";
        middleStack.addControl(this.middleImage);

        puzzleAssetsManager.addGuiImageSourceForMultiple([ this.topImage, this.middleImage ], "assets/mascot-avatar.webp");

        this.textAreaRect = new Rectangle("Rectangle");
        this.textAreaRect.height = "auto";
        this.textAreaRect.background = "#F9F6F1FF";
        //this.textAreaRect.alpha = 0.5;
        this.textAreaRect.color = "#000000";
        this.textAreaRect.thickness = 0;
        this.textAreaRect.adaptHeightToChildren = true;
        this.textAreaRect.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        middleStack.addControl(this.textAreaRect);

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

        // Bottom Rectangle (with Buttons)
        this.bottomRect = new Rectangle("Rectangle");
        this.bottomRect.width = "100%";
        this.bottomRect.background = "#FFE6B5FF";
        this.bottomRect.color = "#AAAAAA";
        mainStack.addControl(this.bottomRect);

        const gotItButton = Button.CreateImageOnlyButton("gotItButton", "assets/got-it-button-small.webp");
        gotItButton.thickness = 0;
        gotItButton.background = "";
        gotItButton.hoverCursor = "pointer";
        gotItButton.width = "40%";
        gotItButton.height = "90%";
        gotItButton.isHitTestVisible = true;
        gotItButton.isPointerBlocker = true;

        gotItButton.onPointerClickObservable.add(() => {
            if (this._action) {
                this._action();
            }
        });

        this.bottomRect.addControl(gotItButton);

        puzzleAssetsManager.addGuiImageButtonSource(gotItButton, "assets/got-it-button.webp");

        this.xButton = Button.CreateImageOnlyButton("xButton", "assets/x-button-trans.webp");
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

    private resize() {
        const minSize = Math.min(ctx.engine.getRenderWidth(), ctx.engine.getRenderHeight());
        const mainHeight = minSize * this._sizeCoef;
        this.mainContainer.widthInPixels = minSize * 0.87;
        this.mainContainer.heightInPixels = mainHeight;
        this.mainRect.cornerRadius = minSize / 16;
        this.mainContainer.paddingTopInPixels = minSize / 80;
        this.mainContainer.paddingBottomInPixels = minSize / 80;
        this.topRect.heightInPixels = minSize * 0.2;
        this.centerRect.heightInPixels = mainHeight - (minSize * (0.3 + 1 / 40));
        this.bottomRect.heightInPixels = minSize * 0.1;
        this.welcomeText.widthInPixels = minSize * 0.62;
        this.welcomeText.fontSizeInPixels = minSize / 12;

        const imageWidth = minSize * 0.2;
        const imageHeight = minSize * 0.185;
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
    }
    
    public show(fullText: string, heading = "Welcome!", sizeCoef: number = 0.87, shaderMode: ShaderMode = ShaderMode.NONE,
            verticalAlignment: number = Control.VERTICAL_ALIGNMENT_CENTER,
            action: () => void = () => {},
            closeAction: (() => void) | null = null) : boolean {

        this.hide();

        if (localStorage.getItem("tutorialDone") === "true") {
            return false;
        }

        this.welcomeText.text = heading;
        this.inputTextArea.text = "";
        this._sizeCoef = sizeCoef;
        this._action = action;

        if (closeAction) {
            this._closeAction = closeAction;
            this.xButton.isVisible = true;
        } else {
            this.xButton.isVisible = false;
        }
        
        this.resize();
        this.mainContainer.zIndex = shaderMode === ShaderMode.SHADOW_WINDOW ? 20 : 50;
        this.mainContainer.verticalAlignment = verticalAlignment;
        screenShader.setShaderMode(shaderMode);
        this.typeTextLetterByLetter(fullText);
        this.mainContainer.isVisible = true;

        return true;
    }

    public hide() {
        this.mainContainer.isVisible = false;
        handImagePool.releaseAll();
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