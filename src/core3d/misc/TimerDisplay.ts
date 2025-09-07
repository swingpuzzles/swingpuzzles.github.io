import gameModeManager, { GameMode } from "../behaviors/GameModeManager";
import analyticsManager from "../../common/AnalyticsManager";

class TimerDisplay {
    private element: HTMLDivElement;
    private startTime: number = 0; // when current run started
    private elapsed: number = 0;   // accumulated ms from previous runs
    private interval: number | null = null;

    constructor() {
        this.element = document.createElement('div');
        this.element.style.position = 'fixed';
        this.element.style.top = '10px';
        this.element.style.left = '10px';
        this.element.style.background = 'black';
        this.element.style.color = 'white';
        this.element.style.padding = '5px 10px';
        this.element.style.fontFamily = 'monospace';
        this.element.style.borderRadius = '5px';
        this.element.style.display = 'none';
        this.element.textContent = '00:00';
        document.body.appendChild(this.element);
    }

    public init(): void {
        gameModeManager.addGameModeChangedObserver(() => {
            switch (gameModeManager.currentMode) {
                case GameMode.Solve:
                    this.resetAndShow();
                    break;
                case GameMode.Celebration:
                    this.pause();
                    break;
                default:
                    this.hide();
            }
        });
    }

    public getElapsedTime(): string {
        return this.element.textContent!;
    }

    public getElapsedTimeMs(): number {
        return this.elapsed + (this.interval ? Date.now() - this.startTime : 0);
    }

    private updateDisplay(): void {
        const totalMs = this.elapsed + (this.interval ? Date.now() - this.startTime : 0);
        const totalSeconds = Math.floor(totalMs / 1000);
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        this.element.textContent = `${minutes}:${seconds}`;
    }

    public resetAndShow(): void {
        this.startTime = Date.now();
        this.elapsed = 0;
        this.element.style.display = 'block';
        this.startInterval();
    }

    public continue(): void {
        if (this.interval !== null) return; // already running
        this.startTime = Date.now(); // reset start for this run
        this.startInterval();
    }

    public pause(): void {
        if (this.interval !== null) {
            window.clearInterval(this.interval);
            this.interval = null;
            this.elapsed += Date.now() - this.startTime; // add this run
        }
    }

    public hide(): void {
        this.element.style.display = 'none';
        if (this.interval !== null) {
            window.clearInterval(this.interval);
            this.interval = null;
        }
    }

    private startInterval(): void {
        this.updateDisplay();
        this.interval = window.setInterval(() => {
            this.updateDisplay();
        }, 100);
    }
}

const timerDisplay = new TimerDisplay();
export default timerDisplay;
