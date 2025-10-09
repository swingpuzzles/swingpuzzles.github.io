import { IPopupMode } from "../IPopupMode";
import { NormalMode } from "./NormalMode";
import { PreSellMode } from "./PreSellMode";
import { SellMode } from "./SellMode";
import { GiftInitialMode } from "./GiftInitialMode";
import { GiftAdjustmentsPreviewMode } from "./GiftAdjustmentsPreviewMode";
import { GiftAdjustmentsOverviewMode } from "./GiftAdjustmentsOverviewMode";
import { GiftPhysicalInitialMode } from "./GiftPhysicalInitialMode";
import { GiftPhysicalFinalMode } from "./GiftPhysicalFinalMode";
import { GamePausedMode } from "./GamePausedMode";
import { CalendarMode } from "./CalendarMode";

/**
 * Factory for creating popup mode instances
 */
export class PopupMode {
    static Normal = new NormalMode();
    static PreSell = new PreSellMode();
    static Sell = new SellMode();
    static GiftInitial = new GiftInitialMode();
    static GiftAdjustmentsPreview = new GiftAdjustmentsPreviewMode();
    static GiftAdjustmentsOverview = new GiftAdjustmentsOverviewMode();
    static GiftPhysicalInitial = new GiftPhysicalInitialMode();
    static GiftPhysicalFinal = new GiftPhysicalFinalMode();
    static GamePaused = new GamePausedMode();
    static Calendar = new CalendarMode();
}

