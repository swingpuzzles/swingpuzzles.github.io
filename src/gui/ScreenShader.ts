import { AdvancedDynamicTexture, Control, Grid, Image, Rectangle } from "@babylonjs/gui";
import sceneInitializer from "../components/SceneInitializer";

class ScreenShader {
    constructor() {
    }

    public init() {
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        // Create a top panel using a Grid with 3 columns
        const topPanel = new Grid();
        topPanel.paddingTopInPixels = 0;
        topPanel.paddingBottom = 0;
        topPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        topPanel.addColumnDefinition(1, false); // left flex
        topPanel.addColumnDefinition(450, true); // center fixed width
        topPanel.addColumnDefinition(1, false); // right flex
        advancedTexture.addControl(topPanel);

        // LEFT panel (black bg, 50% transparent)
        const leftPanel = new Rectangle();
        leftPanel.thickness = 0;
        leftPanel.background = "black";
        leftPanel.alpha = 0.5;
        leftPanel.paddingTop = "0px";
        leftPanel.paddingBottom = "0px";
        topPanel.addControl(leftPanel, 0, 0);

        const centerPanel = new Rectangle();
        centerPanel.width = "100%";
        centerPanel.thickness = 0;
        centerPanel.alpha = 1;
        centerPanel.paddingTop = "0px";
        centerPanel.paddingBottom = "0px";
        centerPanel.paddingLeft = "0px";
        centerPanel.paddingRight = "0px";
        centerPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        centerPanel.height = "100%";
        topPanel.addControl(centerPanel, 0, 1);
        
        const img = new Image("img", "assets/shadow-window.webp");
        img.stretch = Image.STRETCH_FILL; // or STRETCH_UNIFORM if you prefer aspect ratio
        img.alpha = 0.5;
        img.height = "100%";
        img.width = "100%";
        img.paddingTop = "0px";
        img.paddingBottom = "0px";
        img.paddingLeft = "0px";
        img.paddingRight = "0px";
        img.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        img.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        
        centerPanel.addControl(img);

        // RIGHT panel (black bg, 50% transparent)
        const rightPanel = new Rectangle();
        rightPanel.thickness = 0;
        rightPanel.background = "black";
        rightPanel.alpha = 0.5;
        rightPanel.paddingTop = "0px";
        rightPanel.paddingBottom = "0px";
        topPanel.addControl(rightPanel, 0, 2);

        // REST of the screen
        const restPanel = new Rectangle();
        restPanel.thickness = 0;
        restPanel.background = "black";
        restPanel.alpha = 0.5;
        restPanel.height = "100%";
        restPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(restPanel);

        sceneInitializer.addResizeObserver((width, height) => {
            topPanel.height = 3 * height / 40 + "px";//"70px";
            topPanel.setColumnDefinition(1, height / 2, true);
            restPanel.top = 3 * height / 40 + "px";//"70px"; // offset from topPanel
        });
    }
}

const screenShader = new ScreenShader();
export default screenShader;