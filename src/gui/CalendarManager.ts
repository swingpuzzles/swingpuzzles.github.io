import { Control } from "@babylonjs/gui";
import popupHint from "./popups/PopupHint";
import { PopupMode } from "./popups/modes/PopupMode";
import { ShaderMode } from "./ScreenShader";
import i18nManager from "../common/i18n/I18nManager";
import gameModeManager, { MainMode, SubMode } from "../core3d/behaviors/GameModeManager";
import puzzleCircleBuilder from "../core3d/builders/PuzzleCircleBuilder";
import openCoverAnimation from "../core3d/animations/OpenCoverAnimation";
import puzzleDataManager from "../core3d/misc/PuzzleDataManager";
import Constants, { Categories } from "../core3d/common/Constants";
import localStorageManager, { CommonStorageKeys } from "../common/LocalStorageManager";
import ctx from "../core3d/common/SceneContext";
import puzzleUrlHelper from "../common/PuzzleUrlHelper";
import analyticsManager from "../common/AnalyticsManager";
import { Mesh } from "@babylonjs/core";

class CalendarManager {
    public async start(openCover: boolean) {        
        // Track calendar session start
        analyticsManager.startGameSession(MainMode.Initial, SubMode.Calendar, ctx.category?.key);

        localStorageManager.set(CommonStorageKeys.Mode, Constants.MODE_CALENDAR);
        
        if (puzzleUrlHelper.setMode(Constants.MODE_CALENDAR)) {
            await puzzleCircleBuilder.build();

            puzzleCircleBuilder.refresh();
        }

        if (openCover) {
            await openCoverAnimation.animateAsync(puzzleCircleBuilder.selectedCover);
        }
    }

    public async handleOpenCover(cover: Mesh) {
        if (gameModeManager.calendarMode) {
            const dailyData = puzzleCircleBuilder.getCoverData(cover);

            let headingParams = {};
            let headingKey = "calendar.forToday";

            if (dailyData?.date) {
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                
                const isToday = this.isSameDay(dailyData.date, today);
                const isYesterday = this.isSameDay(dailyData.date, yesterday);
                
                if (isToday) {
                    headingKey = "calendar.forToday";
                    headingParams = {};
                } else if (isYesterday) {
                    headingKey = "calendar.forYesterday";
                    headingParams = {};
                } else {
                    headingKey = "calendar.forDate";
                    headingParams = { date: this.formatDate(dailyData.date) };
                }
            }

            popupHint.show(dailyData?.story!, headingKey, {}, headingParams, 0.9, ShaderMode.SHADOW_FULL/*ShaderMode.SHADOW_WINDOW*/, Control.VERTICAL_ALIGNMENT_CENTER,
                () => { gameModeManager.enterOpenCoverMode(true); },
                () => { gameModeManager.enterOpenCoverMode(true); },
                null, null, PopupMode.Calendar, null, dailyData?.imgCoverUrl);
        }
    }

    private isSameDay(date1: Date, date2: Date): boolean {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    private formatDate(date: Date): string {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(i18nManager.getCurrentLanguage(), options).toUpperCase();
    }
}

const calendarManager = new CalendarManager();
export default calendarManager;

