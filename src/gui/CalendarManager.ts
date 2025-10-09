import { Control } from "@babylonjs/gui";
import popupHint from "./popups/PopupHint";
import { PopupMode } from "./popups/modes/PopupMode";
import { ShaderMode } from "./ScreenShader";
import i18nManager from "../common/i18n/I18nManager";
import gameModeManager from "../core3d/behaviors/GameModeManager";
import puzzleCircleBuilder from "../core3d/builders/PuzzleCircleBuilder";
import openCoverAnimation from "../core3d/animations/OpenCoverAnimation";
import puzzleDataManager from "../core3d/misc/PuzzleDataManager";

class CalendarManager {
    public async start() {
        await puzzleCircleBuilder.build();

        puzzleCircleBuilder.refresh();

        openCoverAnimation.animate(puzzleCircleBuilder.selectedCover);

        const dailyData = await puzzleDataManager.loadTodaysPuzzle();
        const currentLanguage = i18nManager.getCurrentLanguage();
        const message = dailyData?.story?.[currentLanguage] || dailyData?.story?.["en"] || "No story available for today.";
        
        const title = this.getTitleForToday();
        
        popupHint.show(message, title, {}, {}, 0.9, ShaderMode.SHADOW_WINDOW, Control.VERTICAL_ALIGNMENT_CENTER,
            () => { gameModeManager.enterOpenCoverMode(true); },
            () => { gameModeManager.enterInitialMode(); },
            null, null, PopupMode.Calendar, null, dailyData?.horiz.imgCoverUrl);
    }

    private getTitleForToday(): string {
        // For now, always show "FOR TODAY" since we're showing today's puzzle
        return i18nManager.translate("calendar.forToday");
    }
}

const calendarManager = new CalendarManager();
export default calendarManager;

