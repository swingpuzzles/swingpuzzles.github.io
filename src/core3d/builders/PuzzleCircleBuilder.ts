import { Vector3, Mesh, HighlightLayer, Color3 } from '@babylonjs/core';
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
}

class PuzzleCircleBuilder {
    private covers: Map<Mesh, CoverData> = new Map();
    private highlightedCover: Mesh | null = null;
    private highlightLayer!: HighlightLayer;
    private closestMesh: Mesh | null = null;

    constructor() {
    }

    public get selectedLink(): string {
        return this.covers.get(this.closestMesh!)!.link;
    }

    public get selectedCoverUrl(): string {
        return this.covers.get(this.closestMesh!)!.imgCoverUrl;
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
        this.covers.forEach((_, mesh) => {
            mesh.dispose();
        });
        this.covers.clear();
    }

    build() {
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
        const puzzleId = urlData.puzzleId;

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

            this.covers.set(cover, { imgCoverUrl: obj.imgCoverUrl, link: obj.link });

            if (puzzleId && obj.imgSmallUrl.includes(puzzleId)) {
                ctx.camera.alpha = angle;
            }

            puzzleUrlHelper.insertAngleEntry(obj.imgSmallUrl, angle);
        });
    }

    private highlightClosestCover() {
        if (!ctx.camera) return;

        if (!gameModeManager.initialMode) {
            if (this.highlightedCover) {
                this.highlightLayer.removeMesh(this.highlightedCover);
                this.highlightedCover = null;
            }

            return;
        }

        let minDistance = Infinity;

        for (const [cover, link] of this.covers) {
            const dist = Vector3.Distance(cover.position, ctx.camera.position);
            if (dist < minDistance) {
                minDistance = dist;
                this.closestMesh = cover;
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
