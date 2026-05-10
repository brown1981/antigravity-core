import math

def calculate_probability(miner_hashrate_th, network_hashrate_th, block_time_sec, active_hours_per_day, days):
    # Total seconds in the mining period
    total_seconds = active_hours_per_day * 3600 * days
    
    # Expected number of blocks found in this period (lambda)
    # lambda = (Miner Hashrate / Network Hashrate) * (Total Time / Block Time)
    expected_blocks = (miner_hashrate_th / network_hashrate_th) * (total_seconds / block_time_sec)
    
    # Probability of finding at least one block: P(X >= 1) = 1 - e^(-lambda)
    prob_at_least_one = 1 - math.exp(-expected_blocks)
    
    return prob_at_least_one, expected_blocks

# Data (2026 March Estimates)
miners = {
    "Avalon Q": 90,
    "Fluminer T3": 115
}

coins = {
    "BCH": {
        "network_h": 7.5 * 10**6, # EH to TH
        "block_time": 600,
        "reward": 3.125,
        "price_usd": 445
    },
    "BSV": {
        "network_h": 220 * 10**3, # PH to TH
        "block_time": 600,
        "reward": 3.125,
        "price_usd": 14.00
    },
    "DGB (SHA256)": {
        "network_h": 60 * 10**3, # PH to TH
        "block_time": 75, # 15s * 5 algos
        "reward": 665.64,
        "price_usd": 0.0040
    },
    "LCC": {
        "network_h": 330, # TH
        "block_time": 150,
        "reward": 93.75,
        "price_usd": 0.0034
    }
}

active_hours = 13.5
usd_jpy = 161

timeframes = [1, 30, 365] # Days

# Header for output
print(f"{'Miner':<15} | {'Coin':<12} | {'Time':<8} | {'Prob (%)':<10} | {'Exp. Blocks':<12} | {'Reward (JPY)':<15}")
print("-" * 88)

results = []

for miner_name, m_h in miners.items():
    for coin_name, data in coins.items():
        reward_jpy = data['reward'] * data['price_usd'] * usd_jpy
        avg_blocks_per_day = (m_h / data['network_h']) * (active_hours * 3600 / data['block_time'])
        
        for days in timeframes:
            prob, exp = calculate_probability(m_h, data['network_h'], data['block_time'], active_hours, days)
            time_label = f"{days}d"
            print(f"{miner_name:<15} | {coin_name:<12} | {time_label:<8} | {prob*100:10.4f}% | {exp:12.6f} | ¥{reward_jpy:14,.0f}")
        
        if avg_blocks_per_day > 0:
            mean_days = 1 / avg_blocks_per_day
            print(f"  * Average wait time: {mean_days:.1f} mining days")
        print("-" * 88)
