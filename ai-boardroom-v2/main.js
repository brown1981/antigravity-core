const agents = [
    { id: 'astra', name: 'ASTRA', role: 'Strategic Overseer', color: 'var(--accent-blue)', pane: 'left' },
    { id: 'nova', name: 'NOVA', role: 'System Architect', color: 'var(--accent-purple)', pane: 'left' },
    { id: 'vortex', name: 'VORTEX', role: 'Execution Protocol', color: 'var(--accent-amber)', pane: 'middle' },
    { id: 'cipher', name: 'CIPHER', role: 'Logic Engine', color: 'var(--accent-emerald)', pane: 'middle' },
    { id: 'echo', name: 'ECHO', role: 'Data Analyst', color: 'var(--accent-rose)', pane: 'right' },
    { id: 'zenith', name: 'ZENITH', role: 'Truth Guardian', color: 'var(--accent-silver)', pane: 'right' }
];

const conversation = [
    { agent: 'astra', text: 'System check initiated. All sectors reporting in. Priority Zero set to Global Harmony.' },
    { agent: 'nova', text: 'Infrastructure stabilized. Crystalline shaders active. I am building the framework for our collective cognition.' },
    { agent: 'vortex', text: 'Execution pipeline primed. I am ready to manifest the strategic vision into concrete reality.' },
    { agent: 'cipher', text: 'Logic gates verified. Code integrity at 99.99%. I see the patterns within the noise.' },
    { agent: 'echo', text: 'Scanning external data streams. Sentiment analysis suggests high expectation for this deployment.' },
    { agent: 'zenith', text: 'Validation completed. The path forward is clear and logically sound. I am the guardian of objective truth.' },
    { agent: 'astra', text: 'Excellent. VORTEX, CIPHER, begin the tactical deployment of Sector 02.' },
    { agent: 'vortex', text: 'Proceeding with high-velocity iterations. Adjusting load balancing now.' },
    { agent: 'cipher', text: 'Optimizing recursive loops. Efficiency gains detected in Sector 02.' },
    { agent: 'echo', text: 'Wait, I am detecting an anomaly in the feedback loop. Sector 03 requires immediate attention.' },
    { agent: 'zenith', text: 'Analyzing anomaly. It is a misalignment of expectations. I will recalibrate the truth metrics.' },
    { agent: 'nova', text: 'Recalibrating architecture to accommodate the Sector 03 shift. The crystal structure remains intact.' }
];

const wakeUpBtn = document.getElementById('wake-up-btn');
const nodeCount = document.getElementById('node-count');
const syncLevel = document.getElementById('sync-level');
const panes = {
    left: document.getElementById('chat-left'),
    middle: document.getElementById('chat-middle'),
    right: document.getElementById('chat-right')
};

let messageIndex = 0;
let isAwake = false;

function addMessage(agentId, text) {
    const agent = agents.find(a => a.id === agentId);
    const container = panes[agent.pane];
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${agent.id}`;
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'agent-name';
    nameSpan.style.color = agent.color;
    nameSpan.innerText = `${agent.name} [${agent.role}]`;
    
    const textSpan = document.createElement('span');
    textSpan.innerText = text;
    
    messageDiv.appendChild(nameSpan);
    messageDiv.appendChild(textSpan);
    container.appendChild(messageDiv);
    
    // Auto scroll to bottom
    container.scrollTop = container.scrollHeight;
}

async function runBoardroom() {
    if (isAwake) return;
    isAwake = true;
    
    wakeUpBtn.disabled = true;
    wakeUpBtn.querySelector('.btn-text').innerText = 'BOARDROOM ACTIVE';
    
    // Animate stats
    let activeNodes = 0;
    const interval = setInterval(() => {
        if (activeNodes < 6) {
            activeNodes++;
            nodeCount.innerText = `${activeNodes}/6`;
            syncLevel.innerText = `${Math.floor((activeNodes / 6) * 100)}%`;
        } else {
            clearInterval(interval);
        }
    }, 500);

    // Play conversation
    while (messageIndex < conversation.length) {
        const item = conversation[messageIndex];
        addMessage(item.agent, item.text);
        messageIndex++;
        
        // Random delay between messages for realism
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500));
    }
    
    syncLevel.innerText = '100% (SYNCED)';
}

wakeUpBtn.addEventListener('click', runBoardroom);
