import gameModeManager, { GameMode } from "../behaviors/GameModeManager";

class TimerDisplay {
    private element: HTMLDivElement;
    private startTime: number = 0;
    private elapsed: number = 0;
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
    
    private updateDisplay(): void {
        const totalSeconds = Math.floor(this.elapsed / 1000);
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        this.element.textContent = `${minutes}:${seconds}`;
    }

    public resetAndShow(): void {
        this.startTime = Date.now();
        this.elapsed = 0;
        this.element.style.display = 'block';
        this.updateDisplay();

        if (this.interval) {
            window.clearInterval(this.interval);
        }

        this.interval = window.setInterval(() => {
            this.elapsed = Date.now() - this.startTime;
            this.updateDisplay();
        }, 500);
    }

    public pause(): void {
        if (this.interval !== null) {
            window.clearInterval(this.interval);
            this.interval = null;
            this.elapsed = Date.now() - this.startTime;
        }
    }

    public hide(): void {
        this.element.style.display = 'none';
        if (this.interval !== null) {
            window.clearInterval(this.interval);
            this.interval = null;
        }
    }
}

const timerDisplay = new TimerDisplay();
export default timerDisplay;