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
    constructor() {
        this._category = null;
        this._puzzleId = null;
        this._coverMap = new Map();
        this._giftReceiving = false;
        window.addEventListener("popstate", () => {
            popupHint.hide();
            overPopup.hide();
            this.handleUrlData();
        });
    }
    handleUrlData() {
        // Check if we're on a legal page - if so, don't process game URL data
        const path = window.location.pathname;
        if (path.includes('privacy-policy') || path.includes('terms-of-service') || path.includes('cookie-policy')) {
            return;
        }
        const urlData = this.readFromUrl();
        if (urlData.giftData) {
            urlDecoder.processGiftData(urlData.giftData);
            this._giftReceiving = true;
            puzzleGameBuilder.clear();
            this._category = Categories.Gift.key;
        }
        else {
            let changed = this._giftReceiving;
            this._giftReceiving = false;
            let puzzleSelected = false;
            let category = urlData.category || Categories.General.key;
            if (urlData.puzzleId) {
                guiManager.enterCategory(category, false);
                changed || (changed = this.setCategory(category, false));
                const cover = this._coverMap.get(urlData.puzzleId);
                if (cover) {
                    puzzleSelected = true;
                    const changedPuzzle = this._puzzleId !== urlData.puzzleId;
                    if (!gameModeManager.initialMode) {
                        console.trace(changedPuzzle);
                        if (changedPuzzle) {
                            backToInitialAnimation.animate(ctx.currentCover, () => {
                                if (changed) {
                                    puzzleCircleBuilder.build();
                                }
                                openCoverAnimation.animate(cover);
                            });
                        }
                        else if (changed) {
                            puzzleCircleBuilder.build();
                        }
                    }
                    else {
                        if (changed) {
                            puzzleCircleBuilder.build();
                        }
                        openCoverAnimation.animate(cover);
                    }
                }
            }
            if (!puzzleSelected) {
                guiManager.enterCategory(category);
                changed || (changed = this.setCategory(category));
                if (gameModeManager.initialMode) {
                    if (changed) {
                        puzzleGameBuilder.clear();
                    }
                }
                else if (ctx.currentCover != null) {
                    backToInitialAnimation.animate(ctx.currentCover);
                }
            }
        }
    }
    insertCoverEntry(imgUrl, cover) {
        const puzzleId = this.extractPuzzleId(imgUrl);
        if (puzzleId) {
            this._coverMap.set(puzzleId, cover);
        }
    }
    setCategory(value, update = true) {
        const changed = this._category === value;
        this._category = value;
        this._puzzleId = null;
        if (update) {
            this.updateUrl();
        }
        return changed;
    }
    clearPuzzleId() {
        this._puzzleId = null;
        this.updateUrl();
    }
    setImgUrl(value) {
        const puzzleId = this.extractPuzzleId(value);
        if (this._puzzleId === puzzleId) {
            return;
        }
        this._puzzleId = puzzleId;
        if (puzzleId) {
            this.updateUrl();
        }
    }
    extractPuzzleId(imageUrl) {
        const match = imageUrl.match(/\/I\/([^\/?._]+)[._]/);
        return match ? match[1] : null;
    }
    updateUrl() {
        const params = new URLSearchParams();
        params.set('category', this._category);
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
    readFromUrl() {
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
