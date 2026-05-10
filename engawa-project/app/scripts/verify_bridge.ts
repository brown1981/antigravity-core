import { F2PoolBridge } from '../src/services/f2pool_bridge';

async function test() {
  console.log('--- 🧪 F2Pool Bridge Verification Test ---');
  const currency = 'bitcoin';
  const account = 'engawa_miner';
  
  try {
    // 1. Test without secret (V1 Fallback)
    console.log('Case 1: No secret (Expect V1 failure/404 if deprecated)');
    await F2PoolBridge.fetchStats(currency, account).catch(e => console.log('Result:', e.message));

    // 2. Test with mock secret (Expect V2 Auth Failure)
    console.log('\nCase 2: Mock secret (Expect V2 Auth Error)');
    await F2PoolBridge.fetchStats(currency, account, 'invalid_secret_test').catch(e => console.log('Result:', e.message));

  } catch (err) {
    console.error('Test script crashed:', err);
  }
}

test();
