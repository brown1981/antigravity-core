const fs = require('fs');
const path = require('path');

const STATUS_FILE = path.join(__dirname, '../agents/status.json');

const [agentId, status, currentTask] = process.argv.slice(2);

if (!agentId || !status) {
    console.log('Usage: node update_status.js <agentId> <status> [currentTask]');
    process.exit(1);
}

try {
    const data = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
    const agent = data.agents.find(a => a.id === agentId);

    if (agent) {
        agent.status = status;
        agent.currentTask = currentTask || '';
        agent.lastActive = 'Just now';
        data.lastUpdated = new Date().toISOString();
        
        fs.writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2));
        console.log(`✅ ${agentId.toUpperCase()} status updated to ${status}.`);
    } else {
        console.error(`❌ Agent ${agentId} not found.`);
    }
} catch (error) {
    console.error('❌ Failed to update status.json:', error.message);
}
