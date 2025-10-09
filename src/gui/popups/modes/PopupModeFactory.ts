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

// Import PopupMode enum from PopupHint
import { PopupMode } from "../PopupHint";

/**
 * Factory for creating popup mode instances
 */
export class PopupModeFactory {
    private static instances: Map<PopupMode, IPopupMode> = new Map([
        [PopupMode.Normal, new NormalMode()],
        [PopupMode.PreSell, new PreSellMode()],
        [PopupMode.Sell, new SellMode()],
        [PopupMode.Gift_Initial, new GiftInitialMode()],
        [PopupMode.Gift_Adjustments_Preview, new GiftAdjustmentsPreviewMode()],
        [PopupMode.Gift_Adjustments_Overview, new GiftAdjustmentsOverviewMode()],
        [PopupMode.Gift_Physical_Initial, new GiftPhysicalInitialMode()],
        [PopupMode.Gift_Physical_Final, new GiftPhysicalFinalMode()],
        [PopupMode.GamePaused, new GamePausedMode()],
    ]);

    /**
     * Get popup mode instance for the given mode
     * @param mode The popup mode enum value
     * @returns The popup mode instance
     */
    public static getMode(mode: PopupMode): IPopupMode {
        const instance = this.instances.get(mode);
        if (!instance) {
            throw new Error(`Unknown popup mode: ${mode}`);
        }
        return instance;
    }
}

