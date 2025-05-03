import { Control, Image } from "@babylonjs/gui";
import guiManager from "./GuiManager";


class HandImagePool {
    private pool: Image[] = [];
    private inUse: Set<Image> = new Set();
    private readonly textureUrl: string;
    private readonly width = "64px";
    private readonly height = "64px";

    constructor(textureUrl: string) {
        this.textureUrl = textureUrl;
    }

    acquire(x: string, y: string, rotationInDegrees = 0): Image {
        let image: Image;
    
        if (this.pool.length > 0) {
            image = this.pool.pop()!;
        } else {
            image = new Image("handIcon", this.textureUrl);
            image.width = this.width;
            image.height = this.height;
            image.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            image.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            image.zIndex = 25;
        }
    
        image.left = x;
        image.top = y;
    
        // Convert degrees to radians and set rotation
        image.rotation = rotationInDegrees * Math.PI / 180;
    
        guiManager.advancedTexture.addControl(image);
        this.inUse.add(image);
    
        return image;
    }
    
    acquireWithMotion(
        x: string,
        y: string,
        rotationInDegrees: number,
        direction: "horizontal" | "vertical" = "horizontal",
        radius = 20,
        speed = 0.05
    ): Image {
        const image = this.acquire(x, y, rotationInDegrees);
    
        let angle = 0;
        const startX = parseFloat(image.left as string);
        const startY = parseFloat(image.top as string);
    
        const update = () => {
            if (!this.inUse.has(image)) return;
    
            angle += speed;
    
            const newX = direction === "horizontal"
                ? startX + radius * Math.cos(angle)
                : startX;
    
            const newY = direction === "vertical"
                ? startY + radius * Math.sin(angle)
                : startY;
    
            image.left = `${newX}px`;
            image.top = `${newY}px`;
    
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