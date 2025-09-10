import { DynamicTexture } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import sceneInitializer from "../SceneInitializer";
import popupHint from "../../gui/PopupHint";
class PuzzleEditor {
    init() {
        this._vertical = ctx.engine.getRenderHeight() > ctx.engine.getRenderWidth();
        this.createPopupPlane(this._vertical ? [10, 15] : [15, 10]);
        sceneInitializer.addResizeObserver((width, height) => {
            this.resize();
        });
        const candleImage = new Image();
        candleImage.src = "assets/gift/candle.webp";
        candleImage.onload = () => {
            this._candleImage = candleImage;
        };
        //this.setImage("assets/gift/labels/label_1-small.webp", (img) => { this._labelImage = img; });
        this.setImage("assets/gift/labels/label_1.webp", (img) => { this._labelImage = img; }); // TODO
    }
    get dataUrl() {
        return this._popupCtx2d.canvas.toDataURL("image/png");
        ;
    }
    resize() {
        const vertical = popupHint.isManualOrientation() ? popupHint.vertical : ctx.engine.getRenderHeight() > ctx.engine.getRenderWidth();
        if (this._vertical != vertical) {
            this._vertical = vertical;
            this.createPopupPlane(this._vertical ? [10, 15] : [15, 10]);
        }
    }
    createPopupPlane(planeSize) {
        const [planeWidth, planeHeight] = planeSize;
        // Create DynamicTexture matching aspect ratio
        const texSize = 1024; // adjust resolution
        this._popupDynamicTexture = new DynamicTexture("popupDynamicTexture", {
            width: texSize,
            height: texSize * (planeHeight / planeWidth)
        }, ctx.scene, false);
        this._popupCtx2d = this._popupDynamicTexture.getContext();
        this._drawPopupPlane();
    }
    setImage(url, setField) {
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
    setBackgroundImage(bgUrl) {
        this.setImage(bgUrl, (img) => { this._bgImage = img; });
    }
    setTable(url, index) {
        this.setImage(url, (img) => { this._tableImage = img; });
    }
    setTorte(fgUrl, index) {
        this.setImage(fgUrl, (img) => { this._fgImage = img; });
        this._torteIndex = index;
    }
    setFormData(friendsName, age) {
        this._friendsName = friendsName;
        this._age = age;
        this._drawPopupPlane();
    }
    setTextColor(textColor) {
        this._textColor = textColor.toHexString();
        this._drawPopupPlane();
    }
    setFontFamily(fontFamily) {
        this._fontFamily = fontFamily;
        this._drawPopupPlane();
    }
    setWishText(wishText) {
        this._wishText = wishText;
        this._drawPopupPlane();
    }
    _drawPopupPlane() {
        if (!this._popupDynamicTexture || !this._popupCtx2d)
            return;
        if (!this._bgImage || !this._fgImage || !this._tableImage || !this._labelImage)
            return; // wait until all of them are loaded
        const planeWidth = this._popupDynamicTexture.getSize().width;
        const planeHeight = this._popupDynamicTexture.getSize().height;
        const ctx2d = this._popupCtx2d;
        // Clear
        ctx2d.clearRect(0, 0, planeWidth, planeHeight);
        const bigCoor = Math.max(planeWidth, planeHeight);
        const smallCoor = Math.min(planeWidth, planeHeight);
        // Draw BACKGROUND (cover-fit)
        const bgAspect = this._bgImage.width / this._bgImage.height;
        const canvasAspect = planeWidth / planeHeight;
        let bgDrawWidth, bgDrawHeight, bgOffsetX, bgOffsetY;
        if (canvasAspect < bgAspect) {
            bgDrawHeight = planeHeight;
            bgDrawWidth = this._bgImage.width * (planeHeight / this._bgImage.height);
            bgOffsetX = (planeWidth - bgDrawWidth) / 2;
            bgOffsetY = 0;
        }
        else {
            bgDrawWidth = planeWidth;
            bgDrawHeight = this._bgImage.height * (planeWidth / this._bgImage.width);
            bgOffsetX = 0;
            bgOffsetY = (planeHeight - bgDrawHeight) / 1;
        }
        ctx2d.drawImage(this._bgImage, bgOffsetX, bgOffsetY, bgDrawWidth, bgDrawHeight);
        // Draw TABLE (centered)
        const tableDrawWidth = smallCoor * 1.2; //this._fgImage.width;
        const tableDrawHeight = tableDrawWidth * this._tableImage.height / this._tableImage.width;
        const tableOffsetX = (planeWidth - tableDrawWidth) / 2;
        const tableOffsetY = (planeHeight - tableDrawHeight) / (this._vertical ? 0.64 : 0.31);
        ctx2d.drawImage(this._tableImage, tableOffsetX, tableOffsetY, tableDrawWidth, tableDrawHeight);
        // Draw FOREGROUND (centered)
        const fgDrawWidth = smallCoor * 0.8; //this._fgImage.width;
        const fgDrawHeight = fgDrawWidth * this._fgImage.height / this._fgImage.width;
        const fgOffsetX = (planeWidth - fgDrawWidth) / 2;
        const fgOffsetY = (planeHeight - fgDrawHeight) / 1.14;
        ctx2d.drawImage(this._fgImage, fgOffsetX, fgOffsetY, fgDrawWidth, fgDrawHeight);
        //const centerY = fgOffsetY + 0.094 * smallCoor;//(this._vertical ? 0.58 : 0.442) * planeHeight;
        // draw TEXT on torte
        if (this._friendsName) { //his._vertical ? 0.84 : 0.41
            this.drawText(this._friendsName, fgOffsetY + 0.06 * smallCoor, 0.6, -0.1, bigCoor * 0.2, bigCoor * 0.04, 120);
        }
        // Draw LABEL (centered)
        const labelDrawWidth = planeWidth * (this._vertical ? 1.2 : 0.96);
        const labelDrawHeight = planeHeight * (this._vertical ? 0.4 : 0.8);
        const labelOffsetX = (planeWidth - labelDrawWidth) / 2;
        const labelOffsetY = this._vertical ? 0 : (-(planeHeight - labelDrawHeight) * 1.6);
        ctx2d.drawImage(this._labelImage, labelOffsetX, labelOffsetY, labelDrawWidth, labelDrawHeight);
        // draw TEXT on label
        if (this._wishText) {
            this.drawText(this._wishText, (this._vertical ? 0.21 : 0.1) * planeHeight, 0.66, (this._vertical ? 0.3 : 0.3), planeWidth * (this._vertical ? 0.52 : 0.4), planeWidth * (this._vertical ? 0.15 : 0.1), 320);
        }
        // watermark
        this.drawWatermark(this._vertical);
        // draw CANDLES
        const centerX = planeWidth / 2;
        const centerY = fgOffsetY + 0.091 * smallCoor; //(this._vertical ? 0.58 : 0.442) * planeHeight;
        let radiusX = bigCoor * 0.18;
        let radiusY = radiusX * 0.3;
        switch (this._torteIndex) {
            case 2:
            case 5:
                radiusX *= 1.104;
                break;
        }
        const sizeFactor = Math.pow(20 / this._age, 0.4) * (this._vertical ? 1.5 : 1);
        let baseCandleHeight = 60 * sizeFactor; // base size in pixels for center/front
        let baseCandleWidth = 20 * sizeFactor;
        if (this._age < 2) {
            radiusX = 0;
            radiusY = 0;
        }
        else if (this._age < 5) {
            radiusX /= 2;
            radiusY /= 2;
        }
        if (this._candleImage) {
            const candles = [];
            const angleOffset = this._age > 2 ? (0.5 / this._age) * Math.PI : 0;
            for (let i = 0; i < this._age; i++) {
                const angle = (i / this._age) * Math.PI * 2 + angleOffset;
                let x = radiusX * Math.cos(angle);
                let y = Math.sin(angle);
                x *= Math.pow(1.04, y);
                x += centerX;
                const scale = (8 + y) / 5;
                const candleWidth = baseCandleWidth * scale;
                const candleHeight = baseCandleHeight * scale;
                y = y * radiusY + centerY;
                candles.push({ x, y, width: candleWidth, height: candleHeight });
            }
            // Sort by y to simulate depth: farther candles first
            candles.sort((a, b) => a.y - b.y);
            ctx2d.globalAlpha = 0.7 + (0.2 / Math.pow(this._age, 0.2));
            for (const c of candles) {
                ctx2d.drawImage(this._candleImage, c.x - c.width / 2, c.y - c.height, c.width, c.height);
            }
            ctx2d.globalAlpha = 1;
        }
        this._popupDynamicTexture.update();
        const dataUrl = ctx2d.canvas.toDataURL("image/png");
        popupHint.centerImgUrl = dataUrl;
    }
    drawText(text, centerY, textViewAngle, angleFactor, radius, yAngleFactor, baseFontSize) {
        const planeWidth = this._popupDynamicTexture.getSize().width;
        const ctx2d = this._popupCtx2d;
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
            const y = centerY + (1 - Math.cos(angle)) * yAngleFactor; // simulate view from above (taller middle)
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
    drawWatermark(vertical) {
        const planeWidth = this._popupDynamicTexture.getSize().width;
        const planeHeight = this._popupDynamicTexture.getSize().height;
        const ctx2d = this._popupCtx2d;
        const centerX = planeWidth / 2;
        const centerY = planeHeight / 2;
        const minFontSize = 1;
        const maxFontSize = 1000;
        const fontSize = 14;
        ctx2d.font = `${fontSize}px Segou Script`;
        ctx2d.fillStyle = "white";
        ctx2d.textAlign = "right";
        ctx2d.textBaseline = "bottom";
        /*for (let i = 0; i < text.length; i++) {
            const char = text[i];

            // Cylindrical arc distortion: X and Y from angle*/
        const x = 0.99 * planeWidth; //+ Math.sin(angle) * radius;
        const y = 0.99 * planeHeight; //+ (1- Math.cos(angle)) * yAngleFactor; // simulate view from above (taller middle)
        // Simulate vertical skew/stretch for fake perspective
        /*const skew = Math.cos(angle); // smaller at sides
        const centerBoost = 1 + 0.3 * (1 - Math.abs(angle) / (angleSpan / 2)); // max at center
        const scaleX = (1 + 0.2 * (1 - Math.abs(skew))) * centerBoost; // slightly wider in center
        const scaleY = (1 - 0.3 * Math.abs(skew)) * centerBoost; // shorter at sides*/
        ctx2d.save();
        ctx2d.translate(x, y);
        //ctx2d.rotate(angleFactor * angle);
        //ctx2d.scale(scaleX, scaleY);
        ctx2d.fillText("swingpuzzles.com", 0, 0);
        ctx2d.restore();
        //}
    }
}
const puzzleEditor = new PuzzleEditor();
export default puzzleEditor;
