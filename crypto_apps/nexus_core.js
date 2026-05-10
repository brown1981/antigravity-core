/**
 * 🛰️ ANTIGRAVITY NEXUS CORE v1.0
 * ---------------------------------------
 * [ROLE] Central Data Engine (Plumbing)
 * [DOCTRINE] Objectivity (Raw Data Relay)
 * [ENGINEER] KIKOU (Iron)
 */

window.AntigravityNexus = {
    cacheKey: 'antigravity_market_cache',
    cacheExpiry: 5 * 60 * 1000, // 5 minutes

    /**
     * Fetch raw data from API or return from cache
     * @param {string} type - 'coingecko' or 'cmc'
     * @param {string} url - The raw API endpoint
     * @returns {Promise<object>} Raw JSON data
     */
    async getData(type, url) {
        const fullKey = `${this.cacheKey}_${type}`;
        const cached = localStorage.getItem(fullKey);

        if (cached) {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < this.cacheExpiry) {
                console.log(`[NEXUS] Returning cached data for ${type}`);
                return parsed.data;
            }
        }

        console.log(`[NEXUS] Fetching fresh evidence from ${type}...`);
        try {
            const response = await fetch(url);
            const rawData = await response.json();

            // Save to cache
            localStorage.setItem(fullKey, JSON.stringify({
                timestamp: Date.now(),
                data: rawData
            }));

            // Prepare for Archive Pipeline
            this.archiveData(type, rawData);

            return rawData;
        } catch (error) {
            console.error(`[NEXUS] Critical failure fetching ${type}:`, error);
            throw error;
        }
    },

    /**
     * Create a minimal metadata wrapper for archive persistence
     * @param {string} sourceId - The origin of data
     * @param {object} data - The raw JSON
     */
    archiveData(sourceId, data) {
        const archivePacket = {
            metadata: {
                app_id: sourceId,
                timestamp: new Date().toISOString(),
                format_version: "1.0",
                label: `RAW_INTELLIGENCE_${sourceId.toUpperCase()}`
            },
            payload: data
        };

        // Emit event for Harvester or Librarian to pick up
        const event = new CustomEvent('antigravity_archive_ready', { detail: archivePacket });
        window.dispatchEvent(event);
        
        // Also save to a separate log in localStorage for immediate access
        localStorage.setItem(`last_archive_${sourceId}`, JSON.stringify(archivePacket));
    }
};

console.log("🌌 Antigravity Nexus Core Activated.");
