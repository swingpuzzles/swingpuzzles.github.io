import ctx from "../components/common/SceneContext";
import Dropdown from "./Dropdown";
import tutorialManager from "./TutorialManager";

export default class PiecesCountDropdown extends Dropdown {
    constructor() {
        super();

        //if (debug) {  // TODO
            this.addPiecesNums(3, 2);
        //}

        this.addPiecesNums(5, 3);
        this.addPiecesNums(6, 4);
        this.addPiecesNums(8, 5);
        this.addPiecesNums(10, 6);
        this.addPiecesNums(13, 8);
        this.addPiecesNums(16, 10);
        this.addPiecesNums(19, 12);
        this.addPiecesNums(24, 15);
        this.addPiecesNums(25, 20);
    }

    addPiecesNums(xCount: number, zCount: number) {
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

        if (count === Number(localStorage.getItem("numPieces"))) {
            this.selectAction(xCount, zCount, text, false);
        }
    }

    selectAction(xCount: number, zCount: number, text: string, userAction: boolean = true) {
        const count = xCount * zCount;
        localStorage.setItem("numPieces", count.toString());

        const paddedText = "🧩 " + text + "   ▼"; // keep room for " ▼"
        this.setText(paddedText);

        ctx.numX = xCount;
        ctx.numZ = zCount;

        if (userAction) {
            tutorialManager.showPuzzleChooserHint();
        }
    }
}