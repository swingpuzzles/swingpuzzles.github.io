import { AdvancedDynamicTexture, Control, Image } from "@babylonjs/gui";


class HandImagePool {
    private pool: Image[] = [];
    private inUse: Set<Image> = new Set();
    private readonly textureUrl: string;
    private readonly advancedTexture: AdvancedDynamicTexture;
    private readonly width = "64px";
    private readonly height = "64px";

    constructor(textureUrl: string, advancedTexture: AdvancedDynamicTexture) {
        this.textureUrl = textureUrl;
        this.advancedTexture = advancedTexture;
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
        this.advancedTexture.addControl(image);
        this.inUse.add(image);

        return image;
    }

    release(image: Image) {
        if (this.inUse.has(image)) {
            this.inUse.delete(image);
            this.advancedTexture.removeControl(image);
            this.pool.push(image);
        }
    }

    releaseAll() {
        for (const image of this.inUse) {
            this.advancedTexture.removeControl(image);
            this.pool.push(image);
        }
        this.inUse.clear();
    }
}

const handImagePool = new HandImagePool("assets/hand.webp", AdvancedDynamicTexture.CreateFullscreenUI("HandImagePool"));
export default handImagePool;