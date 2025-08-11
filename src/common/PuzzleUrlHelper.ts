import backToInitialAnimation from "../core3d/animations/BackToInitialAnimation";
import gameModeManager from "../core3d/behaviors/GameModeManager";
import ctx from "../core3d/common/SceneContext";
import guiManager from "../gui/GuiManager";
import popupHint, { overPopup } from "../gui/PopupHint";

class PuzzleUrlHelper {
    private _category: string | null = null;
    private _puzzleId: string | null = null;
    private _angleMap: Map<string, number> = new Map();

    constructor() {
        window.addEventListener("popstate", () => {
            popupHint.hide();
            overPopup.hide();

            const urlData = this.readFromUrl();

            if (urlData.category) {
                guiManager.enterCategory(urlData.category);
                this.setCategory(urlData.category);
            }

            if (urlData.puzzleId) {
                const angle = this._angleMap.get(urlData.puzzleId);

                if (angle) {
                    if (!gameModeManager.initialMode) {
                        if (ctx.originalCameraState) {
                            ctx.originalCameraState.alpha = angle;
                        }

                        backToInitialAnimation.animate(ctx.currentCover);
                    } else {
                        ctx.camera.alpha = angle;
                    }
                }
            }
        });
    }

    public insertAngleEntry(imgUrl: string, angle: number) {
        const puzzleId = this.extractPuzzleId(imgUrl);

        if (puzzleId) {
            this._angleMap.set(puzzleId, angle);
        }
    }

    public setCategory(value: string/*, update = false*/) {
        if (this._category === value) {
            return;
        }

        this._category = value;
        this._puzzleId = null;

        //if (update) {
            this.updateUrl();
        //}
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

    public readFromUrl(): { category: string | null; puzzleId: string | null } {
        const params = new URLSearchParams(window.location.search);
        return {
            category: params.get('category'),
            puzzleId: params.get('puzzleId')
        };
    }
}

const puzzleUrlHelper = new PuzzleUrlHelper();
export default puzzleUrlHelper;