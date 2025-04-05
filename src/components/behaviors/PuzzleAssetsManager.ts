import { Scene, Texture, AssetsManager, AbstractAssetTask } from "@babylonjs/core";

type TexturePair = {
    placeholder: Texture;
    finalUrl: string;
};

export class PuzzleAssetsManager {
    private scene: Scene;
    private manager: AssetsManager;
    private textureMap: Map<string, TexturePair> = new Map();

    constructor(scene: Scene) {
        this.scene = scene;
        this.manager = new AssetsManager(scene);
    }

    // Register a texture with a lightweight placeholder and a final high-res URL
    public addTexture(id: string, placeholderUrl: string, finalUrl: string): Texture {
        const placeholder = new Texture(placeholderUrl, this.scene, true, false);
        this.textureMap.set(id, { placeholder, finalUrl });

        // Queue high-res loading
        const task = this.manager.addTextureTask(`${id}_task`, finalUrl);
        task.onSuccess = (task) => {
            const pair = this.textureMap.get(id);
            if (pair) {
                pair.placeholder.updateURL(finalUrl);
                // Optionally: pair.placeholder.dispose(); to replace with a new one instead
                // Or notify subscribers if you're using an event-driven pattern
            }
        };
        task.onError = (task, message, exception) => {
            console.error(`Failed to load high-res texture for '${id}': ${message}`, exception);
        };

        return placeholder;
    }

    public load(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.manager.onFinish = () => resolve();
            this.manager.onTaskErrorObservable.add((task) => {
                console.warn(`Error loading task: ${task.name}`);
            });
            this.manager.load();
        });
    }

    public getTexture(id: string): Texture | undefined {
        const pair = this.textureMap.get(id);
        return pair?.placeholder;
    }
}
