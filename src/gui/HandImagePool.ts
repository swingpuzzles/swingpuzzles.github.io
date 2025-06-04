import { Control, Image } from "@babylonjs/gui";
import guiManager from "./GuiManager";
import sceneInitializer from "../components/SceneInitializer";
import ctx from "../components/common/SceneContext";

interface MotionData {
    paddingHoriz: number;
    paddingVert: number;
    horizontal: boolean;
    radius: number;
    speed: number;
    angle: number;
}

class HandImagePool {
    private pool: Image[] = [];
    private inUse: Set<Image> = new Set();
    private readonly textureUrl: string;
    //private readonly widthPerc: number = 8;
    //private readonly heightPerc: number = 12;
    private readonly width: number = 0.08;
    private readonly height: number = 0.12;
    private motionMap: Map<Image, MotionData> = new Map();

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
        const data = this.motionMap.get(image)!;
        const widthPx = this.width * height;
        image.widthInPixels = widthPx;
        image.height = this.height + 2 * data.paddingVert;
    }

    acquire(
        horizontalAlignment: number,
        verticalAlignment: number,
        paddingHoriz: number,
        paddingVert: number,
        rotationInDegrees: number,
        horizontal: boolean = true,
        radius = 0.02,
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
    
        const motionData: MotionData = {
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
            if (!this.inUse.has(image)) return;
        
            const data = this.motionMap.get(image);
            if (!data) return;
        
            data.angle += data.speed;
        
            if (data.horizontal) {
                const delta = data.radius * Math.sin(data.angle);
        
                image.left = delta * 100 + "%";
                /*const newPadding = data.paddingHorizPercent + delta;
                image.paddingLeft = newPadding + "%";
                image.paddingRight = newPadding + "%";
                image.width = this.widthPerc + 2 * newPadding + "%";*/
            } else {
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
    
    release(image: Image) {
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

const handImagePool = new HandImagePool("assets/popup/hand.webp"/*, "assets/popup/hand-small.webp"*/);
export default handImagePool;