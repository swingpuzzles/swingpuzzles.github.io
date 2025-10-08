import { Control } from "@babylonjs/gui";
import popupHint, { PopupMode } from "./PopupHint";
import { ShaderMode } from "./ScreenShader";
import i18nManager from "../common/i18n/I18nManager";

interface DailyData {
    horiz: {
        link: string;
        imgSmallUrl: string;
        imgBigUrl: string;
        imgCoverUrl: string;
    };
    vert: {
        link: string;
        imgSmallUrl: string;
        imgBigUrl: string;
        imgCoverUrl: string;
    };
    story: Record<string, string>;
}

class CalendarManager {
    public async start() {
        const dailyData = await this.loadDailyData();
        const currentLanguage = i18nManager.getCurrentLanguage();
        const message = dailyData?.story?.[currentLanguage] || dailyData?.story?.["en"] || "No story available for today.";
        
        const title = this.getTitleForToday();
        
        popupHint.show(message, title, {}, {}, 0.95, ShaderMode.SHADOW_WINDOW, Control.VERTICAL_ALIGNMENT_BOTTOM,
            () => { /* TODO */ }, () => { /* TODO */ }, null, null, PopupMode.Sell, null, dailyData?.horiz.imgCoverUrl);
    }

    private async loadDailyData(): Promise<DailyData | null> {
        try {
            const dateString = this.getDateString(new Date());
            const response = await fetch(`/assets/data/daily/${dateString}.json`);
            
            if (!response.ok) {
                console.warn(`No daily data found for ${dateString}`);
                return null;
            }
            
            return await response.json();
        } catch (error) {
            console.error("Failed to load daily data:", error);
            return null;
        }
    }

    private getDateString(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }

    private getTitleForToday(): string {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const todayString = this.getDateString(today);
        const yesterdayString = this.getDateString(yesterday);
        
        // Check if we're looking at today's puzzle
        const currentDate = new Date(); // In a real scenario, this might come from the loaded data
        const currentDateString = this.getDateString(currentDate);
        
        if (currentDateString === todayString) {
            return i18nManager.translate("calendar.forToday");
        } else if (currentDateString === yesterdayString) {
            return i18nManager.translate("calendar.forYesterday");
        } else {
            const formattedDate = i18nManager.formatDate(currentDate);
            return i18nManager.translate("calendar.forDate", { date: formattedDate });
        }
    }
}

const calendarManager = new CalendarManager();
export default calendarManager;

