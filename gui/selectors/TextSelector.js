import { Button } from "@babylonjs/gui";
import BaseSelector from "./BaseSelector";
export default class TextSelector extends BaseSelector {
    constructor(model) {
        super(model);
    }
    createButton(row) {
        const rowModel = row;
        const btn = Button.CreateSimpleButton(`text-selector_${row.id}`, rowModel.text);
        btn.textBlock.color = "#FFFFFF";
        btn.background = "#2c3e50";
        return btn;
    }
}
