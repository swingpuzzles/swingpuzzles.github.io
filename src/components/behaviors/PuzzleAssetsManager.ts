import {
    Scene,
    Texture,
    CubeTexture,
    AssetsManager
} from "@babylonjs/core";
import ctx from "../common/SceneContext";

type TextureReplacement = {
    placeholder: Texture;
    finalUrl: string;
};

type CubeTextureReplacement = {
    placeholder: CubeTexture;
    finalUrl: string;
    target: { reflectionTexture: CubeTexture | null };
};

class PuzzleAssetsManager {
    private manager: AssetsManager | null = null;
    private textures: Map<Texture, TextureReplacement> = new Map();
    private cubeTextures: CubeTextureReplacement[] = [];

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
}

const puzzleAssetsManager = new PuzzleAssetsManager();
export default puzzleAssetsManager;