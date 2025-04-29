import { AdvancedDynamicTexture, Container, Control, Rectangle, StackPanel, TextBlock, Image, InputTextArea, Button } from "@babylonjs/gui";
import puzzleAssetsManager from "../components/behaviors/PuzzleAssetsManager";

class PopupHint {
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
        mainRect.width = "800px";
        mainRect.height = "800px";
        mainRect.background = "#FFE2B8FF";
        mainRect.color = "#B15E0AFF";
        mainRect.cornerRadius = 50;
        mainRect.thickness = 1;
        mainRect.shadowOffsetX = 5;
        mainRect.shadowColor = "#B15E0AFF";
        root.addControl(mainRect);

        // Vertical StackPanel inside Rectangle
        const mainStack = new StackPanel("StackPanel");
        mainStack.width = "800px";
        mainStack.height = "800px";
        mainStack.isVertical = true;
        mainRect.addControl(mainStack);

        // Top Rectangle (with Welcome text and Image)
        const topRect = new Rectangle("Rectangle");
        topRect.width = "800px";
        topRect.height = "200px";
        topRect.background = "#F6E8D0FF";
        topRect.color = "#AAAAAA";
        mainStack.addControl(topRect);

        const topStack = new StackPanel("StackPanel");
        topStack.height = "100%";
        topStack.isVertical = false;
        topRect.addControl(topStack);

        const topImage = new Image("Image", "assets/mascot-avatar-small.webp");
        topImage.width = "185px";
        topImage.height = "180px";
        topStack.addControl(topImage);

        const welcomeText = new TextBlock("Textblock", "Welcome!");
        welcomeText.width = "598px";
        welcomeText.height = "100%";
        welcomeText.fontSize = "80px";
        welcomeText.color = "#000000";
        welcomeText.fontWeight = "bold";
        welcomeText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        welcomeText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        topStack.addControl(welcomeText);

        // Middle Rectangle (with InputTextArea)
        const middleStack = new StackPanel("StackPanel");
        middleStack.height = "500px";
        middleStack.isVertical = false;
        mainStack.addControl(middleStack);

        const middleImage = new Image("Image", "assets/mascot-avatar-small.webp");
        middleImage.width = "95px";
        middleImage.height = "90px";
        middleImage.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        //middleImage.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        middleImage.paddingBottom = "5px";
        middleImage.paddingLeft = "5px";
        middleStack.addControl(middleImage);

        puzzleAssetsManager.addGuiImageSourceForMultiple([ topImage, middleImage ], "assets/mascot-avatar.webp");

        const textAreaRect = new Rectangle("Rectangle");
        textAreaRect.width = "695px";
        textAreaRect.height = "490px";
        textAreaRect.background = "#F9F6F1FF";
        textAreaRect.color = "#000000";
        textAreaRect.thickness = 0;
        textAreaRect.cornerRadius = 50;
        middleStack.addControl(textAreaRect);

        const inputTextArea = new InputTextArea("InputText");
        inputTextArea.text = "Input Text";
        inputTextArea.width = "95%";
        inputTextArea.height = "95%";
        inputTextArea.color = "#000000";
        inputTextArea.thickness = 0;
        inputTextArea.background = "#00000000";
        inputTextArea.focusedBackground = "#00000000";
        inputTextArea.fontSize = "26px";
        textAreaRect.addControl(inputTextArea);

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

    }
}

const popupHint = new PopupHint();
export default popupHint;