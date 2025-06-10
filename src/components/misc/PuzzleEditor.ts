import { Color3, DynamicTexture, Mesh, MeshBuilder, StandardMaterial, Vector3 } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import gameModeManager, { GameMode } from "../behaviors/GameModeManager";
import sceneInitializer from "../SceneInitializer";

class PuzzleEditor {
    private _popupPlane!: Mesh;
    private _popupDynamicTexture?: DynamicTexture;
    private _popupCtx2d?: CanvasRenderingContext2D;

    private _bgImage?: HTMLImageElement;
    private _tableImage?: HTMLImageElement;
    private _fgImage?: HTMLImageElement;
    private _vertical!: boolean;

    private _fontFamily!: string;
    private _textColor!: string;
    private _wishText!: string;
    private _friendsName!: string;
    private _age!: number;
    private _lang!: string;

    init() {
        this._vertical = ctx.engine.getRenderHeight() > ctx.engine.getRenderWidth();
        this.createPopupPlane(this._vertical ? [10, 15] : [15, 10]);

        gameModeManager.addGameModeChangedObserver(() => {
            this._popupPlane.isVisible = gameModeManager.currentMode === GameMode.GiftAdjustment;
        });

        sceneInitializer.addResizeObserver((width, height) => {
            if (this._vertical != ctx.engine.getRenderHeight() > ctx.engine.getRenderWidth()) {
                this._vertical = !this._vertical;
                this.createPopupPlane(this._vertical ? [10, 15] : [15, 10]);
            }
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

        this.movePopupPlane();
        this._drawPopupPlane();

        return this._popupPlane;
    }

    movePopupPlane() { 
        // Position in front of camera
        const distance = 20;
        const forward = ctx.camera.getForwardRay().direction;
        //forward.y = 0;//-forward.y;
        this._popupPlane.position = ctx.camera.position.add(forward.scale(distance));

        // Make plane face camera
        //this._popupPlane.rotation = new Vector3(1, 2, 3);
        this._popupPlane.lookAt(ctx.camera.position, Math.PI/*, 3.8 * Math.PI / 32*/);
        this._popupPlane.rotation.x = -Math.asin(forward.y);
        //this._popupPlane.rotation.y += Math.PI;
        //this._popupPlane.rotation.z = 0;*/
        //this._popupPlane.isVisible = false;

        //MeshBuilder.CreateBox("xxx").position = this._popupPlane.position;


        //console.log(forward);
    }

    updatePopupPlane(bgUrl: string, fgUrl: string): void {
        this.setPopupBackground(bgUrl);
        this.setPopupForeground(fgUrl);
    }

    setPopupBackground(bgUrl: string): void {
        /*if (!this._popupPlane || !this._popupDynamicTexture || !this._popupCtx2d) {
            console.warn("Popup plane not created. Call createPopupPlane() first.");
            return;
        }*/

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

    setTable(url: string): void {
        const image = new Image();
        image.src = url;
        image.onload = () => {
            this._tableImage = image;
            this._drawPopupPlane();

            const fullImageUrl = url.replace("-small", "");
            const fullImage = new Image();
            fullImage.src = fullImageUrl;
            fullImage.onload = () => {
                this._tableImage = fullImage;
                this._drawPopupPlane();
            };
        };
    }

    setPopupForeground(fgUrl: string): void {
        /*if (!this._popupPlane || !this._popupDynamicTexture || !this._popupCtx2d) {
            console.warn("Popup plane not created. Call createPopupPlane() first.");
            return;
        }*/

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

    public setFormData(friendsName: string, age: number, lang: string): void {
        this._friendsName = friendsName;
        this._age = age;
        this._lang = lang;
        this._drawPopupPlane();
    }

    public setTextColor(textColor: Color3) {
        this._textColor = textColor.toHexString();
        this._drawPopupPlane();
    }

    public setFontFamily(fontFamily: string) {
        this._fontFamily = fontFamily;
        this._drawPopupPlane();
    }

    public setWishText(wishText: string) {
        this._wishText = wishText;
        this._drawPopupPlane();
    }

    private _drawPopupPlane(): void {
        if (!this._popupDynamicTexture || !this._popupCtx2d) return;
        if (!this._bgImage || !this._fgImage || !this._tableImage) return; // wait until all of them are loaded

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
            bgOffsetY = (planeHeight - bgDrawHeight) / 1;
        }

        ctx2d.drawImage(this._bgImage, bgOffsetX, bgOffsetY, bgDrawWidth, bgDrawHeight);

        // Draw FOREGROUND (centered)
        const tableDrawWidth = Math.min(planeWidth, planeHeight) * 1.2;//this._fgImage.width;
        const tableDrawHeight = tableDrawWidth * this._fgImage.height / this._fgImage.width;
        const tableOffsetX = (planeWidth - tableDrawWidth) / 2;
        const tableOffsetY = (planeHeight - tableDrawHeight) / 0.21;

        ctx2d.drawImage(this._tableImage, tableOffsetX, tableOffsetY, tableDrawWidth, tableDrawHeight);

        // Draw FOREGROUND (centered)
        const fgDrawWidth = Math.min(planeWidth, planeHeight) * 0.8;//this._fgImage.width;
        const fgDrawHeight = fgDrawWidth * this._fgImage.height / this._fgImage.width;
        const fgOffsetX = (planeWidth - fgDrawWidth) / 2;
        const fgOffsetY = (planeHeight - fgDrawHeight) / 1.2;

        ctx2d.drawImage(this._fgImage, fgOffsetX, fgOffsetY, fgDrawWidth, fgDrawHeight);

        // draw on torte
        const centerX = planeWidth / 2;
        const centerY = 0.41 * planeHeight;
        const radius = 220;
        const text = this._friendsName;
        const textLengthFactor = text.length;
        const angleSpan = Math.PI * 0.6 - 0.8 * Math.PI / textLengthFactor; // 80% of full semicircle

        const baseFontSize = 100;
        const minFontSize = 1;
        const maxFontSize = 1000;

        const fontSize = Math.max(minFontSize, Math.min(maxFontSize, baseFontSize / Math.pow(textLengthFactor, 0.5)));

        ctx2d.font = `${fontSize}px ${this._fontFamily}`;
        ctx2d.fillStyle = this._textColor;
        ctx2d.textAlign = "center";
        ctx2d.textBaseline = "middle";

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const angle = text.length > 1 ? -angleSpan / 2 + (i / (text.length - 1)) * angleSpan : 0;

            // Cylindrical arc distortion: X and Y from angle
            const x = centerX + Math.sin(angle) * radius;
            const y = centerY + Math.cos(angle) * 40; // simulate view from above (taller middle)

            // Simulate vertical skew/stretch for fake perspective
            const skew = Math.cos(angle); // smaller at sides
            const centerBoost = 1 + 0.3 * (1 - Math.abs(angle) / (angleSpan / 2)); // max at center
            const scaleX = (1 + 0.2 * (1 - Math.abs(skew))) * centerBoost; // slightly wider in center
            const scaleY = (1 - 0.3 * Math.abs(skew)) * centerBoost; // shorter at sides

            ctx2d.save();
            ctx2d.translate(x, y);
            ctx2d.rotate(-angle / 2);
            ctx2d.scale(scaleX, scaleY);
            ctx2d.fillText(char, 0, 0);
            ctx2d.restore();
        }

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
