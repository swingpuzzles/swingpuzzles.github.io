import { Control, Grid, Image, Rectangle } from "@babylonjs/gui";
import sceneInitializer from "../components/SceneInitializer";
import ctx from "../components/common/SceneContext";
import guiManager from "./GuiManager";

export enum ShaderMode {
    NONE = 0,
    SHADOW_WINDOW = 1,
    SHADOW_FULL = 2
}

class ScreenShader {
    private _mainContainer!: Rectangle;
    private _topPanel!: Grid;
    private _restPanel!: Rectangle;
    private _shaderMode: ShaderMode = ShaderMode.NONE;

    constructor() {
    }

    public init() {
        const shadeCoef = 0.75;

        this._mainContainer = new Rectangle("mainContainer");
        this._mainContainer.width = "100%";
        this._mainContainer.height = "100%";
        this._mainContainer.isVisible = false;
        this._mainContainer.isHitTestVisible = true;
        this._mainContainer.isPointerBlocker = true;
        guiManager.advancedTexture.addControl(this._mainContainer);

        // Create a top panel using a Grid with 3 columns
        this._topPanel = new Grid();
        this._topPanel.paddingTopInPixels = 0;
        this._topPanel.paddingBottom = 0;
        this._topPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        this._topPanel.addColumnDefinition(1, false); // left flex
        this._topPanel.addColumnDefinition(450, true); // center fixed width
        this._topPanel.addColumnDefinition(1, false); // right flex
        this._mainContainer.addControl(this._topPanel);

        // LEFT panel (black bg, 50% transparent)
        const leftPanel = new Rectangle();
        leftPanel.thickness = 0;
        leftPanel.background = "black";
        leftPanel.alpha = shadeCoef;
        leftPanel.paddingTop = "0px";
        leftPanel.paddingBottom = "0px";
        this._topPanel.addControl(leftPanel, 0, 0);

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
        this._topPanel.addControl(centerPanel, 0, 1);
        
        const img = new Image("img", "assets/misc/shadow-window.webp");
        img.stretch = Image.STRETCH_FILL; // or STRETCH_UNIFORM if you prefer aspect ratio
        img.alpha = shadeCoef;
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
        rightPanel.alpha = shadeCoef;
        rightPanel.paddingTop = "0px";
        rightPanel.paddingBottom = "0px";
        this._topPanel.addControl(rightPanel, 0, 2);

        // REST of the screen
        this._restPanel = new Rectangle();
        this._restPanel.thickness = 0;
        this._restPanel.background = "black";
        this._restPanel.alpha = shadeCoef;
        this._restPanel.height = "100%";
        this._restPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this._mainContainer.addControl(this._restPanel);

        sceneInitializer.addResizeObserver((width, height) => {
            this._topPanel.height = (this._shaderMode === ShaderMode.SHADOW_WINDOW ? 3 * height / 40 : 0) + "px";
            this._topPanel.setColumnDefinition(1, height / 2, true);
            this._restPanel.top = (this._shaderMode === ShaderMode.SHADOW_WINDOW ? 3 * height / 40 : 0) + "px";
        });
    }

    public enterShadowWindow() {
        this.setShaderMode(ShaderMode.SHADOW_WINDOW);
    }

    public enterShadowFull() {
        this.setShaderMode(ShaderMode.SHADOW_FULL);
    }

    public exitShader() {
        this.setShaderMode(ShaderMode.NONE);
    }

    public setShaderMode(mode: ShaderMode) {
        if (this._shaderMode !== mode) {
            this._shaderMode = mode;
            this._mainContainer.isVisible = mode !== ShaderMode.NONE;

            this._mainContainer.zIndex = mode === ShaderMode.SHADOW_WINDOW ? 10 : 40;

            const height = ctx.engine.getRenderHeight();
            this._topPanel.height = (mode === ShaderMode.SHADOW_WINDOW ? 3 * height / 40 : 0) + "px";
            this._restPanel.top = (mode === ShaderMode.SHADOW_WINDOW ? 3 * height / 40 : 0) + "px";
        }
    }
}

const screenShader = new ScreenShader();
export default screenShader;