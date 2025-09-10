import gameModeManager, { GameMode } from "../behaviors/GameModeManager";
class TimerDisplay {
    constructor() {
        this.startTime = 0; // when current run started
        this.elapsed = 0; // accumulated ms from previous runs
        this.interval = null;
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
    init() {
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
    getElapsedTime() {
        return this.element.textContent;
    }
    getElapsedTimeMs() {
        return this.elapsed + (this.interval ? Date.now() - this.startTime : 0);
    }
    updateDisplay() {
        const totalMs = this.elapsed + (this.interval ? Date.now() - this.startTime : 0);
        const totalSeconds = Math.floor(totalMs / 1000);
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        this.element.textContent = `${minutes}:${seconds}`;
    }
    resetAndShow() {
        this.startTime = Date.now();
        this.elapsed = 0;
        this.element.style.display = 'block';
        this.startInterval();
    }
    continue() {
        if (this.interval !== null)
            return; // already running
        this.startTime = Date.now(); // reset start for this run
        this.startInterval();
    }
    pause() {
        if (this.interval !== null) {
            window.clearInterval(this.interval);
            this.interval = null;
            this.elapsed += Date.now() - this.startTime; // add this run
        }
    }
    hide() {
        this.element.style.display = 'none';
        if (this.interval !== null) {
            window.clearInterval(this.interval);
            this.interval = null;
        }
    }
    startInterval() {
        this.updateDisplay();
        this.interval = window.setInterval(() => {
            this.updateDisplay();
        }, 100);
    }
}
const timerDisplay = new TimerDisplay();
export default timerDisplay;
