import { Mesh } from "@babylonjs/core";
import backToInitialAnimation from "../core3d/animations/BackToInitialAnimation";
import gameModeManager from "../core3d/behaviors/GameModeManager";
import puzzleCircleBuilder from "../core3d/builders/PuzzleCircleBuilder";
import puzzleGameBuilder from "../core3d/builders/PuzzleGameBuilder";
import ctx, { Categories } from "../core3d/common/SceneContext";
import guiManager from "../gui/GuiManager";
import popupHint, { overPopup } from "../gui/PopupHint";
import urlDecoder from "./UrlDecoder";
import openCoverAnimation from "../core3d/animations/OpenCoverAnimation";

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

    public handleUrlData(): void {
        const urlData = this.readFromUrl();

        if (urlData.giftData) {
            urlDecoder.processGiftData(urlData.giftData);
            this._giftReceiving = true;
            puzzleGameBuilder.clear();
            this._category = Categories.Gift.key;
        } else {
            let changed: boolean = this._giftReceiving;
            this._giftReceiving = false;

            let puzzleSelected = false;
            if (urlData.category && urlData.puzzleId) {
                guiManager.enterCategory(urlData.category, false);
                changed ||= this.setCategory(urlData.category, false);

                const cover = this._coverMap.get(urlData.puzzleId);

                if (cover) {
                    puzzleSelected = true;

                    const changedPuzzle: boolean = ctx.currentCover === cover;

                    if (!gameModeManager.initialMode) {
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
            
            if (!puzzleSelected && urlData.category) {
                guiManager.enterCategory(urlData.category);
                changed ||= this.setCategory(urlData.category);

                if (gameModeManager.initialMode) {
                    if (changed) {
                        puzzleGameBuilder.clear();
                    }
                } else {
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

    private extractPuzzleId(imageUrl: string): string | null {
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

    public readFromUrl(): { category: string | null; puzzleId: string | null; giftData: string | null } {
        const params = new URLSearchParams(window.location.search);
        return {
            category: params.get('category'),
            puzzleId: params.get('puzzleId'),
            giftData: params.get('giftData')
        };
    }
}

const puzzleUrlHelper = new PuzzleUrlHelper();
export default puzzleUrlHelper;