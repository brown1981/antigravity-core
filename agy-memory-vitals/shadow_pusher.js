const fs = require('fs');
const https = require('https');

const TOKEN = 'YOUR_GITHUB_TOKEN_HERE';
const OWNER = 'brown1981';
const REPO = 'antigravity-neural-core';
const FILES = [
    'index.html', 'style.css', 'app.js', 'automation_hub.js', 
    'synapse_parser.js', 'workflow_engine.js', 'neural_engine.js',
    'connector_library.js', 'core_registry.js', 'data_bridge.js',
    'knowledge_cortex.js', 'memory_inspector.js', 'README.md', '.gitignore',
    'image.png', 'neural_brain_v10_core_1776612040985.png'
];

async function uploadFile(path) {
    console.log(`Pushing: ${path}...`);
    const content = fs.readFileSync(path);
    const base64Content = content.toString('base64');

    const data = JSON.stringify({
        message: `chore: neural teleport [${path}]`,
        content: base64Content
    });

    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'api.github.com',
            path: `/repos/${OWNER}/${REPO}/contents/${path}`,
            method: 'PUT',
            headers: {
                'Authorization': `token ${TOKEN}`,
                'User-Agent': 'Antigravity-AI',
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    console.log(`✅ Success: ${path}`);
                    resolve();
                } else {
                    console.error(`❌ Failed: ${path} (${res.statusCode})`);
                    console.error(body);
                    reject(new Error(body));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function run() {
    for (const f of FILES) {
        try {
            await uploadFile(f);
        } catch (e) {
            console.error(`Stopping due to error on ${f}`);
            break;
        }
    }
    console.log('--- MISSION COMPLETE ---');
}

run();
