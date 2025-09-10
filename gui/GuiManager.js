var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AdvancedDynamicTexture, Button, Control, StackPanel } from "@babylonjs/gui";
import ctx, { Categories } from "../core3d/common/SceneContext";
import puzzleAssetsManager from "../core3d/behaviors/PuzzleAssetsManager";
import puzzleCircleBuilder from "../core3d/builders/PuzzleCircleBuilder";
import gameModeManager, { GameMode } from "../core3d/behaviors/GameModeManager";
import backToInitialAnimation from "../core3d/animations/BackToInitialAnimation";
import openCoverAnimation from "../core3d/animations/OpenCoverAnimation";
import sceneInitializer from "../core3d/SceneInitializer";
import popupHint, { overPopup } from "./PopupHint";
import giftMaker from "./GiftMaker";
import CategoryDropdownBuilder from "./dropdowns/CategoryDropdownBuilder";
import PiecesCountDropdownBuilder from "./dropdowns/PiecesCountDropdownBuilder";
import urlDecoder from "../common/UrlDecoder";
import navigationManager from "./NavigationManager";
import puzzleUrlHelper from "../common/PuzzleUrlHelper";
import analyticsManager from "../common/AnalyticsManager";
class GuiManager {
    constructor() {
        this._xAction = null;
    }
    get advancedTexture() {
        return this._advancedTexture;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, ctx.scene);
            this.piecesCountDropdown = new PiecesCountDropdownBuilder().build();
            guiManager.advancedTexture.addControl(this.piecesCountDropdown);
            popupHint.init();
            overPopup.init();
            giftMaker.init();
            yield urlDecoder.init();
            this.categoryDropdown = new CategoryDropdownBuilder().build();
            guiManager.advancedTexture.addControl(this.categoryDropdown);
            puzzleUrlHelper.handleUrlData();
            this._createButtons();
        });
    }
    _createButtons() {
        this.bottomButtonPanel = new StackPanel();
        this.bottomButtonPanel.isVertical = true;
        this.bottomButtonPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.bottomButtonPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.playButton = Button.CreateImageOnlyButton("btn1", "assets/buttons/play-button-small.webp");
        this.playButton.thickness = 0;
        this.playButton.background = "";
        this.playButton.hoverCursor = "pointer";
        this.playButton.onPointerClickObservable.add(() => {
            analyticsManager.trackButtonClick('play_button', 'initial_mode');
            openCoverAnimation.animate(puzzleCircleBuilder.selectedCover);
        });
        this.bottomButtonPanel.addControl(this.playButton);
        this.bannerButton = Button.CreateImageOnlyButton("btn2", "assets/buttons/banner.png");
        this.bannerButton.thickness = 0;
        this.bannerButton.background = "";
        this.bannerButton.hoverCursor = "pointer";
        this.bannerButton.onPointerClickObservable.add(() => {
            analyticsManager.trackButtonClick('banner_button', 'amazon_action');
            gameModeManager.handleGetItOnAmazonAction();
        });
        this.bottomButtonPanel.addControl(this.bannerButton);
        this._advancedTexture.addControl(this.bottomButtonPanel);
        // Register buttons for high-res replacement
        puzzleAssetsManager.addGuiImageButtonSource(this.playButton, "assets/buttons/play-button.webp");
        this._xAction = () => { navigationManager.handleXAction(); };
        this.xButton = Button.CreateImageOnlyButton("xButton", "assets/buttons/x-button.webp");
        this.xButton.thickness = 0;
        this.xButton.background = "";
        this.xButton.hoverCursor = "pointer";
        this.xButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.xButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.xButton.onPointerClickObservable.add(() => {
            analyticsManager.trackButtonClick('x_button', gameModeManager.currentMode.toString());
            if (this._xAction) {
                this._xAction();
            }
        });
        this._advancedTexture.addControl(this.xButton);
        this.menuButton = Button.CreateImageOnlyButton("menuButton", "assets/buttons/menu-button.webp");
        this.menuButton.thickness = 0;
        this.menuButton.background = "";
        this.menuButton.hoverCursor = "pointer";
        this.menuButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.menuButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.menuButton.onPointerClickObservable.add(() => {
            analyticsManager.trackButtonClick('menu_button', 'menu_action');
            // TODO: Implement menu functionality
        });
        this._advancedTexture.addControl(this.menuButton);
        gameModeManager.addGameModeChangedObserver((prevMode) => {
            switch (prevMode) {
                case GameMode.Initial:
                    this._xAction = () => { navigationManager.handleXAction(); };
                    break;
                case GameMode.GiftTry:
                    this._xAction = () => { backToInitialAnimation.animate(ctx.currentCover, () => { gameModeManager.enterGiftOverviewMode(); }); };
                    break;
                case GameMode.GiftReceived:
                    this._xAction = () => { navigationManager.handleXAction(); };
                    break;
            }
            this.refreshButtonSizes();
        });
        sceneInitializer.addResizeObserver((width, height) => {
            this.refreshButtonSizes();
        });
    }
    refreshButtonSizes() {
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
                this.menuButton.isVisible = false; //true;   // TODO LATER
                this.bannerButton.isVisible = true;
                this.bannerButton.width = renderHeight / 4 + "px"; //"240px";
                this.bannerButton.height = renderHeight / 16 + "px"; //"60px";
                this.bottomButtonPanel.paddingBottom = renderHeight / 48 + "px"; //"20px";
                break;
            case GameMode.OpenCover:
                this.xButton.isVisible = this._xAction !== null;
                this.bannerButton.width = renderHeight / 3.9 + "px"; //"248px";
                this.bannerButton.isVisible = true;
                this.bannerButton.height = renderHeight / 15.6 + "px"; //"62px";
                this.bottomButtonPanel.paddingBottom = renderHeight / 48 + "px"; //"20px";
                break;
            case GameMode.Solve:
                this.xButton.isVisible = this._xAction !== null;
                this.bannerButton.width = renderHeight / 8 + "px"; //"124px";
                this.bannerButton.isVisible = true;
                this.bannerButton.height = renderHeight / 32 + "px"; //"31px";
                this.bottomButtonPanel.paddingBottom = renderHeight / 192 + "px"; //"5px";
                break;
            case GameMode.Celebration:
                this.xButton.isVisible = this._xAction !== null;
                this.bannerButton.width = renderHeight / 3.7 + "px"; //"248px";
                this.bannerButton.isVisible = true;
                this.bannerButton.height = renderHeight / 14.8 + "px"; //"62px";
                this.bottomButtonPanel.paddingBottom = renderHeight / 48 + "px"; //"20px";
                break;
        }
    }
    setPiecesCount(count) {
        this.piecesCountDropdown.selectByCondition((name) => {
            const match = name.match(/(\d+)\s*x\s*(\d+)/);
            if (match) {
                const xCount = parseInt(match[1], 10);
                const zCount = parseInt(match[2], 10);
                if (xCount * zCount >= count) {
                    return true;
                }
            }
            return false;
        });
    }
    enterGeneralCategory() {
        this.enterCategoryImpl(Categories.General);
    }
    ensureNotGiftCategory() {
        if (ctx.category === Categories.Gift) {
            this.enterGeneralCategory();
        }
    }
    enterCategory(category, callChangeHandler = true) {
        const found = Object.values(Categories).find(cat => cat.key === category);
        if (found) {
            this.enterCategoryImpl(found);
        }
    }
    enterCategoryImpl(category, callChangeHandler = true) {
        this.categoryDropdown.doSelectAction(category.text, category.url, null, false, false);
        if (callChangeHandler) {
            gameModeManager.handleCategoryChange(category, false);
        }
    }
}
const guiManager = new GuiManager();
export default guiManager;
