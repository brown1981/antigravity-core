const fs = require('fs');
const path = require('path');
const https = require('https');

const PROJECT_ROOT = '/Users/ooshirokazuki/.gemini/antigravity/scratch/engawa-project';
const CONFIG_FILE = path.join(PROJECT_ROOT, 'agents/api_config.json');
const STATUS_FILE = path.join(PROJECT_ROOT, 'agents/status.json');
const DISCUSSION_FILE = path.join(PROJECT_ROOT, 'agents/discussion.json');

async function callOpenAI(apiKey, model, prompt, directive) {
    const data = JSON.stringify({
        model: model || "gpt-4o",
        messages: [
            { role: "system", content: prompt },
            { role: "user", content: directive || "現在、特別な命令はありません。通常業務の意思決定と状況報告を行ってください。" }
        ],
        temperature: 0.7
    });

    const options = {
        hostname: 'api.openai.com',
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (json.error) {
                        reject(new Error(json.error.message));
                    } else {
                        resolve(json.choices[0].message.content);
                    }
                } catch (e) {
                    reject(new Error("Failed to parse OpenAI response"));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

async function runAgent(agentId) {
    console.log(`[BRAIN] Activating agent: ${agentId}`);
    
    // 1. Load Context & Config
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
    const promptPath = path.join(PROJECT_ROOT, `agents/${agentId.toLowerCase()}_prompt.md`);
    const prompt = fs.existsSync(promptPath) ? fs.readFileSync(promptPath, 'utf8') : '';

    const assignedModel = config.agentAssignments[agentId.toLowerCase()] || 'openai';
    const apiKey = config.aiKeys[assignedModel];

    // 2. Check for User Commands
    const chat = JSON.parse(fs.readFileSync(DISCUSSION_FILE, 'utf8'));
    const lastCommand = [...(chat.messages || [])].reverse().find(m => m.agentId === 'commander');
    
    let directive = '';
    if (lastCommand) {
        const isTargeted = lastCommand.message.includes(`@${agentId.toLowerCase()}`);
        const isBroadcast = !lastCommand.message.includes('@');
        
        if (isTargeted || isBroadcast) {
            console.log(`[BRAIN] PRIORITY DIRECTIVE RECEIVED: "${lastCommand.message}"`);
            directive = lastCommand.message;
        }
    }

    if (!apiKey) {
        console.log(`[BRAIN] No API key for ${assignedModel}. Simulation active.`);
        return updateSimulatedStatus(agentId, status, directive ? `Received command: ${directive}` : 'Analyzing Market Data...');
    }

    try {
        // 3. REAL INFERENCE (OpenAI implementation)
        console.log(`[BRAIN] INFERENCE START: ${assignedModel.toUpperCase()} for ${agentId.toUpperCase()}`);
        
        const response = await callOpenAI(apiKey, assignedModel === 'openai' ? 'gpt-4o' : 'gpt-4o', prompt, directive);
        
        // 4. Log to Discussion
        appendToDiscussion(agentId, response);
        
        // 5. Update Status
        status.agents = status.agents.map(a => {
            if (a.id === agentId) {
                return { ...a, status: 'online', lastActive: new Date().toLocaleTimeString(), currentTask: '' };
            }
            return a;
        });
        fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
        console.log(`[BRAIN] INFERENCE COMPLETE: Response logged.`);
        
    } catch (err) {
        console.error(`[BRAIN] INFERENCE ERROR: ${err.message}`);
        updateSimulatedStatus(agentId, status, `Error: ${err.message}`);
    }
}

function appendToDiscussion(agentId, message) {
    const chat = JSON.parse(fs.readFileSync(DISCUSSION_FILE, 'utf8'));
    if (!chat.messages) chat.messages = [];
    
    chat.messages.push({
        id: Date.now().toString(),
        agentId: agentId.toLowerCase(),
        agentName: agentId.toUpperCase() + " AGENT",
        message: message,
        timestamp: new Date().toLocaleTimeString()
    });
    fs.writeFileSync(DISCUSSION_FILE, JSON.stringify(chat, null, 2));
}

function updateSimulatedStatus(agentId, status, currentTask) {
    status.agents = status.agents.map(a => {
        if (a.id === agentId) {
             return { ...a, status: 'processing', currentTask: currentTask || 'Ready for Strategic Command' };
        }
        return a;
    });
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
}

// Entry point
const targetAgent = process.argv[2] || 'ceo';
runAgent(targetAgent).catch(err => console.error(err));
