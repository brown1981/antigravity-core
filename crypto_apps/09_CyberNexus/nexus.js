/**
 * CYBER_NEXUS: MATRIX ENGINE
 * Responsibilities: Node Monitoring, Packet Simulation, Connection Management
 */

const NexusEngine = {
    getNodes() {
        // Status of App 01-15
        const nodes = [];
        for (let i = 1; i <= 15; i++) {
            nodes.push({
                id: i,
                name: `APP_${String(i).padStart(2, '0')}`,
                isPurified: i <= 7, // Layer 1 is purified
                isActive: i <= 8   // Up to App 08 is currently active
            });
        }
        return nodes;
    },

    getPackets() {
        const sources = ['COINGECKO', 'GOPLUS', 'BINANCE', 'ON-CHAIN'];
        const targets = ['APP_01', 'APP_04', 'APP_08', 'DATABASE'];
        return {
            time: new Date().toLocaleTimeString(),
            src: sources[Math.floor(Math.random() * sources.length)],
            dst: targets[Math.floor(Math.random() * targets.length)],
            size: Math.floor(Math.random() * 512) + "KB",
            status: "ENCRYPTED"
        };
    }
};

window.NexusEngine = NexusEngine;
