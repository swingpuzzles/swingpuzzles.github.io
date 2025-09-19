import { AdvancedDynamicTexture, Button, Control, StackPanel, Image } from "@babylonjs/gui";
import ctx, { Categories, Category } from "../core3d/common/SceneContext";
import puzzleAssetsManager from "../core3d/behaviors/PuzzleAssetsManager";
import puzzleCircleBuilder from "../core3d/builders/PuzzleCircleBuilder";
import gameModeManager, { GameMode } from "../core3d/behaviors/GameModeManager";
import backToInitialAnimation from "../core3d/animations/BackToInitialAnimation";
import openCoverAnimation from "../core3d/animations/OpenCoverAnimation";
import sceneInitializer from "../core3d/SceneInitializer";
import popupHint, { overPopup } from "./PopupHint";
import giftMaker from "./GiftMaker";
import { Dropdown } from "./dropdowns/Dropdown";
import CategoryDropdownBuilder from "./dropdowns/CategoryDropdownBuilder";
import PiecesCountDropdownBuilder from "./dropdowns/PiecesCountDropdownBuilder";
import navigationManager from "./NavigationManager";
import puzzleUrlHelper from "../common/PuzzleUrlHelper";
import analyticsManager from "../common/AnalyticsManager";
import specialModeManager from "../common/special-mode/SpecialModeManager";
import { ISpecialMode } from "../common/special-mode/ISpecialMode";
import { GuiHelpers } from "./GuiHelpers";

class GuiManager {
    private _advancedTexture!: AdvancedDynamicTexture;
    private bottomButtonPanel!: StackPanel;
    private piecesCountDropdown!: Dropdown;
    private playButton!: Button;
    private bannerButton!: Button;
    private xButton!: Button;
    private menuButton!: Button;
    private categoryDropdown!: Dropdown;
    private _xAction: (() => void) | null = null;

    get advancedTexture() {
        return this._advancedTexture;
    }

    async init() {
        this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, ctx.scene);
    
        this.piecesCountDropdown = new PiecesCountDropdownBuilder().build();
        this.advancedTexture.addControl(this.piecesCountDropdown);

        popupHint.init();
        overPopup.init();

        giftMaker.init();
        
        this.categoryDropdown = new CategoryDropdownBuilder().build();
        this.advancedTexture.addControl(this.categoryDropdown);

        await puzzleUrlHelper.handleUrlData();

        this._createButtons();
    }

    private _createButtons() {
        this.bottomButtonPanel = new StackPanel();
        this.bottomButtonPanel.isVertical = true;
        this.bottomButtonPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.bottomButtonPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

        this.playButton = Button.CreateImageWithCenterTextButton("btn1", "PLAY!", "assets/buttons/play-button-small.webp");
        this.playButton.thickness = 0;
        this.playButton.background = "";
        this.playButton.hoverCursor = "pointer";
        this.playButton.textBlock!.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.playButton.textBlock!.paddingRight = "5%";
        this.playButton.textBlock!.fontWeight = "bold";
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

        this._xAction = () => { navigationManager.handleXAction(); }

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

    private refreshButtonSizes() {
        const renderHeight = ctx.engine.getRenderHeight();

        this.bottomButtonPanel.spacing = renderHeight / 48;
        this.playButton.width = renderHeight / 2 + "px";
        this.playButton.height = renderHeight / 8 + "px";
        let fontSize = GuiHelpers.calculateFontSize(this.playButton.textBlock!.text, renderHeight / 4, renderHeight / 8, this.playButton.textBlock!.fontWeight, this.playButton.textBlock!.fontFamily);
        this.playButton.textBlock!.fontSizeInPixels = fontSize;

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
                this.bannerButton.isVisible = specialModeManager.bannerButtonVisible(true);
                this.bannerButton.width = renderHeight / 4 + "px";//"240px";
                this.bannerButton.height = renderHeight / 16 + "px";//"60px";
                this.bottomButtonPanel.paddingBottom = renderHeight / 48 + "px";//"20px";
                break;
            case GameMode.OpenCover:
                this.xButton.isVisible = this._xAction !== null;
                this.bannerButton.width = renderHeight / 3.9 + "px";//"248px";
                this.bannerButton.isVisible = specialModeManager.bannerButtonVisible(true);
                this.bannerButton.height = renderHeight / 15.6 + "px";//"62px";
                this.bottomButtonPanel.paddingBottom = renderHeight / 48 + "px";//"20px";
                break;
            case GameMode.Solve:
                this.xButton.isVisible = this._xAction !== null;
                this.bannerButton.width = renderHeight / 8 + "px";//"124px";
                this.bannerButton.isVisible = specialModeManager.bannerButtonVisible(true);
                this.bannerButton.height = renderHeight / 32 + "px";//"31px";
                this.bottomButtonPanel.paddingBottom = renderHeight / 192 + "px";//"5px";
                break;
            case GameMode.Celebration:
                this.xButton.isVisible = this._xAction !== null;
                this.bannerButton.width = renderHeight / 3.7 + "px";//"248px";
                this.bannerButton.isVisible = specialModeManager.bannerButtonVisible(true);
                this.bannerButton.height = renderHeight / 14.8 + "px";//"62px";
                this.bottomButtonPanel.paddingBottom = renderHeight / 48 + "px";//"20px";
                break;
            }
    }

    public setPiecesCount(count: number) {
        this.piecesCountDropdown.selectByCondition((name: string) => {
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

    public enterGeneralCategory(): void {
        this.enterCategoryImpl(Categories.General);
    }

    public ensureNotGiftCategory(): void {
        if (ctx.category === Categories.Gift) {
            this.enterGeneralCategory();
        }
    }

    public enterCategory(category: string, callChangeHandler: boolean = true): void {
        const found = Object.values(Categories).find(cat => cat.key === category);

        if (found) {
            this.enterCategoryImpl(found);
        }
    }

    private enterCategoryImpl(category: Category, callChangeHandler: boolean = true): void {
        this.categoryDropdown.doSelectAction(category.text, category.url, null, false, false);

        if (callChangeHandler) {
            gameModeManager.handleCategoryChange(category, false);
        }
    }

    public enterSpecialMode(specialMode: ISpecialMode): void {
        this.categoryDropdown.disable();
    }
}

const guiManager = new GuiManager();
export default guiManager;
