/**
 * SCAM SENTINEL: SECURITY API (GoPlus Integration)
 * Responsibilities: Contract Diagnostics Fetching
 */

const SecurityAPI = {
    async scanToken(address) {
        if (!address.startsWith('0x')) {
            throw new Error("INVALID_ADDRESS");
        }
        
        try {
            // Mainnet: 1, BSC: 56, Polygon: 137... for now defaulting to Ethereum (1)
            const response = await fetch(`https://api.gopluslabs.io/api/v1/token_security/1?contract_addresses=${address}`);
            const data = await response.json();
            
            if (data.code !== 1 || !data.result[address.toLowerCase()]) {
                throw new Error("API_ERROR_OR_NOT_FOUND");
            }
            
            return data.result[address.toLowerCase()];
        } catch (e) {
            console.error("Security Scan Failed:", e);
            throw e;
        }
    }
};

window.SecurityAPI = SecurityAPI;
