import amazonDataHoriz from '../../assets/data/amazon-jigsaw-horiz.json';
import amazonDataVert from '../../assets/data/amazon-jigsaw-vert.json';
import { PuzzleTools } from '../common/PuzzleTools';
import ctx from '../common/SceneContext';

export interface PuzzleData {
    link: string;
    imgSmallUrl: string;
    imgBigUrl: string;
    imgCoverUrl: string;
    tags: string[];
}

class PuzzleDataManager {
    /**
     * Get filtered puzzle data based on current orientation and category
     * @returns Array of filtered puzzle data
     */
    public getFilteredData(): PuzzleData[] {
        const isPortrait = ctx.engine.getRenderHeight() > ctx.engine.getRenderWidth();
        const data = isPortrait ? amazonDataVert : amazonDataHoriz;
        
        return data.filter(obj => 
            PuzzleTools.hasIntersection(ctx.category!.tags, obj.tags)
        );
    }

    /**
     * Get all puzzle data for current orientation (unfiltered)
     * @returns Array of all puzzle data for current orientation
     */
    public getAllData(): PuzzleData[] {
        const isPortrait = ctx.engine.getRenderHeight() > ctx.engine.getRenderWidth();
        return isPortrait ? amazonDataVert : amazonDataHoriz;
    }
}

const puzzleDataManager = new PuzzleDataManager();
export default puzzleDataManager;

