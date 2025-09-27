import { CommonStorageKeys } from "../../common/LocalStorageManager";
import TextSelector from "./TextSelector";
import { i18nManager, TranslationKeys } from "../../common/i18n";

export default class PiecesCountSelector extends TextSelector {
    constructor(selectedPiecesCount: string) {
        const piecesCounts = ["300", "500", "1000"];

        const countModel = piecesCounts.map(count => ({
            id: count,
            text: `${count} ${i18nManager.translate(TranslationKeys.UI.LABELS.PUZZLE_PIECES)}`,
            selected: selectedPiecesCount === count
        }));

        super(countModel);
    }

    get id(): string {
        return CommonStorageKeys.GiftPiecesCount;
    }

    get widthCoef(): number {
        return 3.8;
    }
}