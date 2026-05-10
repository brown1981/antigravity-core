/**
 * Antigravity | Core Registry (V12.0)
 * State persistence and AI-native database
 */

class CoreRegistry {
    constructor() {
        this.records = [];
        this.maxRecords = 100;
        this.load();
    }

    register(action, outcome, meta = {}) {
        const record = {
            id: `reg-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            action: action,
            outcome: outcome,
            priority: meta.priority || 'NORMAL',
            neural_load: meta.load || 0
        };

        this.records.unshift(record);
        if (this.records.length > this.maxRecords) this.records.pop();
        
        // V12.1 Speed Optimization: Debounced Save
        this.scheduleSave();
        this.broadcast();
        return record;
    }

    scheduleSave() {
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => this.save(), 500);
    }

    save() {
        localStorage.setItem('agy_registry', JSON.stringify(this.records));
        console.log("REGISTRY SYNCED TO PERMANENT STORAGE");
    }

    load() {
        const stored = localStorage.getItem('agy_registry');
        if (stored) this.records = JSON.parse(stored);
    }

    broadcast() {
        if (window.automation) window.automation.render();
    }

    clear() {
        this.records = [];
        this.save();
        this.broadcast();
    }
}

window.coreRegistry = new CoreRegistry();
