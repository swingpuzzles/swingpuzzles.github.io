import { Button } from "@babylonjs/gui";
import puzzleAssetsManager from "../../core3d/behaviors/PuzzleAssetsManager";
import BaseSelector from "./BaseSelector";
export default class ImageSelector extends BaseSelector {
    constructor(model) {
        super(model);
    }
    createButton(row) {
        const rowModel = row;
        const btn = Button.CreateImageOnlyButton(`image-selector_${row.id}`, rowModel.lowResUrl ? rowModel.lowResUrl : rowModel.highResUrl);
        if (rowModel.lowResUrl) {
            puzzleAssetsManager.addGuiImageButtonSource(btn, rowModel.highResUrl);
        }
        return btn;
    }
}
