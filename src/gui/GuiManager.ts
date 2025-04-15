import { AdvancedDynamicTexture, Button, Control, StackPanel } from "@babylonjs/gui";
import ctx from "../components/common/SceneContext";
import PiecesCountDropdown from "./PiecesCountDropdown";
import puzzleAssetsManager from "../components/behaviors/PuzzleAssetsManager";
import puzzleCoverBuilder from "../components/builders/PuzzleCoverBuilder";
import puzzleCircleBuilder from "../components/builders/PuzzleCircleBuilder";
import gameModeManager from "../components/behaviors/GameModeManager";

class GuiManager {
    private advancedTexture!: AdvancedDynamicTexture;
    private bottomButtonPanel!: StackPanel;

    init() {
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, ctx.scene);

        const piecesCountDropdown = new PiecesCountDropdown(this.advancedTexture);

        this._createBottomButtons();
    }

    private _createBottomButtons() {
        this.bottomButtonPanel = new StackPanel();
        this.bottomButtonPanel.isVertical = true;
        this.bottomButtonPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.bottomButtonPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.bottomButtonPanel.paddingBottom = "20px";
        this.bottomButtonPanel.spacing = 10;

        const button1 = Button.CreateImageOnlyButton("btn1", "assets/play-button-small.webp");
        button1.width = "480px";
        button1.height = "120px";
        button1.thickness = 0;
        button1.background = "";
        button1.hoverCursor = "pointer";
        button1.onPointerClickObservable.add(() => {
            puzzleCoverBuilder.openCover(puzzleCircleBuilder.selectedCover);
        });
        this.bottomButtonPanel.addControl(button1);

        const button2 = Button.CreateImageOnlyButton("btn2", "assets/banner.png");
        button2.width = "240px";
        button2.height = "60px";
        button2.thickness = 0;
        button2.background = "";
        button2.hoverCursor = "pointer";
        button2.onPointerClickObservable.add(() => {
            window.open(puzzleCircleBuilder.selectedLink, "_blank");
        });
        this.bottomButtonPanel.addControl(button2);

        this.advancedTexture.addControl(this.bottomButtonPanel);

        // Register buttons for high-res replacement
        puzzleAssetsManager.addGuiImageButtonSource(button1, "assets/play-button.webp");
        //puzzleAssetsManager.addGuiImageButtonSource(button2, "textures/gui/icon2.png");

        gameModeManager.addObserver(() => {
            if (gameModeManager.initialMode) {
                button1.isVisible = true;
            } else {
                button1.isVisible = false;
            }
                button2.width = "244px";
                button2.height = "61px";
            });
    }
}

const guiManager = new GuiManager();
export default guiManager;
