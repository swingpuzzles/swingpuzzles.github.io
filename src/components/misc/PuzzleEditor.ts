import { Color3, DynamicTexture, Mesh, MeshBuilder, StandardMaterial, Vector3 } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import sceneInitializer from "../SceneInitializer";
import popupHint from "../../gui/PopupHint";

class PuzzleEditor {
    private _popupDynamicTexture?: DynamicTexture;
    private _popupCtx2d?: CanvasRenderingContext2D;

    private _bgImage?: HTMLImageElement;
    private _tableImage?: HTMLImageElement;
    private _fgImage?: HTMLImageElement;
    private _candleImage?: HTMLImageElement;
    private _labelImage?: HTMLImageElement;
    private _vertical!: boolean;

    private _fontFamily!: string;
    private _textColor!: string;
    private _wishText?: string;
    private _friendsName?: string;
    private _age!: number;

    init() {
        this._vertical = ctx.engine.getRenderHeight() > ctx.engine.getRenderWidth();
        this.createPopupPlane(this._vertical ? [10, 15] : [15, 10]);

        sceneInitializer.addResizeObserver((width, height) => {
            if (this._vertical != ctx.engine.getRenderHeight() > ctx.engine.getRenderWidth()) {
                this._vertical = !this._vertical;
                this.createPopupPlane(this._vertical ? [10, 15] : [15, 10]);
            }
        });

        const candleImage = new Image();
        candleImage.src = "assets/gift/candle.webp";
        candleImage.onload = () => {
            this._candleImage = candleImage;
        };

        //this.setImage("assets/gift/labels/label_1-small.webp", (img) => { this._labelImage = img; });
        this.setImage("assets/gift/labels/label_1.webp", (img) => { this._labelImage = img; }); // TODO
    }

    createPopupPlane(planeSize: [number, number]): void {
        const [planeWidth, planeHeight] = planeSize;

        // Create DynamicTexture matching aspect ratio
        const texSize = 1024; // adjust resolution
        this._popupDynamicTexture = new DynamicTexture("popupDynamicTexture", {
            width: texSize,
            height: texSize * (planeHeight / planeWidth)
        }, ctx.scene, false);

        this._popupCtx2d = this._popupDynamicTexture.getContext() as CanvasRenderingContext2D;

        this._drawPopupPlane();

    }

    updatePopupPlane(bgUrl: string, fgUrl: string): void {
        this.setPopupBackground(bgUrl);
        this.setPopupForeground(fgUrl);
    }

    private setImage(url: string, setField: (img: HTMLImageElement) => void) : void {
        const smallImage = new Image();
        smallImage.src = url;
        smallImage.onload = () => {
            setField(smallImage);
            this._drawPopupPlane();

            const fullImageUrl = url.replace("-small", "");
            const fullImage = new Image();
            fullImage.src = fullImageUrl;
            fullImage.onload = () => {
                setField(fullImage);
                this._drawPopupPlane();
            };
        };
    }

    setPopupBackground(bgUrl: string): void {
        this.setImage(bgUrl, (img) => { this._bgImage = img });
    }

    setTable(url: string): void {
        this.setImage(url, (img) => { this._tableImage = img });
    }

    setPopupForeground(fgUrl: string): void {
        this.setImage(fgUrl, (img) => { this._fgImage = img });
    }

