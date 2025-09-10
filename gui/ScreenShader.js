import { Control, Grid, Image, Rectangle } from "@babylonjs/gui";
import sceneInitializer from "../core3d/SceneInitializer";
import ctx from "../core3d/common/SceneContext";
import guiManager from "./GuiManager";
export var ShaderMode;
(function (ShaderMode) {
    ShaderMode[ShaderMode["NONE"] = 0] = "NONE";
    ShaderMode[ShaderMode["SHADOW_WINDOW"] = 1] = "SHADOW_WINDOW";
    ShaderMode[ShaderMode["SHADOW_FULL"] = 2] = "SHADOW_FULL";
    ShaderMode[ShaderMode["SHADOW_WINDOW_WIDE"] = 3] = "SHADOW_WINDOW_WIDE";
})(ShaderMode || (ShaderMode = {}));
export default class ScreenShader {
    constructor() {
        this._shaderMode = ShaderMode.NONE;
    }
    init() {
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
            this.resize();
        });
    }
    resize() {
        const width = ctx.engine.getRenderWidth();
        const height = ctx.engine.getRenderHeight();
        switch (this._shaderMode) {
            case ShaderMode.SHADOW_WINDOW:
                this._topPanel.heightInPixels = 3 * height / 40;
                this._restPanel.topInPixels = 3 * height / 40;
                this._topPanel.setColumnDefinition(1, height / 2, true);
                break;
            case ShaderMode.SHADOW_WINDOW_WIDE:
                this._topPanel.heightInPixels = 3 * height / 20;
                this._restPanel.topInPixels = 3 * height / 20;
                this._topPanel.setColumnDefinition(1, 0.95 * width, true);
                break;
            default:
                this._topPanel.heightInPixels = 0;
                this._restPanel.topInPixels = 0;
        }
    }
    exitShader() {
        this.setShaderMode(ShaderMode.NONE);
    }
    setShaderMode(mode) {
        if (this._shaderMode !== mode) {
            this._shaderMode = mode;
            this._mainContainer.isVisible = mode !== ShaderMode.NONE;
            this._mainContainer.zIndex = mode === ShaderMode.SHADOW_WINDOW || mode === ShaderMode.SHADOW_WINDOW_WIDE ? 19.5 : 349.5;
            this.resize();
        }
    }
}
