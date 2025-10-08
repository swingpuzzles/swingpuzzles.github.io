import { Control } from "@babylonjs/gui";
import popupHint from "./PopupHint";
import { ShaderMode } from "./ScreenShader";

class CalendarManager {
    public start() {
        popupHint.show("TODO message", "TODO: Na dnes", {}, {}, 0.95, ShaderMode.SHADOW_WINDOW, Control.VERTICAL_ALIGNMENT_BOTTOM,
            () => { /* TODO */ }, () => { /* TODO */ });

    }
}

const calendarManager = new CalendarManager();
export default calendarManager;

