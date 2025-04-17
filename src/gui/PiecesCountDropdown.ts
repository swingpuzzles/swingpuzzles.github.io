import ctx from "../components/common/SceneContext";
import Dropdown from "./Dropdown";

export default class PiecesCountDropdown extends Dropdown {
    constructor(advancedTexture: any) {
        super(advancedTexture, /*{
            width: 100,
            height: 30,
            color: "white",
            background: "black",
            align: 0.5,
            valign: 0.5,
        }*/);

        this.top = "10px";

        this.addPiecesNums(5, 3, true);
        this.addPiecesNums(6, 4);
        this.addPiecesNums(8, 5);
        this.addPiecesNums(10, 6);
        this.addPiecesNums(13, 8);
        this.addPiecesNums(16, 10);
        this.addPiecesNums(19, 12);
        this.addPiecesNums(24, 15);
        this.addPiecesNums(25, 20);
    }

    addPiecesNums(xCount: number, zCount: number, selected: boolean = false) {
        const count = xCount * zCount;
        const text = `${xCount} x ${zCount} = ${count} pieces`;
        this.addOption(text, () => { this.selectAction(xCount, zCount, text); });

        if (selected) {
            this.selectAction(xCount, zCount, text);
        }
    }

    selectAction(xCount: number, zCount: number, text: string) {
        const maxLength = 25; // set this to your desired fixed length
        const paddedText = text/*.padEnd(maxLength - 2, " ")*/ + "     ▼"; // keep room for " ▼"
        this.setText(paddedText);

        ctx.numX = xCount;
        ctx.numZ = zCount;
    }

    addPiecesCount(count: number) {
        this.addOption(`${count} pieces`, () => {});
    }
}