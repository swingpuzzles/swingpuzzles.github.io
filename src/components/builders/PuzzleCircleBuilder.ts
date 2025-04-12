import { Vector3 } from '@babylonjs/core';
import amazonData from '../../assets/amazon-jigsaw.json';
import puzzleCoverBuilder from './PuzzleCoverBuilder';

class PuzzleCircleBuilder {
    build() {
        const radius = 100; // Distance from the center
        //const center = new Vector3(0, -40, 0); // Circle center
        const count = amazonData.length;

        amazonData.forEach((obj, index) => {
            const angle = (2 * Math.PI * index) / count;
            //const scale = 10;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            const position = new Vector3(x, -38, z);

            const cover = puzzleCoverBuilder.createCover(obj.imgSmallUrl, obj.imgBigUrl);
            cover.position = position;

            cover.rotation.y = -angle + Math.PI / 2; // Rotate to face the center

            // Make the cover look at the center of the circle
            //cover.lookAt(center);
        });
    }
}

const puzzleCircleBuilder = new PuzzleCircleBuilder();
export default puzzleCircleBuilder;
