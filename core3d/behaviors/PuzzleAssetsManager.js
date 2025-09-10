import { Texture, CubeTexture, AssetsManager, SpriteManager } from "@babylonjs/core";
import ctx from "../common/SceneContext";
class PuzzleAssetsManager {
    constructor() {
        this.manager = null;
        this.textures = new Map();
        this.cubeTextures = [];
        this.spriteManagers = [];
    }
    init() {
        this.manager = new AssetsManager(ctx.scene);
    }
    // Add a regular texture with a placeholder and a URL to the high-res version
    addTexture(placeholderUrl, highResUrl) {
        const placeholder = new Texture(placeholderUrl, ctx.scene, true, false);
        this.textures.set(placeholder, { placeholder, finalUrl: highResUrl });
        const task = this.manager.addTextureTask(`texture_${Date.now()}`, highResUrl);
        task.onSuccess = () => {
            placeholder.updateURL(highResUrl);
        };
        task.onError = (_, msg, ex) => {
            console.warn(`Failed to load high-res texture '${highResUrl}': ${msg}`, ex);
        };
        return placeholder;
    }
    // Add a skybox (CubeTexture) replacement
    addSkybox(reflectionTarget, lowResUrl, highResUrl) {
        const placeholder = new CubeTexture(lowResUrl, ctx.scene);
        reflectionTarget.reflectionTexture = placeholder;
        this.cubeTextures.push({ placeholder, finalUrl: highResUrl, target: reflectionTarget });
        const task = this.manager.addCubeTextureTask(`skybox_${Date.now()}`, highResUrl);
        task.onSuccess = (task) => {
            reflectionTarget.reflectionTexture = task.texture;
        };
        task.onError = (_, msg, ex) => {
            console.warn(`Failed to load high-res cube texture '${highResUrl}': ${msg}`, ex);
        };
        return placeholder;
    }
    addSpriteManager(name, lowResUrl, highResUrl, capacity, lowResCellWidth, lowResCellHeight, highResCellWidth, highResCellHeight) {
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
        const task = this.manager.addTextureTask(`sprite_${name}_${Date.now()}`, highResUrl);
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
    load() {
        return new Promise((resolve, reject) => {
            this.manager.onFinish = () => resolve();
            this.manager.onTaskErrorObservable.add((task) => {
                console.warn(`Error loading task: ${task.name}`);
            });
            this.manager.load();
        });
    }
    addGuiImageButtonSource(button, highResUrl) {
        this.addGuiImageSource(button.image, highResUrl);
    }
    addGuiImageSource(image, highResUrl) {
        if (!image) {
            console.warn(`Image is undefined.`);
            return;
        }
        if (image.isLoaded) {
            image.source = highResUrl;
        }
        else {
            image.onImageLoadedObservable.addOnce(() => {
                image.source = highResUrl;
            });
        }
    }
    addGuiImageSourceForMultiple(images, highResUrl) {
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
