import { Color3, DynamicTexture, Mesh, MeshBuilder, StandardMaterial, Vector3 } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import gameModeManager, { GameMode } from "../behaviors/GameModeManager";

class PuzzleEditor {
    private _popupPlane!: Mesh;
    private _popupDynamicTexture?: DynamicTexture;
    private _popupCtx2d?: CanvasRenderingContext2D;

    private _bgImage?: HTMLImageElement;
    private _fgImage?: HTMLImageElement;

    init() {
        this.createPopupPlane([30, 20]);

        gameModeManager.addGameModeChangedObserver(() => {
            //this._popupPlane.isVisible = gameModeManager.currentMode === GameMode.GiftAdjustment;
        });
    }

    createPopupPlane(planeSize: [number, number]): Mesh {
        const [planeWidth, planeHeight] = planeSize;

        // If already exists, dispose
        if (this._popupPlane) {
            this._popupPlane.dispose();
            this._popupDynamicTexture?.dispose();
        }

        // Create the plane
        this._popupPlane = MeshBuilder.CreatePlane("popupPlane", { width: planeWidth, height: planeHeight }, ctx.scene);

        // Create DynamicTexture matching aspect ratio
        const texSize = 1024; // adjust resolution
        this._popupDynamicTexture = new DynamicTexture("popupDynamicTexture", {
            width: texSize,
            height: texSize * (planeHeight / planeWidth)
        }, ctx.scene, false);

        this._popupCtx2d = this._popupDynamicTexture.getContext() as CanvasRenderingContext2D;

        // Apply material
        const mat = new StandardMaterial("popupMat", ctx.scene);
        mat.diffuseTexture = this._popupDynamicTexture;
        mat.emissiveColor = new Color3(1, 1, 1);
        this._popupPlane.material = mat;

        // Position in front of camera
        const distance = 25;
        const forward = ctx.camera.getForwardRay().direction;
        //forward.y = 0;//-forward.y;
        this._popupPlane.position = ctx.camera.position.add(forward.scale(distance));

        // Make plane face camera
        //this._popupPlane.rotation = new Vector3(1, 2, 3);
        this._popupPlane.lookAt(ctx.camera.position, Math.PI, 3.8 * Math.PI / 32);
        //this._popupPlane.rotation.y += Math.PI;
        //this._popupPlane.rotation.z = 0;*/
        //this._popupPlane.isVisible = false;

        //MeshBuilder.CreateBox("xxx").position = this._popupPlane.position;


        //console.log(forward);

        return this._popupPlane;
    }

    updatePopupPlane(bgUrl: string, fgUrl: string): void {
        this.setPopupBackground(bgUrl);
        this.setPopupForeground(fgUrl);
    }

    setPopupBackground(bgUrl: string): void {
        if (!this._popupPlane || !this._popupDynamicTexture || !this._popupCtx2d) {
            console.warn("Popup plane not created. Call createPopupPlane() first.");
            return;
        }

        const bgImage = new Image();
        bgImage.src = bgUrl;
        bgImage.onload = () => {
            this._bgImage = bgImage;
            this._drawPopupPlane();

            const fullImageUrl = bgUrl.replace("-small", "");
            const fullImage = new Image();
            fullImage.src = fullImageUrl;
            fullImage.onload = () => {
                this._bgImage = fullImage;
                this._drawPopupPlane();
            };
        };
    }

    setPopupForeground(fgUrl: string): void {
        if (!this._popupPlane || !this._popupDynamicTexture || !this._popupCtx2d) {
            console.warn("Popup plane not created. Call createPopupPlane() first.");
            return;
        }

        const fgImage = new Image();
        fgImage.src = fgUrl;
        fgImage.onload = () => {
            this._fgImage = fgImage;
            this._drawPopupPlane();

            const fullImageUrl = fgUrl.replace("-small", "");
            const fullImage = new Image();
            fullImage.src = fullImageUrl;
            fullImage.onload = () => {
                this._fgImage = fullImage;
                this._drawPopupPlane();
            };
        };
    }

    private _drawPopupPlane(): void {
        if (!this._popupDynamicTexture || !this._popupCtx2d) return;
        if (!this._bgImage || !this._fgImage) return; // wait until both are loaded

        const planeWidth = this._popupDynamicTexture.getSize().width;
        const planeHeight = this._popupDynamicTexture.getSize().height;
        const ctx2d = this._popupCtx2d;

        // Clear
        ctx2d.clearRect(0, 0, planeWidth, planeHeight);

        // Draw BACKGROUND (cover-fit)
        const bgAspect = this._bgImage.width / this._bgImage.height;
        const canvasAspect = planeWidth / planeHeight;

        let bgDrawWidth: number, bgDrawHeight: number, bgOffsetX: number, bgOffsetY: number;

        if (canvasAspect < bgAspect) {
            bgDrawHeight = planeHeight;
            bgDrawWidth = this._bgImage.width * (planeHeight / this._bgImage.height);
            bgOffsetX = (planeWidth - bgDrawWidth) / 2;
            bgOffsetY = 0;
        } else {
            bgDrawWidth = planeWidth;
            bgDrawHeight = this._bgImage.height * (planeWidth / this._bgImage.width);
            bgOffsetX = 0;
            bgOffsetY = (planeHeight - bgDrawHeight) / 2;
        }

        ctx2d.drawImage(this._bgImage, bgOffsetX, bgOffsetY, bgDrawWidth, bgDrawHeight);

        // Draw FOREGROUND (centered)
        const fgDrawWidth = Math.min(planeWidth, planeHeight);//this._fgImage.width;
        const fgDrawHeight = fgDrawWidth * this._fgImage.height / this._fgImage.width;
        const fgOffsetX = (planeWidth - fgDrawWidth) / 2;
        const fgOffsetY = (planeHeight - fgDrawHeight) / 1.2;

        ctx2d.drawImage(this._fgImage, fgOffsetX, fgOffsetY, fgDrawWidth, fgDrawHeight);

        this._popupDynamicTexture.update();
    }

    /* Optionally: you can still keep disposePopupPlane() if you want */
    disposePopupPlane(): void {
        this._popupPlane?.dispose();
        this._popupDynamicTexture?.dispose();

        this._popupPlane = undefined!;
        this._popupDynamicTexture = undefined;
        this._popupCtx2d = undefined;
        this._bgImage = undefined;
        this._fgImage = undefined;
    }
}

const puzzleEditor = new PuzzleEditor();
export default puzzleEditor;
