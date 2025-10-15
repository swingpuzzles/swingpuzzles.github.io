import { AdvancedDynamicTexture, Button, Control, StackPanel, Image } from "@babylonjs/gui";
import ctx from "../core3d/common/SceneContext";
import { Categories, Category } from "../core3d/common/Constants";
import puzzleAssetsManager from "../core3d/behaviors/PuzzleAssetsManager";
import puzzleCircleBuilder from "../core3d/builders/PuzzleCircleBuilder";
import gameModeManager, { MainMode } from "../core3d/behaviors/GameModeManager";
import backToInitialAnimation from "../core3d/animations/BackToInitialAnimation";
import openCoverAnimation from "../core3d/animations/OpenCoverAnimation";
import sceneInitializer from "../core3d/SceneInitializer";
import popupHint, { overPopup } from "./popups/PopupHint";
import giftMaker from "./GiftMaker";
import { Dropdown } from "./dropdowns/Dropdown";
import CategoryDropdownBuilder from "./dropdowns/CategoryDropdownBuilder";
import PiecesCountDropdownBuilder from "./dropdowns/PiecesCountDropdownBuilder";
import LanguageDropdownBuilder from "./dropdowns/LanguageDropdownBuilder";
import navigationManager from "./NavigationManager";
import puzzleUrlHelper from "../common/PuzzleUrlHelper";
import analyticsManager from "../common/AnalyticsManager";
import specialModeManager from "../common/special-mode/SpecialModeManager";
import { ISpecialMode } from "../common/special-mode/ISpecialMode";
import { GuiHelpers } from "./GuiHelpers";
import { i18nManager, TranslationKeys, languageManager } from "../common/i18n";

class GuiManager {
    private _advancedTexture!: AdvancedDynamicTexture;
    private bottomButtonPanel!: StackPanel;
    private piecesCountDropdown!: Dropdown;
    private piecesCountDropdownBuilder!: PiecesCountDropdownBuilder;
    private playButton!: Button;
    private bannerButton!: Button;
    private xButton!: Button;
    private menuButton!: Button;
    private calendarButton!: Button;
    private giftButton!: Button;
    private categoryDropdown!: Dropdown;
    private categoryDropdownBuilder!: CategoryDropdownBuilder;
    private languageDropdown!: Dropdown;
    private languageDropdownBuilder!: LanguageDropdownBuilder;
    private _xAction: (() => void) | null = null;

    get advancedTexture() {
        return this._advancedTexture;
    }

    async init() {
        this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, ctx.scene);
    
        this.piecesCountDropdownBuilder = new PiecesCountDropdownBuilder();
        this.piecesCountDropdown = this.piecesCountDropdownBuilder.build(true);
        this.advancedTexture.addControl(this.piecesCountDropdown);

        popupHint.init();
        overPopup.init();

        giftMaker.init();
        
        this.categoryDropdownBuilder = new CategoryDropdownBuilder();
        this.categoryDropdown = this.categoryDropdownBuilder.build();
        this.advancedTexture.addControl(this.categoryDropdown);

        this.languageDropdownBuilder = new LanguageDropdownBuilder();
        this.languageDropdown = this.languageDropdownBuilder.build();
        this.advancedTexture.addControl(this.languageDropdown);

        // Refresh translation maps after TranslationManager is initialized
        this.categoryDropdown.lang = languageManager.currentLanguage;
        this.languageDropdown.lang = languageManager.currentLanguage;
        this.languageDropdownBuilder.refreshSelection();
        this.piecesCountDropdownBuilder.refreshPiecesText();

        await puzzleUrlHelper.handleUrlData();

        this._createButtons();
        
