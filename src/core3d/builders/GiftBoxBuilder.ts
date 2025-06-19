import { ImportMeshAsync } from "@babylonjs/core/Loading/sceneLoader";
import {
    AbstractMesh,
    ActionManager,
    Color3,
    DynamicTexture,
    ExecuteCodeAction,
    Material,
    MeshBuilder,
    StandardMaterial,
    Texture,
    Vector3
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import ctx from "../common/SceneContext";
import puzzleAssetsManager from "../behaviors/PuzzleAssetsManager";
import openCoverAnimation from "../animations/OpenCoverAnimation";
import gameModeManager from "../behaviors/GameModeManager";
import giftMaker from "../../gui/GiftMaker";

export class GiftBoxBuilder {
    private _position: Vector3 = Vector3.Zero();
    private _scaling: Vector3 = new Vector3(1, 1, 1);

    private texWidth!: number;
    private texHeight!: number;
    private dynamicTex!: DynamicTexture;
    private ctx2d!: CanvasRenderingContext2D;

    constructor() {
    }

    public withPosition(x: number, y: number, z: number): GiftBoxBuilder {
        this._position.set(x, y, z);
        return this;
    }

    public withScaling(x: number, y: number, z: number): GiftBoxBuilder {
        this._scaling.set(x, y, z);
        return this;
    }

    public async build(name: string, fontFamily: string, textColor: string): Promise<AbstractMesh> {
        const tagMat = new StandardMaterial("tagMat");
        tagMat.diffuseTexture = puzzleAssetsManager.addTexture("assets/gift/gift-tag-small.webp", "assets/gift/gift-tag.webp");
        tagMat.diffuseTexture.hasAlpha = true;
        tagMat.useAlphaFromDiffuseTexture = true;
        //tagMat.backFaceCulling = false; // so it's visible from both sides
        tagMat.transparencyMode = Material.MATERIAL_ALPHABLEND; // optional for clarity
        (tagMat.diffuseTexture as Texture).vScale = -1;

        const planeWidth = 21;
        const planeHeight = 9.7;
        const ratio = planeWidth / planeHeight;

        const basePos = 118;

        const giftTagPlane = MeshBuilder.CreatePlane("giftTagPlane", { width: 21, height: 9.7 });
        giftTagPlane.hasVertexAlpha = true;
        giftTagPlane.material = tagMat;
        giftTagPlane.position = new Vector3(basePos + 10, -36.5, 12);
        giftTagPlane.rotation.x = Math.PI / 2;
        giftTagPlane.rotation.y = -Math.PI / 2 + Math.PI / 4;

        this.texWidth = 1024;
        this.texHeight = this.texWidth / ratio;

        // Create a new dynamic texture with transparent background
        this.dynamicTex = new DynamicTexture("giftTagText", { width: this.texWidth, height: this.texHeight }, ctx.scene, false);
        this.dynamicTex.hasAlpha = true;

        this.ctx2d = this.dynamicTex.getContext() as CanvasRenderingContext2D;

        this.drawText(name, fontFamily, textColor);

        // New material for the text overlay
        const textMat = new StandardMaterial("textMat", ctx.scene);
        textMat.diffuseTexture = this.dynamicTex;
        textMat.opacityTexture = this.dynamicTex; // Enables transparency
        textMat.useAlphaFromDiffuseTexture = true;
        textMat.emissiveColor = new Color3(1, 1, 1);
        textMat.backFaceCulling = false;
        textMat.transparencyMode = Material.MATERIAL_ALPHABLEND;

        // Create a slightly offset transparent plane over the tag image
        const textPlane = MeshBuilder.CreatePlane("textOverlay", { width: 21, height: 9.7 });
        textPlane.material = textMat;
        textPlane.position = giftTagPlane.position.clone().add(new Vector3(0, 0.01, 0)); // offset slightly
        textPlane.rotation = giftTagPlane.rotation.clone();

        const giftBox = MeshBuilder.CreateBox("giftBox", { width: 29.7, height: 4, depth: 45.6 });
        giftBox.position = new Vector3(basePos, -38.8, 0);

        giftBox.actionManager = new ActionManager(ctx.scene);
        
        giftBox.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
                openCoverAnimation.animate(giftBox);
            })
        );

        const source = "assets/models/ribbon.glb";

        const result = await ImportMeshAsync(source, ctx.scene);
        const ribbon = result.meshes[0];

        const position = new Vector3(basePos, -40, 0);
        ribbon.position = position;
        ribbon.rotation.x = Math.PI / 2;

        gameModeManager.addGameModeChangedObserver(() => {
            if (gameModeManager.giftTryMode) {
                giftTagPlane.isVisible = true;
                textPlane.isVisible = true;
                giftBox.isVisible = true;

                for (let m of result.meshes) {
                    m.isVisible = true;
                }

                this.drawText(giftMaker.friendsName, giftMaker.fontFamily, giftMaker.textColor);
            } else {
                giftTagPlane.isVisible = false;
                textPlane.isVisible = false;
                giftBox.isVisible = false;

                for (let m of result.meshes) {
                    m.isVisible = false;
                }
            }
        });

        return ribbon;
    }

    private drawText(name: string, fontFamily: string, textColor: string) {
        // Get 2D drawing context and draw text
        this.ctx2d.clearRect(0, 0, this.texWidth, this.texHeight);

        // Optional: transparent background
        this.ctx2d.fillStyle = "rgba(0, 0, 0, 0)";
        this.ctx2d.fillRect(0, 0, this.texWidth, this.texHeight);

        // Text styling
        const hugeFont = 1000;
        this.ctx2d.font = `bold ${hugeFont}px ${fontFamily}`;
        this.ctx2d.fillStyle = textColor;
        const metr = this.ctx2d.measureText(name);

        const fillLength = 0.6 * this.texWidth;
        const fillHeight = 0.48 * this.texHeight;
        const realFont = hugeFont * Math.min(fillLength / metr.width, fillHeight / hugeFont);

        this.ctx2d.font = `bold ${realFont}px ${fontFamily}`;

        this.ctx2d.rotate(-Math.PI / 8);
        this.ctx2d.fillText(name, this.texWidth * 0.14, this.texHeight); // Centered

        this.dynamicTex.update();
    }
}
