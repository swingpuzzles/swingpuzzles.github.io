var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class TimerManager {
    constructor() {
        this.timeouts = new Set();
        this.intervals = new Set();
        this.rafs = new Set();
    }
    // --- Timeouts ---
    setTimeout(cb, delayMs) {
        const id = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            try {
                yield cb();
            }
            finally {
                this.timeouts.delete(id);
            }
        }), delayMs);
        this.timeouts.add(id);
        return id;
    }
    clearTimeout(id) {
        if (this.timeouts.has(id)) {
            clearTimeout(id);
            this.timeouts.delete(id);
        }
    }
    // --- Intervals ---
    setInterval(cb, intervalMs) {
        const id = setInterval(cb, intervalMs);
        this.intervals.add(id);
        return id;
    }
    clearInterval(id) {
        if (this.intervals.has(id)) {
            clearInterval(id);
            this.intervals.delete(id);
        }
    }
    // --- Animation frames (handy in games) ---
    requestAnimationFrame(cb) {
        const id = requestAnimationFrame((t) => {
            try {
                cb(t);
            }
            finally {
                this.rafs.delete(id);
            }
        });
        this.rafs.add(id);
        return id;
    }
    cancelAnimationFrame(id) {
        if (this.rafs.has(id)) {
            cancelAnimationFrame(id);
            this.rafs.delete(id);
        }
    }
    // --- Nukes everything (use on mode change) ---
    clearAll() {
        for (const id of this.timeouts)
            clearTimeout(id);
        for (const id of this.intervals)
            clearInterval(id);
        for (const id of this.rafs)
            cancelAnimationFrame(id);
        this.timeouts.clear();
        this.intervals.clear();
        this.rafs.clear();
    }
    // optional alias for lifecycle APIs
    dispose() { this.clearAll(); }
}
const timerManager = new TimerManager();
export default timerManager;