    public setFormData(friendsName: string, age: number): void {
        this._friendsName = friendsName;
        this._age = age;
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
        if (!this._bgImage || !this._fgImage || !this._tableImage || !this._labelImage) return; // wait until all of them are loaded

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

        // draw TEXT on torte
        if (this._friendsName) {
            this.drawText(this._friendsName, 0.42 * planeHeight, 0.6, -0.1, planeWidth * 0.2, planeWidth * 0.04, 120);
        }

        // Draw LABEL (centered)
        const labelDrawWidth = planeWidth * 0.96;//this._fgImage.width;
        const labelDrawHeight = planeHeight * 0.8;
        const labelOffsetX = (planeWidth - labelDrawWidth) / 2;
        const labelOffsetY = -(planeHeight - labelDrawHeight) * 1.6;

        ctx2d.drawImage(this._labelImage, labelOffsetX, labelOffsetY, labelDrawWidth, labelDrawHeight);

        // draw TEXT on label
        if (this._wishText) {
            this.drawText(this._wishText, 0.1 * planeHeight, 0.6, 0.3, planeWidth * 0.4, planeWidth * 0.1, 300);
        }

        // draw CANDLES
        const centerX = planeWidth / 2;
        const centerY = 0.442 * planeHeight;

        let radiusX = planeWidth * 0.18;
        let radiusY = radiusX * 0.3;

        const sizeFactor = Math.pow(20 / this._age, 0.4);
        let baseCandleHeight = 60 * sizeFactor; // base size in pixels for center/front
        let baseCandleWidth = 20 * sizeFactor;

        if (this._age < 2) {
            radiusX = 0;
            radiusY = 0;
        } else if (this._age < 5) {
            radiusX /= 2;
            radiusY /= 2;
        }

        if (this._candleImage) {
            const candles: {
                x: number;
                y: number;
                width: number;
                height: number;
            }[] = [];

            const angleOffset = this._age > 2 ? (0.5 / this._age) * Math.PI : 0;
            for (let i = 0; i < this._age; i++) {
                const angle = (i / this._age) * Math.PI * 2 + angleOffset;

                let x = radiusX * Math.cos(angle);
                let y = Math.sin(angle);

                x *= Math.pow(1.04, y); 

                x += centerX;

                const scale = (6 + y) / 4;
                const candleWidth = baseCandleWidth * scale;
                const candleHeight = baseCandleHeight * scale;

                y = y * radiusY + centerY;

                candles.push({ x, y, width: candleWidth, height: candleHeight });
            }

            // Sort by y to simulate depth: farther candles first
            candles.sort((a, b) => a.y - b.y);

            ctx2d.globalAlpha = 0.7 + (0.2 / Math.pow(this._age, 0.2));
            for (const c of candles) {
                ctx2d.drawImage(
                    this._candleImage,
                    c.x - c.width / 2,
                    c.y - c.height,
                    c.width,
                    c.height
                );
            }
            ctx2d.globalAlpha = 1;
        }

        this._popupDynamicTexture.update();

        const dataUrl = ctx2d.canvas.toDataURL("image/png");
        popupHint.centerImgUrl = dataUrl;
    }

    private drawText(text: string, centerY: number, textViewAngle: number, angleFactor: number, radius: number, yAngleFactor: number, baseFontSize: number) {
        const planeWidth = this._popupDynamicTexture!.getSize().width;
        const ctx2d = this._popupCtx2d!;

        const centerX = planeWidth / 2;
        const textLengthFactor = text.length;
        const angleSpan = textViewAngle * (Math.PI - 4 / 3 * Math.PI / textLengthFactor); // 80% of full semicircle

        const minFontSize = 1;
        const maxFontSize = 1000;

        const fontSize = Math.max(minFontSize, Math.min(maxFontSize, baseFontSize / Math.pow(textLengthFactor, 0.7)));

        ctx2d.font = `bold ${fontSize}px ${this._fontFamily}`;
        ctx2d.fillStyle = this._textColor;
        ctx2d.textAlign = "center";
        ctx2d.textBaseline = "middle";

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const angle = text.length > 1 ? -angleSpan / 2 + (i / (text.length - 1)) * angleSpan : 0;

            // Cylindrical arc distortion: X and Y from angle
            const x = centerX + Math.sin(angle) * radius;
            const y = centerY + (1- Math.cos(angle)) * yAngleFactor; // simulate view from above (taller middle)

            // Simulate vertical skew/stretch for fake perspective
            const skew = Math.cos(angle); // smaller at sides
            const centerBoost = 1 + 0.3 * (1 - Math.abs(angle) / (angleSpan / 2)); // max at center
            const scaleX = (1 + 0.2 * (1 - Math.abs(skew))) * centerBoost; // slightly wider in center
            const scaleY = (1 - 0.3 * Math.abs(skew)) * centerBoost; // shorter at sides

            ctx2d.save();
            ctx2d.translate(x, y);
            ctx2d.rotate(angleFactor * angle);
            ctx2d.scale(scaleX, scaleY);
            ctx2d.fillText(char, 0, 0);
            ctx2d.restore();
        }
    }
}

const puzzleEditor = new PuzzleEditor();
export default puzzleEditor;
