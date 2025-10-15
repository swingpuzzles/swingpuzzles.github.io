import { Mesh } from "@babylonjs/core";
import backToInitialAnimation from "../core3d/animations/BackToInitialAnimation";
import gameModeManager from "../core3d/behaviors/GameModeManager";
import puzzleCircleBuilder from "../core3d/builders/PuzzleCircleBuilder";
import puzzleGameBuilder from "../core3d/builders/PuzzleGameBuilder";
import ctx from "../core3d/common/SceneContext";
import Constants, { Categories } from "../core3d/common/Constants";
import guiManager from "../gui/GuiManager";
import popupHint, { overPopup } from "../gui/popups/PopupHint";
import openCoverAnimation from "../core3d/animations/OpenCoverAnimation";
import specialModeManager from "./special-mode/SpecialModeManager";
import localStorageManager, { CommonStorageKeys, GiftStorageKeys } from "./LocalStorageManager";
import giftMaker from "../gui/GiftMaker";

class PuzzleUrlHelper {
    private static readonly DEFAULT_CATEGORY = Categories.General;
    private static readonly DEFAULT_CATEGORY_KEY = PuzzleUrlHelper.DEFAULT_CATEGORY.key;

    private _mode: string | null = null;
    private _puzzleId: string | null = null;
    private _coverMap: Map<string, Mesh> = new Map();

    constructor() {
        window.addEventListener("popstate", () => {
            popupHint.hide();
            overPopup.hide();

            this.handleUrlData();
        });
    }

    public get mode(): string | null {
        return this._mode;
    }

    public async handleUrlData(): Promise<void> {
        // Check if we're on a legal page - if so, don't process game URL data
        const path = window.location.pathname;
        if (path.includes('privacy-policy') || path.includes('terms-of-service') || path.includes('cookie-policy')) {
            return;
        }
        
        const urlData = this.readFromUrl();

        // Handle localStorage items from URL
        const localStorageItems = this.getLocalStorageItemsFromUrl();
        Object.entries(localStorageItems).forEach(([key, value]) => {
            localStorageManager.set(key, value);
        });

        if (urlData.specialMode) {
            specialModeManager.enterSpecialMode(urlData.specialMode);
        }

        if (urlData.giftData) {
            await this.processGiftData(urlData.giftData);
            puzzleGameBuilder.clear();
            this._mode = Constants.MODE_GIFT_RECEIVE;
        } else {
            let modeChanged: boolean = this._mode === Constants.MODE_GIFT_RECEIVE || this._mode === Constants.MODE_GIFT_CREATE;

            let puzzleSelected = false;
            let mode = urlData.mode || PuzzleUrlHelper.DEFAULT_CATEGORY_KEY;

            if (mode === Constants.MODE_GIFT_CREATE) {
                mode = PuzzleUrlHelper.DEFAULT_CATEGORY_KEY;
            }

            if (urlData.puzzleId) {
                if (mode === Constants.MODE_CALENDAR) {
                    await gameModeManager.enterCalendarMode(false, false);
                } else {
                    await guiManager.enterCategory(mode);
                }

                modeChanged ||= this.setMode(mode, false);

                const cover = this._coverMap.get(urlData.puzzleId);

                if (cover) {
                    puzzleSelected = true;

                    const changedPuzzle: boolean = this._puzzleId !== urlData.puzzleId;

                    if (!gameModeManager.initialMode) {
                        if (changedPuzzle) {
                            backToInitialAnimation.animate(ctx.currentCover, async () => {
                                if (modeChanged) {
                                    await puzzleCircleBuilder.build();
                                }

                                await openCoverAnimation.animateAsync(cover);
                            });
                        } else if (modeChanged) {
                            await puzzleCircleBuilder.build();
                        }
                    } else {
                        if (modeChanged) {
                            await puzzleCircleBuilder.build();
                        }

                        await openCoverAnimation.animateAsync(cover);
                    }
                }
            }
            
            if (!puzzleSelected) {
                if (mode === Constants.MODE_CALENDAR) {
                    await gameModeManager.enterCalendarMode(false, false);
                } else {
                    await guiManager.enterCategory(mode);
                }

                modeChanged ||= this.setMode(mode);

                if (gameModeManager.initialMode) {
                    if (modeChanged) {
                        puzzleGameBuilder.clear();

                        await puzzleCircleBuilder.build(true);
                    }
                } else if (ctx.currentCover != null) {
                    backToInitialAnimation.animate(ctx.currentCover);
                }
            }

            if (urlData.mode === Constants.MODE_GIFT_CREATE) {
                gameModeManager.enterGiftInitialMode();
            }
        }
    }

