var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ImportMeshAsync } from "@babylonjs/core/Loading/sceneLoader";
import { ActionManager, Color3, DynamicTexture, ExecuteCodeAction, Material, MeshBuilder, StandardMaterial, Vector3 } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import ctx from "../common/SceneContext";
import puzzleAssetsManager from "../behaviors/PuzzleAssetsManager";
import openCoverAnimation from "../animations/OpenCoverAnimation";
import gameModeManager from "../behaviors/GameModeManager";
import giftMaker from "../../gui/GiftMaker";
import handImagePool from "../../gui/HandImagePool";
export class GiftBoxBuilder {
    constructor() {
        this._position = Vector3.Zero();
        this._scaling = new Vector3(1, 1, 1);
    }
    withPosition(x, y, z) {
        this._position.set(x, y, z);
        return this;
    }
    withScaling(x, y, z) {
        this._scaling.set(x, y, z);
        return this;
    }
    build(name, fontFamily, textColor) {
        return __awaiter(this, void 0, void 0, function* () {
            const tagMat = new StandardMaterial("tagMat");
            tagMat.diffuseTexture = puzzleAssetsManager.addTexture("assets/gift/gift-tag-small.webp", "assets/gift/gift-tag.webp");
            tagMat.diffuseTexture.hasAlpha = true;
            tagMat.useAlphaFromDiffuseTexture = true;
            //tagMat.backFaceCulling = false; // so it's visible from both sides
            tagMat.transparencyMode = Material.MATERIAL_ALPHABLEND; // optional for clarity
            tagMat.diffuseTexture.vScale = -1;
            const planeWidth = 21;
            const planeHeight = 9.7;
            const ratio = planeWidth / planeHeight;
            const renderWidth = ctx.engine.getRenderWidth();
            const renderHeight = ctx.engine.getRenderHeight();
            const vertical = renderHeight > renderWidth;
            const giftTagPlane = MeshBuilder.CreatePlane("giftTagPlane", { width: 21, height: 9.7 });
            giftTagPlane.hasVertexAlpha = true;
            giftTagPlane.material = tagMat;
            giftTagPlane.position = new Vector3(GiftBoxBuilder.BASE_X + 10, -36.5, vertical ? 6 : 12);
            giftTagPlane.rotation.x = Math.PI / 2;
            giftTagPlane.rotation.y = -Math.PI / 2 + Math.PI / 4;
            this.texWidth = 1024;
            this.texHeight = this.texWidth / ratio;
            // Create a new dynamic texture with transparent background
            this.dynamicTex = new DynamicTexture("giftTagText", { width: this.texWidth, height: this.texHeight }, ctx.scene, false);
            this.dynamicTex.hasAlpha = true;
            this.ctx2d = this.dynamicTex.getContext();
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
            const giftBox = MeshBuilder.CreateBox("giftBox", { width: 29.7, height: GiftBoxBuilder.BOX_HEIGHT, depth: 45.6 });
            ctx.currentCover = giftBox;
            giftBox.actionManager = new ActionManager(ctx.scene);
            giftBox.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
                openCoverAnimation.animate(giftBox);
                handImagePool.releaseAll();
            }));
            const source = "assets/models/ribbon.glb";
            const result = yield ImportMeshAsync(source, ctx.scene);
            const ribbon = result.meshes[0];
            ribbon.position = new Vector3(0, GiftBoxBuilder.BOX_HEIGHT / 2 - 3.2, 0);
            ribbon.rotation.x = Math.PI / 2;
            for (let m of result.meshes) {
                m.actionManager = giftBox.actionManager;
            }
            giftTagPlane.actionManager = giftBox.actionManager;
            textPlane.actionManager = giftBox.actionManager;
            ribbon.setParent(giftBox);
            giftBox.scaling.x = 1.2;
            giftBox.rotation.y = vertical ? Math.PI / 2 : 0;
            giftBox.position.y += GiftBoxBuilder.BOX_HEIGHT / 4;
            giftBox.bakeCurrentTransformIntoVertices();
            giftBox.position = GiftBoxBuilder.BASE_POS.clone();
            giftTagPlane.setParent(giftBox);
            textPlane.setParent(giftBox);
            gameModeManager.addGameModeChangedObserver((prevMode) => {
                //if (gameModeManager.giftTryMode || prevMode === GameMode.GiftTry || prevMode === GameMode.GiftReceived) { => url navigation problems
                if (gameModeManager.giftTryMode || gameModeManager.giftReceived) {
                    giftTagPlane.isVisible = true;
                    textPlane.isVisible = true;
                    giftBox.isVisible = true;
                    for (let m of result.meshes) {
                        m.isVisible = true;
                    }
                    this.drawText(giftMaker.friendsName, giftMaker.fontFamily, giftMaker.textColor);
                    giftBox.position = GiftBoxBuilder.BASE_POS.clone();
                    giftBox.rotation = Vector3.Zero();
                }
                else {
                    giftTagPlane.isVisible = false;
                    textPlane.isVisible = false;
                    giftBox.isVisible = false;
                    for (let m of result.meshes) {
                        m.isVisible = false;
                    }
                }
            });
            return giftBox;
        });
    }
    ensureFontLoaded(fontFamily_1) {
        return __awaiter(this, arguments, void 0, function* (fontFamily, weight = "bold", px = 1000) {
            const familyQuoted = /[\s"']/.test(fontFamily) ? `"${fontFamily}"` : fontFamily;
            // Ask the browser to load this exact face
            yield document.fonts.load(`${weight} ${px}px ${familyQuoted}`);
            // Optional: wait until all pending fonts are ready
            yield document.fonts.ready;
        });
    }
    drawText(name, fontFamily, textColor) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1) Ensure font is loaded before measure/draw
            yield this.ensureFontLoaded(fontFamily, "bold", 1000);
            // Clear and reset transform
            this.ctx2d.clearRect(0, 0, this.texWidth, this.texHeight);
            this.ctx2d.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation matrix
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
            // Apply rotation AFTER resetting
            this.ctx2d.rotate(-Math.PI / 8);
            this.ctx2d.fillText(name, this.texWidth * 0.14, this.texHeight); // Adjust as needed
            this.dynamicTex.update();
        });
    }
}
GiftBoxBuilder.BASE_X = 118;
GiftBoxBuilder.BOX_HEIGHT = 3;
GiftBoxBuilder.BASE_Y = -36.8;
GiftBoxBuilder.BASE_POS = new Vector3(GiftBoxBuilder.BASE_X, GiftBoxBuilder.BASE_Y - 3 * GiftBoxBuilder.BOX_HEIGHT / 4, 0);
