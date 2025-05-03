import { Container, Control, Rectangle, StackPanel, TextBlock, Image, InputTextArea, Button } from "@babylonjs/gui";
import puzzleAssetsManager from "../components/behaviors/PuzzleAssetsManager";
import sceneInitializer from "../components/SceneInitializer";
import ctx from "../components/common/SceneContext";
import screenShader, { ShaderMode } from "./ScreenShader";
import guiManager from "./GuiManager";

class PopupHint {
    private inputTextArea!: TextBlock;
    private welcomeText!: TextBlock;
    private topImage!: Image;
    private middleImage!: Image;
    private textAreaRect!: Rectangle;
    private mainRect!: Rectangle;
    private topRect!: Rectangle;
    private centerRect!: Rectangle;
    private bottomRect!: Rectangle;
    private _sizeCoef = 0.87;
    private _action: () => void = () => {};
    private _zIndexElement: Control | null = null;

    init() {
        // Root Container
        /*const root = new Container("root");
        root.width = "100%";
        root.height = "100%";
        root.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        root.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        root.isHitTestVisible = true;
        root.isPointerBlocker = true;
        guiManager.advancedTexture.addControl(root);*/

        // Main Rectangle
        this.mainRect = new Rectangle("Rectangle");
        this.mainRect.color = "#B15E0AFF";
        this.mainRect.thickness = 1;
        this.mainRect.shadowOffsetX = 2;
        this.mainRect.shadowOffsetY = 2;
        this.mainRect.shadowColor = "#B15E0AFF";
        this.mainRect.isVisible = false;
        this.mainRect.isHitTestVisible = true;
        this.mainRect.isPointerBlocker = true;
        guiManager.advancedTexture.addControl(this.mainRect);

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

        const gotItButton = Button.CreateImageOnlyButton("btn1", "assets/got-it-button-small.webp");
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

        sceneInitializer.addResizeObserver((width, height) => {
            this.resize();
        });
    }

    private resize() {
        const minSize = Math.min(ctx.engine.getRenderWidth(), ctx.engine.getRenderHeight());
        const mainHeight = minSize * this._sizeCoef;
        this.mainRect.width = minSize * 0.87 + "px";
        this.mainRect.height = mainHeight + "px";
        this.mainRect.cornerRadius = minSize / 16;
        this.topRect.height = minSize * 0.2 + "px";
        this.centerRect.height = mainHeight - (minSize * 0.3) + "px";
        this.bottomRect.height = minSize * 0.1 + "px";
        this.welcomeText.width = minSize * 0.62 + "px";
        this.welcomeText.fontSize = minSize / 12 + "px";

        const imageWidth = minSize * 0.2;
        const imageHeight = minSize * 0.185;
        this.topImage.width = imageWidth + "px";
        this.topImage.height = imageHeight + "px";
        this.middleImage.width = imageWidth * 0.45 + "px";
        this.middleImage.height = imageHeight * 0.45 + "px";

        this.textAreaRect.width = 0.76 * minSize + "px";
        this.textAreaRect.cornerRadius = minSize / 40;

        this.textAreaRect.paddingBottomInPixels = minSize / 160;
        this.inputTextArea.fontSize = minSize / 36 + "px";

        this.inputTextArea.paddingBottomInPixels = minSize / 80;
        this.inputTextArea.paddingLeftInPixels = 3 * minSize / 160;
        this.inputTextArea.paddingRightInPixels = 3 * minSize / 160;
        this.inputTextArea.paddingTopInPixels = minSize / 80;
    }
    
    public show(fullText: string, heading = "Welcome!", sizeCoef: number = 0.87, shaderMode: ShaderMode = ShaderMode.NONE,
            action: () => void = () => {}, zIndexElement: Control | null = null) {
        
        if (this._zIndexElement) {
            this._zIndexElement.zIndex = 0;
        }

        if (localStorage.getItem("tutorialDone") === "true") {
            this.hide();
            return;
        }
        
        this._zIndexElement = zIndexElement;

        if (this._zIndexElement) {
            this._zIndexElement.zIndex = 3000;
        }

        this.welcomeText.text = heading;
        this.inputTextArea.text = "";
        this._sizeCoef = sizeCoef;
        this._action = action;
        this.resize();
        this.mainRect.zIndex = shaderMode === ShaderMode.SHADOW_WINDOW ? 2 : 5;
        screenShader.setShaderMode(shaderMode);
        this.typeTextLetterByLetter(fullText);
        this.mainRect.isVisible = true;
    }

    public hide() {
        this.mainRect.isVisible = false;
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