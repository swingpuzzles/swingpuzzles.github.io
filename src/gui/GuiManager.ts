import { AdvancedDynamicTexture, Button, Control, StackPanel, Image } from "@babylonjs/gui";
import ctx, { Categories } from "../core3d/common/SceneContext";
import puzzleAssetsManager from "../core3d/behaviors/PuzzleAssetsManager";
import puzzleCircleBuilder from "../core3d/builders/PuzzleCircleBuilder";
import gameModeManager, { GameMode } from "../core3d/behaviors/GameModeManager";
import backToInitialAnimation from "../core3d/animations/BackToInitialAnimation";
import openCoverAnimation from "../core3d/animations/OpenCoverAnimation";
import sceneInitializer from "../core3d/SceneInitializer";
import screenShader from "./ScreenShader";
import popupHint from "./PopupHint";
import giftMaker from "./GiftMaker";
import { Dropdown } from "./dropdowns/Dropdown";
import CategoryDropdownBuilder from "./dropdowns/CategoryDropdownBuilder";
import PiecesCountDropdownBuilder from "./dropdowns/PiecesCountDropdownBuilder";
import urlDecoder from "../common/UrlDecoder";

class GuiManager {
    private _advancedTexture!: AdvancedDynamicTexture;
    private bottomButtonPanel!: StackPanel;
    private piecesCountDropdown!: Dropdown;
    private playButton!: Button;
    private bannerButton!: Button;
    private xButton!: Button;
    private menuButton!: Button;
    private categoryDropdown!: Dropdown;

    get advancedTexture() {
        return this._advancedTexture;
    }

    init() {
        this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, ctx.scene);
    
        this.piecesCountDropdown = new PiecesCountDropdownBuilder().build();
        guiManager.advancedTexture.addControl(this.piecesCountDropdown);

        screenShader.init();
        
        popupHint.init();

        giftMaker.init();

        urlDecoder.init();
        
        this.categoryDropdown = new CategoryDropdownBuilder().build();
        guiManager.advancedTexture.addControl(this.categoryDropdown);

        this._createButtons();
    }

    private _createButtons() {
        this.bottomButtonPanel = new StackPanel();
        this.bottomButtonPanel.isVertical = true;
        this.bottomButtonPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.bottomButtonPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

        this.playButton = Button.CreateImageOnlyButton("btn1", "assets/buttons/play-button-small.webp");
        this.playButton.thickness = 0;
        this.playButton.background = "";
        this.playButton.hoverCursor = "pointer";
        this.playButton.onPointerClickObservable.add(() => {
            openCoverAnimation.animate(puzzleCircleBuilder.selectedCover);
        });
        this.bottomButtonPanel.addControl(this.playButton);

        this.bannerButton = Button.CreateImageOnlyButton("btn2", "assets/buttons/banner.png");
        this.bannerButton.thickness = 0;
        this.bannerButton.background = "";
        this.bannerButton.hoverCursor = "pointer";
        this.bannerButton.onPointerClickObservable.add(() => {
            window.open(puzzleCircleBuilder.selectedLink, "_blank");
        });
        this.bottomButtonPanel.addControl(this.bannerButton);

        this._advancedTexture.addControl(this.bottomButtonPanel);

        // Register buttons for high-res replacement
        puzzleAssetsManager.addGuiImageButtonSource(this.playButton, "assets/buttons/play-button.webp");

        this.xButton = Button.CreateImageOnlyButton("xButton", "assets/buttons/x-button.webp");
        this.xButton.thickness = 0;
        this.xButton.background = "";
        this.xButton.hoverCursor = "pointer";
        this.xButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.xButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.xButton.onPointerClickObservable.add(() => {
            backToInitialAnimation.animate(ctx.currentCover);
        });

        this._advancedTexture.addControl(this.xButton);

        this.menuButton = Button.CreateImageOnlyButton("xButton", "assets/buttons/menu-button.webp");
        this.menuButton.thickness = 0;
        this.menuButton.background = "";
        this.menuButton.hoverCursor = "pointer";
        this.menuButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.menuButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        this._advancedTexture.addControl(this.menuButton);

        gameModeManager.addGameModeChangedObserver(() => {
            this.refreshButtonSizes();
        });

        sceneInitializer.addResizeObserver((width, height) => {
            this.refreshButtonSizes();
        });
    }

    private refreshButtonSizes() {
        const renderHeight = ctx.engine.getRenderHeight();

        this.bottomButtonPanel.spacing = renderHeight / 48;
        this.playButton.width = renderHeight / 2 + "px";
        this.playButton.height = renderHeight / 8 + "px";
        this.xButton.width = renderHeight / 12 + "px";
        this.xButton.height = renderHeight / 12 + "px";
        this.xButton.paddingTopInPixels = renderHeight / 80;
        this.xButton.paddingRightInPixels = renderHeight / 80;
        this.menuButton.width = renderHeight / 12 + "px";
        this.menuButton.height = renderHeight / 10 + "px";
        this.menuButton.paddingTopInPixels = renderHeight / 80;
        this.menuButton.paddingRightInPixels = renderHeight / 80;

        this.playButton.isVisible = false;
        this.menuButton.isVisible = false;
        this.xButton.isVisible = false;
        this.bannerButton.isVisible = false;

        switch (gameModeManager.currentMode) {
            case GameMode.Initial:
                this.playButton.isVisible = true;
                this.menuButton.isVisible = false;//true;   // TODO LATER
                this.bannerButton.isVisible = true;
                this.bannerButton.width = renderHeight / 4 + "px";//"240px";
                this.bannerButton.height = renderHeight / 16 + "px";//"60px";
                this.bottomButtonPanel.paddingBottom = renderHeight / 48 + "px";//"20px";
                break;
            case GameMode.OpenCover:
                this.xButton.isVisible = true;
                this.bannerButton.width = renderHeight / 3.9 + "px";//"248px";
                this.bannerButton.isVisible = true;
                this.bannerButton.height = renderHeight / 15.6 + "px";//"62px";
                this.bottomButtonPanel.paddingBottom = renderHeight / 48 + "px";//"20px";
                break;
            case GameMode.Solve:
                this.xButton.isVisible = true;
                this.bannerButton.width = renderHeight / 8 + "px";//"124px";
                this.bannerButton.isVisible = true;
                this.bannerButton.height = renderHeight / 32 + "px";//"31px";
                this.bottomButtonPanel.paddingBottom = renderHeight / 192 + "px";//"5px";
                break;
            case GameMode.Celebration:
                this.xButton.isVisible = true;
                this.bannerButton.width = renderHeight / 3.7 + "px";//"248px";
                this.bannerButton.isVisible = true;
                this.bannerButton.height = renderHeight / 14.8 + "px";//"62px";
                this.bottomButtonPanel.paddingBottom = renderHeight / 48 + "px";//"20px";
                break;
            }
    }

    public enterGeneralCategory(): void {
        const generalCat = Categories.General;
        this.categoryDropdown.doSelectAction(generalCat.text, generalCat.url, null, false);
    }

    public enterCategory(category: string): void {
        const found = Object.values(Categories).find(cat => cat.key === category);

        if (found) {
            this.categoryDropdown.doSelectAction(found.text, found.url, null, false);
        }
    }
}

const guiManager = new GuiManager();
export default guiManager;
