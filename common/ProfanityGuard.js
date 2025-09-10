var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// ProfanityGuard.ts
import leo from "leo-profanity";
import csWords from "naughty-words/cs.json";
class ProfanityGuard {
    constructor() {
        this._initialized = false;
        this._initPromise = null;
        // cache of normalized dictionary terms for substring fallback
        this._normTerms = [];
    }
    static get instance() {
        var _a;
        return ((_a = this._instance) !== null && _a !== void 0 ? _a : (this._instance = new ProfanityGuard()));
    }
    /**
     * Fire-and-forget: kick off init on the next tick, don't await.
     * Safe to call multiple times.
     */
    initInBackground() {
        if (this._initialized || this._initPromise)
            return;
        this._initPromise = new Promise((resolve) => {
            // Defer heavy work off the critical path
            setTimeout(() => {
                try {
                    // Base EN
                    leo.loadDictionary("en");
                    // Add Czech (covers many Slovak stems with contains checking)
                    leo.add(csWords);
                    // Trim common false positives
                    leo.remove(["scunthorpe", "essex", "pianist", "analysis", "assistant", "assess"]);
                    // Build normalized dictionary for substring fallback
                    const seen = new Set();
                    this._normTerms = leo
                        .list()
                        .map((w) => ProfanityGuard.normalizeForMatch(w))
                        .filter((w) => w && w.length >= 4) // avoid super-short tokens (e.g., "ass")
                        .filter((w) => (seen.has(w) ? false : (seen.add(w), true)));
                    this._initialized = true;
                    resolve();
                }
                catch (e) {
                    // In case of unexpected error, still resolve to avoid deadlock;
                    // checks will run with leo's default state.
                    console.error("[ProfanityGuard] init failed:", e);
                    this._initialized = true;
                    resolve();
                }
            }, 0);
        });
    }
    /**
     * Internal: ensure init has completed; starts it if not yet started.
     */
    ensureInitialized() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._initialized)
                return;
            if (!this._initPromise)
                this.initInBackground();
            // At this point _initPromise exists
            yield this._initPromise;
        });
    }
    /**
     * Async check: waits for init if still running.
     */
    isProfaneName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureInitialized();
            if (!name || name.trim().length < 2)
                return true;
            const clean = name
                .replace(/[<>]/g, "")
                .replace(/[\u0000-\u001F\u007F]/g, "")
                .trim();
            if (!clean || /^[.\-_' ]+$/.test(clean))
                return true;
            // 1) Library checks (boundary-aware)
            if (leo.check(clean))
                return true;
            // 2) Normalized checks (catch leet/spacing/diacritics + suffixes like "fucker")
            const normalized = ProfanityGuard.normalizeForMatch(clean);
            if (!normalized)
                return true;
            if (leo.check(normalized))
                return true;
            // 3) Substring fallback against normalized stems
            for (const term of this._normTerms) {
                if (normalized.includes(term))
                    return true;
            }
            return false;
        });
    }
    /**
     * Async safe label for UI. Waits for init; returns fallback if profane/suspicious.
     */
    safeDisplayName(name_1) {
        return __awaiter(this, arguments, void 0, function* (name, fallback = "Friend", maxLen = 24) {
            if (!name || (yield this.isProfaneName(name)))
                return fallback;
            let s = name
                .replace(/[<>]/g, "")
                .replace(/[\u0000-\u001F\u007F]/g, "")
                .replace(/\s+/g, " ")
                .trim();
            if (s.length > maxLen)
                s = s.slice(0, maxLen).trim();
            if (!s || /^[.\-_' ]+$/.test(s))
                return fallback;
            return s;
        });
    }
    static normalizeForMatch(s) {
        let out = s.toLowerCase();
        // strip diacritics
        out = out.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
        // leet / homoglyph map
        const map = {
            "0": "o",
            "1": "i",
            "2": "z",
            "3": "e",
            "4": "a",
            "5": "s",
            "6": "g",
            "7": "t",
            "8": "b",
            "9": "g",
            "@": "a",
            "$": "s",
            "!": "i",
            "¡": "i",
            "¿": "i",
            "€": "e",
            "£": "l",
        };
        out = out.replace(/[@$!¡¿€£0-9]/g, (c) => { var _a; return (_a = map[c]) !== null && _a !== void 0 ? _a : c; });
        // remove separators (spaces, dots, dashes, underscores, etc.)
        out = out.replace(/[^a-z]+/g, "");
        // collapse long repeats: fuuuuuck -> fuck
        out = out.replace(/(.)\1{2,}/g, "$1");
        return out;
    }
}
ProfanityGuard._instance = null;
// Export a single instance
export default ProfanityGuard.instance;
