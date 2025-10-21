import amazonDataHoriz from '../../assets/data/amazon-jigsaw-horiz.json';
import amazonDataVert from '../../assets/data/amazon-jigsaw-vert.json';
import gameModeManager from '../behaviors/GameModeManager';
import { PuzzleTools } from '../common/PuzzleTools';
import ctx from '../common/SceneContext';

export interface PuzzleData {
    link: string;
    imgSmallUrl: string;
    imgBigUrl: string;
    imgCoverUrl: string;
    tags: string[];
    story: Record<string, string> | null;
    date: string | null;
}

export interface DailyPuzzleData {
    horiz: {
        link: string;
        imgSmallUrl: string;
        imgBigUrl: string;
        imgCoverUrl: string;
    };
    vert: {
        link: string;
        imgSmallUrl: string;
        imgBigUrl: string;
        imgCoverUrl: string;
    };
    story: Record<string, string>;
}

class PuzzleDataManager {
    private dailyPuzzleCache: Map<string, DailyPuzzleData> = new Map();
    private calendarDataCache: { data: PuzzleData[], timestamp: number } | null = null;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    /**
     * Get filtered puzzle data based on current orientation and category
     * @returns Array of filtered puzzle data
     */
    public async getFilteredData(): Promise<PuzzleData[]> {
        if (gameModeManager.calendarMode) {
            return await this.loadCalendarData();
        } else {
            const isPortrait = ctx.engine.getRenderHeight() > ctx.engine.getRenderWidth();
            const data = isPortrait ? amazonDataVert : amazonDataHoriz;
            
            return data
                .filter(obj => PuzzleTools.hasIntersection(ctx.category!.tags, obj.tags))
                .map(obj => ({ ...obj, story: null, date: null }));
        }
    }

    /**
     * Load daily puzzles for calendar mode (today and past days)
     * @returns Array of daily puzzle data
     */
    private async loadCalendarData(): Promise<PuzzleData[]> {
        // Check cache first
        if (this.calendarDataCache) {
            const now = Date.now();
            if (now - this.calendarDataCache.timestamp < this.CACHE_DURATION) {
                return this.calendarDataCache.data;
            }
        }

        const puzzles: PuzzleData[] = [];
        const isPortrait = ctx.engine.getRenderHeight() > ctx.engine.getRenderWidth();
        const today = new Date();
        
        // Load puzzles for the last 11 days
        for (let i = 0; i < 11; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);

            const dateString = PuzzleTools.getDateString(date);
            
            const dailyData = await this.loadDailyPuzzle(dateString);
            if (dailyData) {
                const puzzleData = isPortrait ? dailyData.vert : dailyData.horiz;
                puzzles.push({
                    ...puzzleData,
                    tags: ['Daily'],
                    story: dailyData.story,
                    date: dateString
                });
            }
        }
        
        // Cache the result
        this.calendarDataCache = {
            data: puzzles,
            timestamp: Date.now()
        };
        
        return puzzles;
    }

    /**
     * Load daily puzzle data for a specific date
     * @param date The date to load puzzle for
     * @returns Daily puzzle data or null if not found
     */
    public async loadDailyPuzzle(date: string): Promise<DailyPuzzleData | null> {
        // Check cache first
        if (this.dailyPuzzleCache.has(date)) {
            return this.dailyPuzzleCache.get(date)!;
        }

        try {
            const response = await fetch(`/assets/data/daily/${date}.json`);
            
            if (!response.ok) {
                return null;
            }
            
            const data = await response.json();
            
            // Cache the result
            this.dailyPuzzleCache.set(date, data);
            
            return data;
        } catch (error) {
            console.error(`Failed to load daily puzzle for ${date}:`, error);
            return null;
        }
    }

    /**
     * Load today's daily puzzle data
     * @returns Today's daily puzzle data or null if not found
     */
    public async loadTodaysPuzzle(): Promise<DailyPuzzleData | null> {
        return await this.loadDailyPuzzle(PuzzleTools.getDateString(new Date()));
    }

    /**
     * Get all puzzle data for current orientation (unfiltered)
     * @returns Array of all puzzle data for current orientation
     */
    public getAllData(): PuzzleData[] {
        const isPortrait = ctx.engine.getRenderHeight() > ctx.engine.getRenderWidth();
        const data = isPortrait ? amazonDataVert : amazonDataHoriz;
        return data.map(obj => ({ ...obj, story: null, date: null }));
    }

    /**
     * Clear all caches
     */
    public clearCache(): void {
        this.dailyPuzzleCache.clear();
        this.calendarDataCache = null;
    }
}

const puzzleDataManager = new PuzzleDataManager();
export default puzzleDataManager;

