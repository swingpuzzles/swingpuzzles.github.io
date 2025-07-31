import { Button } from "@babylonjs/gui";
import puzzleAssetsManager from "../../core3d/behaviors/PuzzleAssetsManager";
import { ImageSelectorModel, SelectorModel } from "../../model/SelectorModel";
import BaseSelector from "./BaseSelector";

export default abstract class ImageSelector extends BaseSelector {
    constructor(model: ImageSelectorModel[]) {
        super(model);
    }

    createButton(row: SelectorModel): Button {
        const rowModel = row as ImageSelectorModel;

        const btn = Button.CreateImageOnlyButton(`image-selector_${row.id}`, rowModel.lowResUrl ? rowModel.lowResUrl : rowModel.highResUrl);

        if (rowModel.lowResUrl) {
            puzzleAssetsManager.addGuiImageButtonSource(btn, rowModel.highResUrl);
        }

        return btn;
    }
}