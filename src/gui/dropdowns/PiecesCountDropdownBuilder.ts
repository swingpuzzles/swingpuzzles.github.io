import ctx from "../../components/common/SceneContext";
import tutorialManager from "../TutorialManager";
import DropdownBuilder from "./DropdownBuilder";
import { GameMode } from "../../components/behaviors/GameModeManager";

export default class PiecesCountDropdownBuilder extends DropdownBuilder {
    private _optionSelected: boolean = false;

    constructor() {
        super({ gameModes: [ GameMode.Initial ], selectionCallback: (key, userAction) => { this.selectionCallback(key, userAction); }});

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

    protected get storageItemName(): string {
        return "numPieces";
    }

    private selectionCallback(key: string, userAction: boolean = true) {
        const match = key.match(/(\d+)\s*x\s*(\d+)/);

        if (match) {
            const xCount = parseInt(match[1], 10);
            const zCount = parseInt(match[2], 10);

            this.selectAction(xCount, zCount, key, userAction);
        }
    }

    addPiecesNums(xCount: number, zCount: number, last: boolean = false) {
        const isPortrait = ctx.engine.getRenderHeight() > ctx.engine.getRenderWidth();

        if (isPortrait) {
            let help = xCount;
            xCount = zCount;
            zCount = help;
        }

        const count = xCount * zCount;
        const text = `${xCount} x ${zCount} = ${count} pieces`;
        this.addOption(text);

        if (!localStorage.getItem(this.storageItemName) || isNaN(Number(localStorage.getItem(this.storageItemName)))) {
            localStorage.setItem(this.storageItemName, count.toString());
        }

        if (count <= Number(localStorage.getItem(this.storageItemName)) || last && !this._optionSelected) {
            this.dropdown.doSelectAction(text, null, null, false);
            this._optionSelected = true;
        }
    }

    selectAction(xCount: number, zCount: number, text: string, userAction: boolean = true) {
        const count = xCount * zCount;
        localStorage.setItem(this.storageItemName, count.toString());

        const paddedText = "🧩 " + text;
        this.dropdown.setContent(paddedText);

        ctx.numX = xCount;
        ctx.numZ = zCount;

        if (userAction) {
            tutorialManager.showPuzzleChooserHint();
        }
    }
}