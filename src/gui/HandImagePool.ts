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

    acquire(x: string, y: string): Image {
        let image: Image;

        if (this.pool.length > 0) {
            image = this.pool.pop()!;
        } else {
            image = new Image("handIcon", this.textureUrl);
            image.width = this.width;
            image.height = this.height;
            image.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            image.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        }

        image.left = x;
        image.top = y;
        guiManager.advancedTexture.addControl(image);
        this.inUse.add(image);

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