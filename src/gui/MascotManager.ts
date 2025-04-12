import { Scene, Sprite, SpriteManager } from "@babylonjs/core";
import puzzleAssetsManager from "../components/behaviors/PuzzleAssetsManager";

export type MaskotEmotion =
  | "pointLaugh"
  | "pointScary"
  | "sad"
  | "happy"
  | "laughing"
  | "angry"
  | "resting"
  | "surprised"
  | "pointSmile"
  | "confused"
  | "asking"
  | "yelling"
  | "smiling"
  | "ok"
  | "sleeping"
  | "anxious";

// Layout: 2 rows × 8 columns
const EMOTION_INDEX_MAP: Record<MaskotEmotion, number> = {
  pointLaugh: 0,
  pointScary: 1,
  sad: 2,
  happy: 3,
  laughing: 4,
  angry: 5,
  resting: 6,
  surprised: 7,
  pointSmile: 8,
  confused: 9,
  asking: 10,
  yelling: 11,
  smiling: 12,
  ok: 13,
  sleeping: 14,
  anxious: 15
};

class MaskotManager {
  private spriteManager: SpriteManager;
  private maskot: Sprite;

  constructor(
  ) {
    const lowResPath = "assets/maskots-small.webp";
    const highResPath = "assets/maskots.webp";
    const lowCellSize = 128;
    const highCellSize = 512;
    this.spriteManager = puzzleAssetsManager.addSpriteManager(
      "maskotManager",
      lowResPath,
      highResPath,
      1, // only one maskot sprite
      lowCellSize,
      lowCellSize,
      highCellSize,
      highCellSize
    );

    this.maskot = new Sprite("maskot", this.spriteManager);
    this.setEmotion("resting"); // default emotion
  }

  public setEmotion(emotion: MaskotEmotion) {
    const index = EMOTION_INDEX_MAP[emotion];
    if (index === undefined) {
      throw new Error(`Unknown emotion: ${emotion}`);
    }
    this.maskot.cellIndex = index;
  }

  public getSprite(): Sprite {
    return this.maskot;
  }

  public animateToEmotion(from: MaskotEmotion, to: MaskotEmotion, duration: number = 500): void {
    const fromIndex = EMOTION_INDEX_MAP[from];
    const toIndex = EMOTION_INDEX_MAP[to];
  
    if (fromIndex === undefined || toIndex === undefined) {
      throw new Error(`Invalid emotion(s): ${from}, ${to}`);
    }
  
    const steps = Math.abs(toIndex - fromIndex);
    if (steps === 0) return;
  
    const direction = toIndex > fromIndex ? 1 : -1;
    const stepTime = duration / steps;
    let current = fromIndex;
  
    this.maskot.cellIndex = current;
  
    let elapsed = 0;
    const interval = setInterval(() => {
      current += direction;
      this.maskot.cellIndex = current;
      elapsed += stepTime;
  
      if (current === toIndex || elapsed >= duration) {
        clearInterval(interval);
        this.maskot.cellIndex = toIndex;
      }
    }, stepTime);
  }
}

const maskotManager = new MaskotManager();
export { maskotManager };