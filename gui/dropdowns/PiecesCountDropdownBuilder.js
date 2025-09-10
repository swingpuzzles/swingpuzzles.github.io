import ctx from "../../core3d/common/SceneContext";
import tutorialManager from "../TutorialManager";
import DropdownBuilder from "./DropdownBuilder";
import { GameMode } from "../../core3d/behaviors/GameModeManager";
import localStorageManager, { GiftStorageKeys } from "../../common/LocalStorageManager";
import analyticsManager from "../../common/AnalyticsManager";
export default class PiecesCountDropdownBuilder extends DropdownBuilder {
    constructor() {
        super({ gameModes: [GameMode.Initial, GameMode.GiftInitial], selectionCallback: (key, userAction) => { this.selectionCallback(key, userAction); } });
        this._optionSelected = false;
        if (ctx.debugMode) {
            this.addPiecesNums(3, 2);
        }
        this.addPiecesNums(5, 3);
        this.addPiecesNums(6, 4);
        this.addPiecesNums(8, 5);
        this.addPiecesNums(10, 6);
        this.addPiecesNums(13, 8);
        this.addPiecesNums(16, 10);
        this.addPiecesNums(19, 12);
        this.addPiecesNums(24, 15);
        this.addPiecesNums(25, 20, true);
    }
    get storageItemName() {
        return GiftStorageKeys.NumPieces;
    }
    selectionCallback(key, userAction = true) {
        const match = key.match(/(\d+)\s*x\s*(\d+)/);
        if (match) {
            const xCount = parseInt(match[1], 10);
            const zCount = parseInt(match[2], 10);
            this.selectAction(xCount, zCount, key, userAction);
        }
    }
    addPiecesNums(xCount, zCount, last = false) {
        const isPortrait = ctx.engine.getRenderHeight() > ctx.engine.getRenderWidth();
        if (isPortrait) {
            let help = xCount;
            xCount = zCount;
            zCount = help;
        }
        const count = xCount * zCount;
        const text = `${xCount} x ${zCount} = ${count} pieces`;
        this.addOption(text);
        if (!localStorageManager.getString(this.storageItemName) || isNaN(Number(localStorageManager.getString(this.storageItemName)))) {
            localStorageManager.set(this.storageItemName, count.toString());
        }
        if ((count >= Number(localStorageManager.getString(this.storageItemName)) || last) && !this._optionSelected) {
            this.dropdown.doSelectAction(text, null, null, false);
            this._optionSelected = true;
        }
    }
    selectAction(xCount, zCount, text, userAction = true) {
        const count = xCount * zCount;
        localStorageManager.set(this.storageItemName, count.toString());
        // Track pieces count change
        if (userAction) {
            analyticsManager.trackDropdownInteraction('pieces_count_dropdown', `${xCount}x${zCount}`);
        }
        ctx.numX = xCount;
        ctx.numZ = zCount;
        if (userAction) {
            tutorialManager.showPuzzleChooserHint();
        }
    }
}