        // Listen for language changes to refresh UI
        languageManager.addLanguageChangeObserver(() => {
            this.refreshTranslatedText();
        });
    }

    private _createButtons() {
        this.bottomButtonPanel = new StackPanel();
        this.bottomButtonPanel.isVertical = true;
        this.bottomButtonPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.bottomButtonPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

        this.playButton = Button.CreateImageWithCenterTextButton("btn1", i18nManager.translate(TranslationKeys.UI.BUTTONS.PLAY), "assets/buttons/play-button-small.webp");
        this.playButton.thickness = 0;
        this.playButton.background = "";
        this.playButton.hoverCursor = "pointer";
        this.playButton.textBlock!.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.playButton.textBlock!.paddingRight = "5%";
        this.playButton.textBlock!.fontWeight = "bold";
        this.playButton.onPointerClickObservable.add(async () => {
            analyticsManager.trackButtonClick('play_button', 'initial_mode');
            await openCoverAnimation.animateAsync(puzzleCircleBuilder.selectedCover);
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

        this.calendarButton = Button.CreateImageOnlyButton("calendarButton", "assets/buttons/calendar-button.webp");
        this.calendarButton.thickness = 0;
        this.calendarButton.background = "";
        this.calendarButton.hoverCursor = "pointer";
        this.calendarButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.calendarButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.calendarButton.zIndex = 300;
        this.calendarButton.onPointerClickObservable.add(() => {
            analyticsManager.trackButtonClick('calendar_button', 'calendar_action');
            gameModeManager.enterCalendarMode(true);
        });
        this._advancedTexture.addControl(this.calendarButton);

        this.giftButton = Button.CreateImageOnlyButton("calendarButton", "assets/buttons/giftbox.webp");
        this.giftButton.thickness = 0;
        this.giftButton.background = "";
        this.giftButton.hoverCursor = "pointer";
        this.giftButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.giftButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.giftButton.zIndex = 300;
        this.giftButton.onPointerClickObservable.add(() => {
            analyticsManager.trackButtonClick('gift_button', 'gift_action');
            gameModeManager.enterGiftInitialMode();
        });
        this._advancedTexture.addControl(this.giftButton);

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
                case MainMode.Initial:
                    this._xAction = () => { navigationManager.handleXAction(); };
                    break;
                case MainMode.GiftTry:
                    this._xAction = () => { backToInitialAnimation.animate(ctx.currentCover, () => { gameModeManager.enterGiftOverviewMode(); }); };
                    break;
                case MainMode.GiftReceived:
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
        this.playButton.widthInPixels = renderHeight / 2;
        this.playButton.heightInPixels = renderHeight / 8;
        let fontSize = GuiHelpers.calculateFontSize(this.playButton.textBlock!.text, renderHeight / 4, renderHeight / 8, this.playButton.textBlock!.fontWeight, this.playButton.textBlock!.fontFamily);
        this.playButton.textBlock!.fontSizeInPixels = fontSize;

        this.xButton.widthInPixels = renderHeight / 12;
        this.xButton.heightInPixels = renderHeight / 12;
        this.xButton.paddingTopInPixels = renderHeight / 80;
        this.xButton.paddingRightInPixels = renderHeight / 80;

        this.menuButton.widthInPixels = renderHeight / 12;
        this.menuButton.heightInPixels = renderHeight / 10;
        this.menuButton.paddingTopInPixels = renderHeight / 80;
        this.menuButton.paddingRightInPixels = renderHeight / 80;

        const calPaddingTop = renderHeight / 120;
        const calPaddingLeft = 7 * renderHeight / 80;
        
        this.calendarButton.widthInPixels = calPaddingLeft + renderHeight / 14;
        this.calendarButton.heightInPixels = calPaddingTop + renderHeight / 14;
        this.calendarButton.paddingTopInPixels = calPaddingTop;
        this.calendarButton.paddingLeftInPixels = calPaddingLeft;
        
        this.giftButton.widthInPixels = calPaddingLeft + renderHeight / 14;
        this.giftButton.heightInPixels = calPaddingTop + renderHeight / 14;
        this.giftButton.paddingTopInPixels = calPaddingTop;
        this.giftButton.paddingRightInPixels = calPaddingLeft;

        this.playButton.isVisible = false;
        this.menuButton.isVisible = false;
        this.xButton.isVisible = false;
        this.bannerButton.isVisible = false;
        this.calendarButton.isVisible = false;
        this.giftButton.isVisible = false;

        switch (gameModeManager.currentMode) {
            case MainMode.Initial:
                this.playButton.isVisible = true;
                this.menuButton.isVisible = false;//true;   // TODO LATER
                this.calendarButton.isVisible = specialModeManager.calendarButtonVisible(true);
                this.giftButton.isVisible = specialModeManager.giftButtonVisible(true);
                this.bannerButton.isVisible = specialModeManager.bannerButtonVisible(true);
                this.bannerButton.widthInPixels = renderHeight / 4;
                this.bannerButton.heightInPixels = renderHeight / 16;
                this.bottomButtonPanel.paddingBottomInPixels = renderHeight / 48;
                break;
            case MainMode.OpenCover:
                this.xButton.isVisible = this._xAction !== null;
                this.bannerButton.isVisible = specialModeManager.bannerButtonVisible(true);

                if (gameModeManager.calendarMode) {
                    this.bannerButton.widthInPixels = renderHeight / 3.7;
                    this.bannerButton.heightInPixels = renderHeight / 14.8;
                    this.bottomButtonPanel.paddingBottomInPixels = renderHeight / 48;
                } else {
                    this.bannerButton.widthInPixels = renderHeight / 3.9;
                    this.bannerButton.heightInPixels = renderHeight / 15.6;
                    this.bottomButtonPanel.paddingBottomInPixels = renderHeight / 48;
                }
                break;
            case MainMode.Solve:
                this.xButton.isVisible = this._xAction !== null;
                this.bannerButton.isVisible = specialModeManager.bannerButtonVisible(true);
                this.bannerButton.widthInPixels = renderHeight / 8;
                this.bannerButton.heightInPixels = renderHeight / 32;
                this.bottomButtonPanel.paddingBottomInPixels = renderHeight / 192;
                break;
            case MainMode.Celebration:
                this.xButton.isVisible = this._xAction !== null;
                this.bannerButton.isVisible = specialModeManager.bannerButtonVisible(true);
                this.bannerButton.widthInPixels = renderHeight / 3.7;
                this.bannerButton.heightInPixels = renderHeight / 14.8;
                this.bottomButtonPanel.paddingBottomInPixels = renderHeight / 48;
                break;
        }
    }

    public setPiecesCount(count: number) {
        this.piecesCountDropdown.selectByCondition((name: string) => {
            const match = name.match(/(\d+)\s*[x×]\s*(\d+)/);

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

    public async enterCategory(category: string, callChangeHandler: boolean = true): Promise<void> {
        const found = Object.values(Categories).find(cat => cat.key === category);

        if (found) {
            await this.enterCategoryImpl(found, callChangeHandler);
        }
    }

    private async enterCategoryImpl(category: Category, callChangeHandler: boolean = true): Promise<void> {
        this.categoryDropdown.doSelectAction(category.key, category.url, null, false, false);

        if (callChangeHandler) {
            await gameModeManager.handleCategoryChange(category, false);
        }
    }

    public enterSpecialMode(specialMode: ISpecialMode): void {
        this.categoryDropdown.disable();
    }

    private refreshTranslatedText() {
        // Refresh the play button text
        if (this.playButton && this.playButton.textBlock) {
            this.playButton.textBlock.text = i18nManager.translate(TranslationKeys.UI.BUTTONS.PLAY);
        }
        
        // Refresh dropdowns
        if (this.categoryDropdown) {
            this.categoryDropdown.lang = languageManager.currentLanguage;
        }
        if (this.languageDropdown) {
            this.languageDropdown.lang = languageManager.currentLanguage;
        }
        if (this.languageDropdownBuilder) {
            this.languageDropdownBuilder.refreshSelection();
        }
        if (this.piecesCountDropdownBuilder) {
            this.piecesCountDropdownBuilder.refreshPiecesText();
        }

        this.refreshButtonSizes();
    }
}

const guiManager = new GuiManager();
export default guiManager;
