import { Control, Image } from "@babylonjs/gui";
import guiManager from "./GuiManager";
import sceneInitializer from "../components/SceneInitializer";
import ctx from "../components/common/SceneContext";


class HandImagePool {
    private pool: Image[] = [];
    private inUse: Set<Image> = new Set();
    private readonly textureUrl: string;
    private readonly widthPerc: number = 8;
    private readonly heightPerc: number = 12;

    constructor(textureUrl: string) {
        this.textureUrl = textureUrl;
    }

    init() {
        sceneInitializer.addResizeObserver((width, height) => {
            for (const image of this.inUse) {
                this.resizeImage(image, height);
            }
        });
    }

    resizeImage(image: Image, height: number) {
        const widthPx = this.widthPerc * height / 100;
        image.widthInPixels = widthPx;
        image.height = this.heightPerc + "%";
    }

    acquire(
        horizontalAlignment: number,
        verticalAlignment: number,
        paddingLeftPercent: number,
        paddingTopPercent: number,
        rotationInDegrees: number,
        horizontal: boolean = true,
        radius = 2,
        speed = 0.05
    ): Image {
        let image: Image;
    
        if (this.pool.length > 0) {
            image = this.pool.pop()!;
        } else {
            image = new Image("handIcon", this.textureUrl);
            image.zIndex = 25;
        }
    
        // Apply alignment
        image.horizontalAlignment = horizontalAlignment;
        image.verticalAlignment = verticalAlignment;
    
        // Base padding values from percent of screen
        const advTex = guiManager.advancedTexture;
    
        const basePaddingLeft = paddingLeftPercent + "%";
        const basePaddingTop = paddingTopPercent + "%";
    
        // Set initial paddings
        image.paddingLeft = basePaddingLeft;
        image.paddingTop = basePaddingTop;
        image.paddingRight = basePaddingLeft;
        image.paddingBottom = basePaddingTop;
    
        // Rotation
        image.rotation = rotationInDegrees * Math.PI / 180;

        this.resizeImage(image, ctx.engine.getRenderHeight());
    
        advTex.addControl(image);
        this.inUse.add(image);
    
        // Start circular motion by adjusting padding
        let angle = 0;
    
        const update = () => {
            if (!this.inUse.has(image)) return;
    
            angle += speed;
    
            const offset = radius;
            const delta = offset * (1 + (horizontal
                ? Math.cos(angle)
                : Math.sin(angle)));
    
            if (horizontal) {
                image.paddingLeft = paddingLeftPercent + delta + "%";
                image.paddingRight = paddingLeftPercent + delta + "%";
                image.width = this.widthPerc + 2 * delta + "%";
            } else {
                image.paddingTop = paddingTopPercent + delta + "%";
                image.paddingBottom = paddingTopPercent + delta + "%";
                image.height = this.heightPerc + 2 * (paddingTopPercent + delta) + "%";
            }
    
            requestAnimationFrame(update);
        };
    
        update();
    
        return image;
    }
    
    release(image: Image) {
        if (this.inUse.has(image)) {
            this.inUse.delete(image);
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

const handImagePool = new HandImagePool("assets/hand.webp");
export default handImagePool;