    public insertCoverEntry(imgUrl: string, cover: Mesh) {
        const puzzleId = this.extractPuzzleId(imgUrl);

        if (puzzleId) {
            this._coverMap.set(puzzleId, cover);
        }
    }

    public setMode(value: string, update = true): boolean {
        const changed = this._mode !== value;

        this._mode = value;
        this._puzzleId = null;

        if (update && changed) {
            this.updateUrl();
        }

        return changed;
    }

    public clearPuzzleId() {
        this._puzzleId = null;

        if (this._mode === Constants.MODE_GIFT_CREATE || this._mode === Constants.MODE_GIFT_RECEIVE) {
            this._mode = PuzzleUrlHelper.DEFAULT_CATEGORY_KEY;

            if (!ctx.category) {
                ctx.category = PuzzleUrlHelper.DEFAULT_CATEGORY;
            }
        }

        this.updateUrl();
    }

    public setImgUrl(value: string) {console.log(value);
        const puzzleId = this.extractPuzzleId(value);

        if (this._puzzleId === puzzleId) {
            return;
        }

        this._puzzleId = puzzleId;
        
        if (puzzleId) {
            this.updateUrl();
        }
    }

    public extractPuzzleId(imageUrl: string): string | null {
        const match = imageUrl.match(/\/I\/([^\/?._]+)[._]/);
        return match ? match[1] : null;
    }

    private updateUrl(): void {
        const params = new URLSearchParams();
        params.set('mode', this._mode!);

        if (this._puzzleId) {
            params.set('puzzleId', this._puzzleId);
        }

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        const currentUrl = `${window.location.pathname}${window.location.search}`;

        // Only push to history if different
        if (newUrl !== currentUrl) {
            window.history.pushState({}, '', newUrl);
        }
    }

    public readFromUrl(): { mode: string | null; puzzleId: string | null; giftData: string | null; specialMode: string | null } {
        const params = new URLSearchParams(window.location.search);
        return {
            mode: params.get('mode'),
            puzzleId: params.get('puzzleId'),
            giftData: params.get('giftData'),
            specialMode: params.get('specialMode')
        };
    }

    public getLocalStorageItemsFromUrl(): Record<string, any> {
        const params = new URLSearchParams(window.location.search);
        const localStorageItems: Record<string, any> = {};
        
        // Read CommonStorageKeys from URL
        Object.values(CommonStorageKeys).forEach(key => {
            const value = params.get(key);
            if (value !== null) {
                try {
                    localStorageItems[key] = JSON.parse(value);
                } catch (e) {
                    // If parsing fails, store as string
                    localStorageItems[key] = value;
                }
            }
        });
        
        // Read GiftStorageKeys from URL
        Object.values(GiftStorageKeys).forEach(key => {
            const value = params.get(key);
            if (value !== null) {
                try {
                    localStorageItems[key] = JSON.parse(value);
                } catch (e) {
                    // If parsing fails, store as string
                    localStorageItems[key] = value;
                }
            }
        });
        
        return localStorageItems;
    }

    public setLocalStorageItemsToUrl(items: Record<string, any>): void {
        const params = new URLSearchParams(window.location.search);
        
        // Add localStorage items to URL parameters
        Object.entries(items).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                params.set(key, JSON.stringify(value));
            }
        });
        
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        const currentUrl = `${window.location.pathname}${window.location.search}`;
        
        // Only push to history if different
        if (newUrl !== currentUrl) {
            window.history.pushState({}, '', newUrl);
        }
    }

    public getCurrentLocalStorageData(): Record<string, any> {
        const data: Record<string, any> = {};
        
        // Get CommonStorageKeys from localStorage
        Object.values(CommonStorageKeys).forEach(key => {
            const value = localStorageManager.get(key);
            if (value !== null) {
                data[key] = value;
            }
        });
        
        // Get GiftStorageKeys from localStorage
        Object.values(GiftStorageKeys).forEach(key => {
            const value = localStorageManager.get(key);
            if (value !== null) {
                data[key] = value;
            }
        });
        
        return data;
    }

    private decodeGiftDataFromUrlParam(encoded: string): Record<string, string> {
        try {
            const json = decodeURIComponent(atob(encoded));
            return JSON.parse(json);
        } catch (e) {
            console.warn("Failed to decode gift data:", e);
            return {};
        }
    }

    private async processGiftData(encodedGiftData: string) {
        const giftData = this.decodeGiftDataFromUrlParam(encodedGiftData);
        
        if (await giftMaker.parseUrlData(giftData)) {
            gameModeManager.enterGiftReceivedMode();
        }   
    }
}

const puzzleUrlHelper = new PuzzleUrlHelper();
export default puzzleUrlHelper;