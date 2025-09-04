// TimerManager.ts
type TimeoutHandle  = ReturnType<typeof setTimeout>;
type IntervalHandle = ReturnType<typeof setInterval>;
type RafHandle      = number;

class TimerManager {
  private timeouts  = new Set<TimeoutHandle>();
  private intervals = new Set<IntervalHandle>();
  private rafs      = new Set<RafHandle>();

  // --- Timeouts ---
  setTimeout(cb: () => void | Promise<void>, delayMs: number): TimeoutHandle {
    const id = setTimeout(async () => {
      try { await cb(); } finally { this.timeouts.delete(id); }
    }, delayMs);
    this.timeouts.add(id);
    return id;
  }

  clearTimeout(id: TimeoutHandle): void {
    if (this.timeouts.has(id)) {
      clearTimeout(id);
      this.timeouts.delete(id);
    }
  }

  // --- Intervals ---
  setInterval(cb: () => void | Promise<void>, intervalMs: number): IntervalHandle {
    const id = setInterval(cb, intervalMs);
    this.intervals.add(id);
    return id;
  }

  clearInterval(id: IntervalHandle): void {
    if (this.intervals.has(id)) {
      clearInterval(id);
      this.intervals.delete(id);
    }
  }

  // --- Animation frames (handy in games) ---
  requestAnimationFrame(cb: (t: number) => void): RafHandle {
    const id = requestAnimationFrame((t) => {
      try { cb(t); } finally { this.rafs.delete(id); }
    });
    this.rafs.add(id);
    return id;
  }

  cancelAnimationFrame(id: RafHandle): void {
    if (this.rafs.has(id)) {
      cancelAnimationFrame(id);
      this.rafs.delete(id);
    }
  }

  // --- Nukes everything (use on mode change) ---
  clearAll(): void {
    for (const id of this.timeouts)  clearTimeout(id);
    for (const id of this.intervals) clearInterval(id);
    for (const id of this.rafs)      cancelAnimationFrame(id);
    this.timeouts.clear();
    this.intervals.clear();
    this.rafs.clear();
  }

  // optional alias for lifecycle APIs
  dispose(): void { this.clearAll(); }
}

const timerManager = new TimerManager();
export default timerManager;
