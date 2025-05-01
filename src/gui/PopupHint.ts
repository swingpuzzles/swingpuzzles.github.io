import { AdvancedDynamicTexture, Container, Control, Rectangle, StackPanel, TextBlock, Image, InputTextArea, Button } from "@babylonjs/gui";
import puzzleAssetsManager from "../components/behaviors/PuzzleAssetsManager";
import sceneInitializer from "../components/SceneInitializer";

class PopupHint {
    private inputTextArea!: TextBlock;
    private textAreaRect!: Rectangle;

    init() {
        // Create full screen UI
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        // Root Container
        const root = new Container("root");
        root.width = "100%";
        root.height = "100%";
        root.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        root.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        advancedTexture.addControl(root);

        // Main Rectangle
        const mainRect = new Rectangle("Rectangle");
        //mainRect.width = "800px";
        //mainRect.height = "800px";
        //mainRect.background = "#FFE2B8FF";
        mainRect.color = "#B15E0AFF";
        //mainRect.cornerRadius = 50;
        mainRect.thickness = 1;
        mainRect.shadowOffsetX = 2;
        mainRect.shadowOffsetY = 2;
        mainRect.shadowColor = "#B15E0AFF";
        root.addControl(mainRect);

        // Vertical StackPanel inside Rectangle
        const mainStack = new StackPanel("StackPanel");
        mainStack.width = "100%";
        mainStack.height = "100%";
        mainStack.isVertical = true;
        mainRect.addControl(mainStack);

        // Top Rectangle (with Welcome text and Image)
        const topRect = new Rectangle("Rectangle");
        topRect.width = "100%";
        //topRect.height = "200px";
        topRect.background = "#FAF0E5FF";
        topRect.color = "#AAAAAA";
        mainStack.addControl(topRect);

        const topStack = new StackPanel("StackPanel");
        topStack.height = "100%";
        topStack.isVertical = false;
        topRect.addControl(topStack);

        const topImage = new Image("Image", "assets/mascot-avatar-small.webp");
        //topImage.width = "185px";
        //topImage.height = "180px";
        topStack.addControl(topImage);

        const welcomeText = new TextBlock("Textblock", "Welcome!");
        //welcomeText.width = "598px";
        welcomeText.height = "100%";
        //welcomeText.fontSize = "100px";
        welcomeText.color = "#000000";
        welcomeText.fontWeight = "bold";
        welcomeText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        welcomeText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        topStack.addControl(welcomeText);

        // Top Rectangle (with Welcome text and Image)
        const centerRect = new Rectangle("Rectangle");
        centerRect.width = "100%";
        centerRect.height = "100%";
        centerRect.background = "#FAF0E5FF";
        centerRect.color = "#AAAAAA";
        mainStack.addControl(centerRect);

        const centerImage = new Image("Image", "assets/popup-bg.webp");
        centerImage.width = "100%";
        centerImage.height = "100%";
        centerRect.addControl(centerImage);

        puzzleAssetsManager.addGuiImageSource(centerImage, "assets/popup-bg.webp");

        // Middle Rectangle (with InputTextArea)
        const middleStack = new StackPanel("StackPanel");
        middleStack.height = "100%";
        middleStack.isVertical = false;
        centerRect.addControl(middleStack);

        const middleImage = new Image("Image", "assets/mascot-avatar-small.webp");
        //middleImage.width = "90px";
        //middleImage.height = "85px";
        middleImage.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        //middleImage.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        middleImage.paddingBottom = "5px";
        middleImage.paddingLeft = "5px";
        middleImage.paddingRight = "5px";
        middleStack.addControl(middleImage);

        puzzleAssetsManager.addGuiImageSourceForMultiple([ topImage, middleImage ], "assets/mascot-avatar.webp");

        this.textAreaRect = new Rectangle("Rectangle");
        //this.textAreaRect.width = "695px";
        this.textAreaRect.height = "auto";
        this.textAreaRect.background = "#F9F6F1FF";
        this.textAreaRect.color = "#000000";
        this.textAreaRect.thickness = 0;
        //this.textAreaRect.cornerRadius = 20;
        this.textAreaRect.adaptHeightToChildren = true;
        this.textAreaRect.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        //this.textAreaRect.paddingBottomInPixels = 5;
        middleStack.addControl(this.textAreaRect);

        this.inputTextArea = new TextBlock("InputText");
        this.inputTextArea.isReadOnly = true;
        this.inputTextArea.text = "";
        this.inputTextArea.width = "95%";
        //this.inputTextArea.height = "680px";
        this.inputTextArea.color = "#000000";
        //this.inputTextArea.fontSize = "26px";
        this.inputTextArea.resizeToFit = true;
        this.inputTextArea.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.inputTextArea.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.inputTextArea.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        /*this.inputTextArea.paddingBottomInPixels = 10;
        this.inputTextArea.paddingLeftInPixels = 15;
        this.inputTextArea.paddingRightInPixels = 15;
        this.inputTextArea.paddingTopInPixels = 10;*/
        this.textAreaRect.addControl(this.inputTextArea);

        // Bottom Rectangle (with Buttons)
        const bottomRect = new Rectangle("Rectangle");
        bottomRect.width = "100%";
        bottomRect.height = "100px";
        bottomRect.background = "#FFE6B5FF";
        bottomRect.color = "#AAAAAA";
        mainStack.addControl(bottomRect);

        const bottomStack = new StackPanel("StackPanel");
        bottomStack.height = "100px";
        bottomStack.isVertical = false;
        bottomRect.addControl(bottomStack);

        const skipButton = Button.CreateSimpleButton("Button", "SKIP");
        skipButton.width = "380px";
        skipButton.height = "60px";
        skipButton.background = "#333333";
        skipButton.color = "#ffffff";
        skipButton.fontSize = "18px";
        skipButton.paddingLeft = "20px";
        bottomStack.addControl(skipButton);

        const nextButton = Button.CreateSimpleButton("Button", "NEXT");
        nextButton.width = "400px";
        nextButton.height = "60px";
        nextButton.background = "#333333";
        nextButton.color = "#ffffff";
        nextButton.fontSize = "18px";
        nextButton.paddingLeft = "20px";
        bottomStack.addControl(nextButton);

        sceneInitializer.addResizeObserver((width, height) => {
            const minSize = Math.min(width, height);
            const mainHeight = minSize * 0.87;
            mainRect.width = mainHeight + "px";
            mainRect.height = mainHeight + "px";
            mainRect.cornerRadius = minSize / 16;
            topRect.height = minSize * 0.2 + "px";
            centerRect.height = mainHeight - (minSize * 0.3) + "px";
            bottomRect.height = minSize * 0.1 + "px";
            welcomeText.width = minSize * 0.62 + "px";
            welcomeText.fontSize = minSize / 8 + "px";

            const imageWidth = minSize * 0.2;
            const imageHeight = minSize * 0.185;
            topImage.width = imageWidth + "px";
            topImage.height = imageHeight + "px";
            middleImage.width = imageWidth * 0.45 + "px";
            middleImage.height = imageHeight * 0.45 + "px";

            this.textAreaRect.width = 0.76 * minSize + "px";
            this.textAreaRect.cornerRadius = minSize / 40;

            this.textAreaRect.paddingBottomInPixels = minSize / 160;
            this.inputTextArea.fontSize = minSize / 36 + "px";

            this.inputTextArea.paddingBottomInPixels = minSize / 80;
            this.inputTextArea.paddingLeftInPixels = 3 * minSize / 160;
            this.inputTextArea.paddingRightInPixels = 3 * minSize / 160;
            this.inputTextArea.paddingTopInPixels = minSize / 80;
        });
    }

    public typeTextLetterByLetter(fullText: string, delay = 0, wrapLimit = 55) {
        let index = 0;
        const target = this.inputTextArea;
    
        function smartWrap(text: string, limit: number): string {
            const lines = text.split("\n");
            const wrappedLines: string[] = [];
    
            for (const line of lines) {
                if (line.trim() === "") {
                    wrappedLines.push(""); // preserve empty line
                    continue;
                }
    
                let i = 0;
                while (i < line.length) {
                    let nextBreak = i + limit;
    
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
        }
    
        function addNextChar() {
            if (index <= fullText.length) {
                const currentRaw = fullText.substring(0, index);
                const currentWrapped = smartWrap(currentRaw, wrapLimit);
                target.text = currentWrapped;
    
                index++;
                setTimeout(addNextChar, delay);
            }
        }
    
        addNextChar();
    }
}

const popupHint = new PopupHint();
export default popupHint;