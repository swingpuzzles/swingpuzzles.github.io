import { Button } from "@babylonjs/gui";
import { TextSelectorModel, SelectorModel } from "../../model/SelectorModel";
import BaseSelector from "./BaseSelector";

export default abstract class TextSelector extends BaseSelector {
    constructor(model: TextSelectorModel[]) {
        super(model);
    }

    createButton(row: SelectorModel): Button {
        const rowModel = row as TextSelectorModel;

        const btn = Button.CreateSimpleButton(`text-selector_${row.id}`, rowModel.text);
        btn.textBlock!.color = "#FFFFFF";
        btn.background = "#2c3e50"

        return btn;
    }
}