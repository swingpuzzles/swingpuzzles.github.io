import amazonData from '../../assets/amazon-jigsaw.json';

class PuzzleCircleBuilder {
    build() {
        amazonData.forEach(obj => {
            //const boxData = { obj.link, obj.imgSmallUrl, obj.imgBigUrl, obj.imgCoverUrl}
        });
    }
}

const puzzleCircleBuilder = new PuzzleCircleBuilder();
export default puzzleCircleBuilder;