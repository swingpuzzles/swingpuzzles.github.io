import {
    Texture,
    CubeTexture,
    AssetsManager,
    SpriteManager
} from "@babylonjs/core";
import ctx from "../common/SceneContext";
import { Button, Image } from "@babylonjs/gui";

type TextureReplacement = {
    placeholder: Texture;
    finalUrl: string;
};

type CubeTextureReplacement = {
    placeholder: CubeTexture;
    finalUrl: string;
    target: { reflectionTexture: CubeTexture | null };
};

type SpriteManagerReplacement = {
    manager: SpriteManager;
    highResUrl: string;
    highResCellWidth: number;
    highResCellHeight: number;
};

class PuzzleAssetsManager {
    private manager: AssetsManager | null = null;
    private textures: Map<Texture, TextureReplacement> = new Map();
    private cubeTextures: CubeTextureReplacement[] = [];
    private spriteManagers: SpriteManagerReplacement[] = [];

    init() {
        this.manager = new AssetsManager(ctx.scene);
    }

    // Add a regular texture with a placeholder and a URL to the high-res version
    public addTexture(placeholderUrl: string, highResUrl: string): Texture {
        const placeholder = new Texture(placeholderUrl, ctx.scene, true, false);
        this.textures.set(placeholder, { placeholder, finalUrl: highResUrl });

        const task = this.manager!.addTextureTask(`texture_${Date.now()}`, highResUrl);
        task.onSuccess = () => {
            placeholder.updateURL(highResUrl);
        };
        task.onError = (_, msg, ex) => {
            console.warn(`Failed to load high-res texture '${highResUrl}': ${msg}`, ex);
        };

        return placeholder;
    }

    // Add a skybox (CubeTexture) replacement
    public addSkybox(reflectionTarget: { reflectionTexture: CubeTexture | null }, lowResUrl: string, highResUrl: string): CubeTexture {
        const placeholder = new CubeTexture(lowResUrl, ctx.scene);
        reflectionTarget.reflectionTexture = placeholder;

        this.cubeTextures.push({ placeholder, finalUrl: highResUrl, target: reflectionTarget });

        const task = this.manager!.addCubeTextureTask(`skybox_${Date.now()}`, highResUrl);
        task.onSuccess = (task) => {
            reflectionTarget.reflectionTexture = task.texture!;
        };
        task.onError = (_, msg, ex) => {
            console.warn(`Failed to load high-res cube texture '${highResUrl}': ${msg}`, ex);
        };

        return placeholder;
    }

    public addSpriteManager(
        name: string,
        lowResUrl: string,
        highResUrl: string,
        capacity: number,
        lowResCellWidth: number,
        lowResCellHeight: number,
        highResCellWidth: number,
        highResCellHeight: number
    ): SpriteManager {
        const spriteManager = new SpriteManager(name, lowResUrl, capacity, {
            width: lowResCellWidth,
            height: lowResCellHeight
        }, ctx.scene);

        this.spriteManagers.push({
            manager: spriteManager,
            highResUrl,
            highResCellWidth,
            highResCellHeight
        });

        const task = this.manager!.addTextureTask(`sprite_${name}_${Date.now()}`, highResUrl);
        task.onSuccess = () => {
            spriteManager.texture.updateURL(highResUrl);
            spriteManager.cellWidth = highResCellWidth;
            spriteManager.cellHeight = highResCellHeight;
        };
        task.onError = (_, msg, ex) => {
            console.warn(`Failed to load high-res sprite sheet '${highResUrl}': ${msg}`, ex);
        };

        return spriteManager;
    }

    // Start loading all queued high-res assets
    public load(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.manager!.onFinish = () => resolve();
            this.manager!.onTaskErrorObservable.add((task) => {
                console.warn(`Error loading task: ${task.name}`);
            });
            this.manager!.load();
        });
    }

    public addGuiImageButtonSource(button: Button, highResUrl: string): void {
        this.addGuiImageSource(button.image!, highResUrl);
    }

    public addGuiImageSource(image: Image, highResUrl: string): void {
        if (!image) {
            console.warn(`Image is undefined.`);
            return;
        }
    
        if (image.isLoaded) {
            image.source = highResUrl;
        } else {
            image.onImageLoadedObservable.addOnce(() => {
                image.source = highResUrl;
            });
        }
    }

    public addGuiImageSourceForMultiple(images: Image[], highResUrl: string): void {
        if (!images.length) {
            console.warn(`No images provided.`);
            return;
        }

        for (const img of images) {
            this.addGuiImageSource(img, highResUrl);
        }
    }
}

const puzzleAssetsManager = new PuzzleAssetsManager();
export default puzzleAssetsManager;