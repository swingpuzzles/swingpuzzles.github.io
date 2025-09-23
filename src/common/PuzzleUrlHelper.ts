import { Mesh } from "@babylonjs/core";
import backToInitialAnimation from "../core3d/animations/BackToInitialAnimation";
import gameModeManager from "../core3d/behaviors/GameModeManager";
import puzzleCircleBuilder from "../core3d/builders/PuzzleCircleBuilder";
import puzzleGameBuilder from "../core3d/builders/PuzzleGameBuilder";
import ctx from "../core3d/common/SceneContext";
import { Categories } from "../core3d/common/Constants";
import guiManager from "../gui/GuiManager";
import popupHint, { overPopup } from "../gui/PopupHint";
import openCoverAnimation from "../core3d/animations/OpenCoverAnimation";
import specialModeManager from "./special-mode/SpecialModeManager";
import localStorageManager, { CommonStorageKeys, GiftStorageKeys } from "./LocalStorageManager";
import giftMaker from "../gui/GiftMaker";

class PuzzleUrlHelper {
    private _category: string | null = null;
    private _puzzleId: string | null = null;
    private _coverMap: Map<string, Mesh> = new Map();
    private _giftReceiving: boolean = false;

    constructor() {
        window.addEventListener("popstate", () => {
            popupHint.hide();
            overPopup.hide();

            this.handleUrlData();
        });
    }

    public get category(): string | null {
        return this._category;
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
            this._giftReceiving = true;
            puzzleGameBuilder.clear();
            this._category = Categories.Gift.key;
        } else {
            let changed: boolean = this._giftReceiving;
            this._giftReceiving = false;

            let puzzleSelected = false;
            let category: string = urlData.category || Categories.General.key;

            if (urlData.puzzleId) {
                guiManager.enterCategory(category, false);
                changed ||= this.setCategory(category, false);

                const cover = this._coverMap.get(urlData.puzzleId);

                if (cover) {
                    puzzleSelected = true;

                    const changedPuzzle: boolean = this._puzzleId !== urlData.puzzleId;

                    if (!gameModeManager.initialMode) {console.trace(changedPuzzle);
                        if (changedPuzzle) {
                            backToInitialAnimation.animate(ctx.currentCover, () => {
                                if (changed) {
                                    puzzleCircleBuilder.build();
                                }

                                openCoverAnimation.animate(cover);
                            });
                        } else if (changed) {
                            puzzleCircleBuilder.build();
                        }
                    } else {
                        if (changed) {
                            puzzleCircleBuilder.build();
                        }

                        openCoverAnimation.animate(cover);
                    }
                }
            }
            
            if (!puzzleSelected) {
                guiManager.enterCategory(category);
                changed ||= this.setCategory(category);

                if (gameModeManager.initialMode) {
                    if (changed) {
                        puzzleGameBuilder.clear();
                    }
                } else if (ctx.currentCover != null) {
                    backToInitialAnimation.animate(ctx.currentCover);
                }
            }
        }
    }

    public insertCoverEntry(imgUrl: string, cover: Mesh) {
        const puzzleId = this.extractPuzzleId(imgUrl);

        if (puzzleId) {
            this._coverMap.set(puzzleId, cover);
        }
    }

    public setCategory(value: string, update = true): boolean {
        const changed = this._category === value;

        this._category = value;
        this._puzzleId = null;

        if (update) {
            this.updateUrl();
        }

        return changed;
    }

    public clearPuzzleId() {
        this._puzzleId = null;

        this.updateUrl();
    }

    public setImgUrl(value: string) {
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
        params.set('category', this._category!);

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

    public readFromUrl(): { category: string | null; puzzleId: string | null; giftData: string | null; specialMode: string | null } {
        const params = new URLSearchParams(window.location.search);
        return {
            category: params.get('category'),
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