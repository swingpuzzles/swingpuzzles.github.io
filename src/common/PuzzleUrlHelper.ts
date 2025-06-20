import guiManager from "../gui/GuiManager";

class PuzzleUrlHelper {
    private _category: string | null = null;

    constructor() {
        window.addEventListener("popstate", () => {
            const urlData = this.readFromUrl();

            if (urlData.category) {
                guiManager.enterCategory(urlData.category);
                this.setCategory(urlData.category);
            }

            //this.updateUrl(urlData.puzzleId);
        });
    }

    public setCategory(value: string, update = false) {
        this._category = value;

        if (update) {
            this.updateUrl();
        }
    }

    public setImgUrl(value: string) {
        const puzzleId = this.extractPuzzleId(value);

        if (puzzleId) {
            this.updateUrl(puzzleId);
        }
    }

    private extractPuzzleId(imageUrl: string): string | null {
        const match = imageUrl.match(/\/I\/([^\/?._]+)[._]/);
        return match ? match[1] : null;
    }

    private updateUrl(puzzleId: string | null = null): void {
        const params = new URLSearchParams();
        params.set('category', this._category!);

        if (puzzleId) {
            params.set('puzzleId', puzzleId);
        }

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newUrl);
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