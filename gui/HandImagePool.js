import { Image } from "@babylonjs/gui";
import guiManager from "./GuiManager";
import sceneInitializer from "../core3d/SceneInitializer";
import ctx from "../core3d/common/SceneContext";
class HandImagePool {
    constructor(textureUrl) {
        this.pool = [];
        this.inUse = new Set();
        //private readonly widthPerc: number = 8;
        //private readonly heightPerc: number = 12;
        this.width = 0.08;
        this.height = 0.12;
        this.motionMap = new Map();
        this.textureUrl = textureUrl;
    }
    init() {
        sceneInitializer.addResizeObserver((width, height) => {
            for (const image of this.inUse) {
                this.resizeImage(image, height);
            }
        });
    }
    resizeImage(image, height) {
        const data = this.motionMap.get(image);
        const widthPx = this.width * height;
        image.widthInPixels = widthPx;
        image.height = this.height + 2 * data.paddingVert;
    }
    acquire(horizontalAlignment, verticalAlignment, paddingHoriz, paddingVert, rotationInDegrees, horizontal = true, radius = 0.02, speed = 0.05) {
        let image;
        if (this.pool.length > 0) {
            image = this.pool.pop();
        }
        else {
            image = new Image("handIcon", this.textureUrl);
            image.zIndex = 25;
        }
        // Apply alignment
        image.horizontalAlignment = horizontalAlignment;
        image.verticalAlignment = verticalAlignment;
        // Base padding values from percent of screen
        const advTex = guiManager.advancedTexture;
        const basePaddingLeft = paddingHoriz;
        const basePaddingTop = paddingVert;
        // Set initial paddings
        image.paddingLeft = basePaddingLeft * 100 + "%";
        image.paddingTop = basePaddingTop * 100 + "%";
        image.paddingRight = basePaddingLeft * 100 + "%";
        image.paddingBottom = basePaddingTop * 100 + "%";
        // Rotation
        image.rotation = rotationInDegrees * Math.PI / 180;
        advTex.addControl(image);
        this.inUse.add(image);
        const motionData = {
            paddingHoriz,
            paddingVert,
            horizontal,
            radius,
            speed,
            angle: 0
        };
        this.motionMap.set(image, motionData);
        this.resizeImage(image, ctx.engine.getRenderHeight());
        const update = () => {
            if (!this.inUse.has(image))
                return;
            const data = this.motionMap.get(image);
            if (!data)
                return;
            data.angle += data.speed;
            if (data.horizontal) {
                const delta = data.radius * Math.sin(data.angle);
                image.left = delta * 100 + "%";
                /*const newPadding = data.paddingHorizPercent + delta;
                image.paddingLeft = newPadding + "%";
                image.paddingRight = newPadding + "%";
                image.width = this.widthPerc + 2 * newPadding + "%";*/
            }
            else {
                const delta = data.radius * (1 - Math.cos(data.angle));
                const newPadding = data.paddingVert + delta;
                image.paddingTop = newPadding * 100 + "%";
                image.paddingBottom = newPadding * 100 + "%";
                image.height = this.height + 2 * newPadding;
            }
            requestAnimationFrame(update);
        };
        update();
        return image;
    }
    release(image) {
        if (this.inUse.has(image)) {
            this.inUse.delete(image);
            this.motionMap.delete(image);
            guiManager.advancedTexture.removeControl(image);
            this.pool.push(image);
        }
    }
    releaseAll() {
        for (const image of this.inUse) {
            guiManager.advancedTexture.removeControl(image);
            this.pool.push(image);
        }
        this.inUse.clear();
    }
}
const handImagePool = new HandImagePool("assets/popup/hand.webp" /*, "assets/popup/hand-small.webp"*/);
export default handImagePool;
