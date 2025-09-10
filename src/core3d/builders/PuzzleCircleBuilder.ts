import { Vector3, Mesh, HighlightLayer, Color3, StandardMaterial, Texture } from '@babylonjs/core';
import amazonDataHoriz from '../../assets/data/amazon-jigsaw-horiz.json';
import amazonDataVert from '../../assets/data/amazon-jigsaw-vert.json';
import puzzleCoverBuilder from './PuzzleCoverBuilder';
import ctx from '../common/SceneContext';
import gameModeManager from '../behaviors/GameModeManager';
import { PuzzleTools } from '../common/PuzzleTools';
import puzzleUrlHelper from '../../common/PuzzleUrlHelper';

interface CoverData {
    imgCoverUrl: string;
    link: string;
    mesh: Mesh;
}

class PuzzleCircleBuilder {
    private covers: Map<string, CoverData> = new Map();
    private highlightedCover: Mesh | null = null;
    private highlightLayer!: HighlightLayer;
    private closestMesh: Mesh | null = null;

    constructor() {
    }

    private getPuzzleId(cover: Mesh): string | null {
        const coverMat = cover.material as StandardMaterial;

        if (coverMat) {   // TODO better logic here
            const originalTexture = coverMat.diffuseTexture as Texture;
            const url = originalTexture.url!; // this should be the image URL
            return puzzleUrlHelper.extractPuzzleId(url);
        }

        return null;
    }

    public getPrevCover(cover: Mesh): Mesh | null {
        const keys = Array.from(this.covers.keys());

        if (keys.length === 0) {
            return null; // no covers at all
        }

        let puzzleId = this.getPuzzleId(cover);

        let index = keys.indexOf(puzzleId!);

        if (index === -1) {
            index = 0;
        }

        const prevIndex = (index - 1 + keys.length) % keys.length;
        return this.covers.get(keys[prevIndex])!.mesh;
    }

    public getNextCover(cover: Mesh): Mesh | null {
        const keys = Array.from(this.covers.keys());

        if (keys.length === 0) {
            return null; // no covers at all
        }

        let puzzleId = this.getPuzzleId(cover);

        let index = keys.indexOf(puzzleId!);

        if (index === -1) {
            index = 0;
        }

        const nextIndex = (index + 1) % keys.length;
        return this.covers.get(keys[nextIndex])!.mesh;
    }

    public getCoverUrl(cover: Mesh): string {
        let puzzleId = this.getPuzzleId(cover);
        return this.covers.get(puzzleId!)!.imgCoverUrl;
    }
    
    public get selectedLink(): string {
        let puzzleId = this.getPuzzleId(this.closestMesh!);
        return this.covers.get(puzzleId!)!.link;
    }

    public get selectedCover(): Mesh {
        return this.closestMesh!;
    }

    init() {
        // Create the highlight layer when the builder is constructed
        this.highlightLayer = new HighlightLayer("coverHighlightLayer", ctx.scene, {
            blurHorizontalSize: 10,
            blurVerticalSize: 10,
            alphaBlendingMode: 2, // Use alpha blending mode for better performance
        });

        ctx.scene.onBeforeRenderObservable.add(() => {
            this.highlightClosestCover();
        });
    }

    clear() {
        // Dispose previous covers and clear the map
        this.covers.forEach((value, key) => {
            value.mesh.dispose();
        });
        this.covers.clear();
    }

    build() {//console.trace('circle build');
        this.clear();

        const isPortrait = ctx.engine.getRenderHeight() > ctx.engine.getRenderWidth();
        const data = isPortrait ? amazonDataVert : amazonDataHoriz;

        const radius = 100;

        let filteredData = data;    // just to reuse the type
        filteredData = [];

        data.forEach((obj, index) => {
            if (PuzzleTools.hasIntersection(ctx.category!.tags, obj.tags)) {
                filteredData.push(obj);
            }
        });

        const count = filteredData.length;

        const urlData = puzzleUrlHelper.readFromUrl();
        //const puzzleId = urlData.puzzleId;console.log(urlData);

        filteredData.forEach((obj, index) => {
            if (!PuzzleTools.hasIntersection(ctx.category!.tags, obj.tags)) {
                return;
            }

            const angle = (2 * Math.PI * index) / count;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            const position = new Vector3(x, -38, z);
            const cover = puzzleCoverBuilder.createCover(obj.imgSmallUrl, obj.imgBigUrl);
            cover.position = position;
            cover.rotation.y = -angle + Math.PI / 2;
            
            let puzzleId = puzzleUrlHelper.extractPuzzleId(obj.imgSmallUrl);

            this.covers.set(puzzleId!, { imgCoverUrl: obj.imgCoverUrl, link: obj.link, mesh: cover });

            /*if (puzzleId && obj.imgSmallUrl.includes(puzzleId)) {
                ctx.camera.alpha = angle;
            }*/

            puzzleUrlHelper.insertCoverEntry(obj.imgSmallUrl, cover);
        });
    }

    private highlightClosestCover() {
        if (!ctx.cameraInitialized) return;

        if (!gameModeManager.initialMode) {
            if (this.highlightedCover) {
                this.highlightLayer.removeMesh(this.highlightedCover);
                this.highlightedCover = null;
            }

            return;
        }

        let minDistance = Infinity;

        for (const [key, value] of this.covers) {
            const dist = Vector3.Distance(value.mesh.position, ctx.cameraPosition);
            if (dist < minDistance) {
                minDistance = dist;
                this.closestMesh = value.mesh;
            }
        }

        if (this.closestMesh !== this.highlightedCover) {
            if (this.highlightedCover) {
                this.highlightLayer.removeMesh(this.highlightedCover);
            }

            if (this.closestMesh) {
                this.highlightLayer.addMesh(this.closestMesh, new Color3(0.5, 1, 0));
            }

            this.highlightedCover = this.closestMesh;
        }
    }
}

const puzzleCircleBuilder = new PuzzleCircleBuilder();
export default puzzleCircleBuilder;
