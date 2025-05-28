import ctx from "../../components/common/SceneContext";
import Dropdown from "./Dropdown";
import tutorialManager from "../TutorialManager";

export default class PiecesCountDropdown extends Dropdown {
    private _optionSelected: boolean = false;

    constructor() {
        super();

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

    addPiecesNums(xCount: number, zCount: number, last: boolean = false) {
        const isPortrait = ctx.engine.getRenderHeight() > ctx.engine.getRenderWidth();

        if (isPortrait) {
            let help = xCount;
            xCount = zCount;
            zCount = help;
        }

        const count = xCount * zCount;
        const text = `${xCount} x ${zCount} = ${count} pieces`;
        this.addOption(text, () => { this.selectAction(xCount, zCount, text); });

        if (!localStorage.getItem("numPieces") || isNaN(Number(localStorage.getItem("numPieces")))) {
            localStorage.setItem("numPieces", count.toString());
        }

        if (count <= Number(localStorage.getItem("numPieces")) || last && !this._optionSelected) {
            this.selectAction(xCount, zCount, text, false);
            this._optionSelected = true;
        }
    }

    selectAction(xCount: number, zCount: number, text: string, userAction: boolean = true) {
        const count = xCount * zCount;
        localStorage.setItem("numPieces", count.toString());

        const paddedText = "🧩 " + text + "   ▼"; // keep room for " ▼"
        this.setContent(paddedText);

        ctx.numX = xCount;
        ctx.numZ = zCount;

        if (userAction) {
            tutorialManager.showPuzzleChooserHint();
        }
    }
}