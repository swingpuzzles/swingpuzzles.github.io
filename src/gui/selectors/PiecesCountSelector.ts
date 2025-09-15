import { CommonStorageKeys, GiftStorageKeys } from "../../common/LocalStorageManager";
import TextSelector from "./TextSelector";

export default class PiecesCountSelector extends TextSelector {
    constructor(selectedPiecesCount: string) {
        const piecesCounts = ["300", "500", "1000"];

        const countModel = piecesCounts.map(count => ({
            id: count,
            text: `${count} Pieces`,
            selected: selectedPiecesCount === count
        }));

        super(countModel);
    }

    get id(): string {
        return CommonStorageKeys.GiftPiecesCount;
    }

    get widthCoef(): number {
        return 3;
    }
}