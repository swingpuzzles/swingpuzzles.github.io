import { Vector3, Mesh, HighlightLayer, Color3 } from '@babylonjs/core';
import amazonData from '../../assets/amazon-jigsaw.json';
import puzzleCoverBuilder from './PuzzleCoverBuilder';
import ctx from '../common/SceneContext';

class PuzzleCircleBuilder {
    private covers: Mesh[] = [];
    private highlightedCover: Mesh | null = null;
    private highlightLayer!: HighlightLayer;

    constructor() {
    }

    build() {
        // Create the highlight layer when the builder is constructed
        this.highlightLayer = new HighlightLayer("coverHighlightLayer", ctx.scene, {
            blurHorizontalSize: 10,
            blurVerticalSize: 10,
            alphaBlendingMode: 2, // Use alpha blending mode for better performance
        });

        const radius = 100;
        const count = amazonData.length;

        amazonData.forEach((obj, index) => {
            const angle = (2 * Math.PI * index) / count;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            const position = new Vector3(x, -38, z);

            const cover = puzzleCoverBuilder.createCover(obj.imgSmallUrl, obj.imgBigUrl);
            cover.position = position;
            cover.rotation.y = -angle + Math.PI / 2;

            this.covers.push(cover);
        });

        ctx.scene.onBeforeRenderObservable.add(() => {
            this.highlightClosestCover();
        });
    }

    private highlightClosestCover() {
        if (!ctx.camera || this.covers.length === 0) return;

        let closest: Mesh | null = null;
        let minDistance = Infinity;

        for (const cover of this.covers) {
            const dist = Vector3.Distance(cover.position, ctx.camera.position);
            if (dist < minDistance) {
                minDistance = dist;
                closest = cover;
            }
        }

        if (closest !== this.highlightedCover) {
            if (this.highlightedCover) {
                this.highlightLayer.removeMesh(this.highlightedCover);
            }

            if (closest) {
                this.highlightLayer.addMesh(closest, new Color3(0.5, 1, 0));
            }

            this.highlightedCover = closest;
        }
    }
}

const puzzleCircleBuilder = new PuzzleCircleBuilder();
export default puzzleCircleBuilder;
