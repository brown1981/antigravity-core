const F2PoolBridge = require('../src/services/f2pool_bridge').F2PoolBridge;

async function test() {
  console.log('--- 🧪 F2Pool Bridge Verification (JS) ---');
  const currency = 'bitcoin';
  const account = 'engawa_miner';
  
  try {
    console.log('Case 1: No secret (Expect V1 404)');
    await F2PoolBridge.fetchStats(currency, account).catch(e => console.log('Result:', e.message));
  } catch (err) {
    console.error('Test script crashed:', err);
  }
}

test();
