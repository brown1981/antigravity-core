/**
 * Antigravity | Automation Hub (Liquid Zapier)
 * Logic for Stage 3: Workflow Creation & Visualization
 */

class AutomationHub {
    constructor() {
        this.flowContainer = document.getElementById('v9-flow-builder');
        this.promptInput = document.getElementById('auto-prompt');
        this.createBtn = document.getElementById('auto-create-btn');
        this.workflows = [];
        
        this.init();
    }

    init() {
        if (!this.createBtn) return;
        
        // V14.0 Steel Symphony: Delegation to specialized modules
        this.engine = new WorkflowEngine(this);

        this.createBtn.addEventListener('click', () => this.handleCreate());
        this.promptInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleCreate();
        });

        this.render(); 
    }

    handleCreate() {
        const query = this.promptInput.value.trim();
        if (!query) return;

        const knowledgeContext = window.knowledgeCortex ? window.knowledgeCortex.getContext() : "";
        
        // V14.0 Steel Symphony: Delegated Logic (SOLID: SRP)
        const workflow = SynapseParser.parse(query, knowledgeContext);
        
        this.workflows.push(workflow);
        this.render();
        this.promptInput.value = '';
    }


    // --- REFACTORED: Logic moved to SynapseParser & WorkflowEngine ---


    editNodeContent(wfId, stepIdx) {
        const wf = this.workflows.find(w => w.id === wfId);
        const step = wf.steps[stepIdx];
        const newDesc = prompt("TACTICAL OVERRIDE: Modify Neural Payload", step.desc);
        if (newDesc !== null) {
            step.desc = newDesc;
            if (window.memoryInspector) window.memoryInspector.log(`MANUAL OVERRIDE: Payload updated for [${step.title}]`, 'warn');
            this.render();
        }
    }

    approveStep(wfId, stepIdx) {
        const wf = this.workflows.find(w => w.id === wfId);
        if (!wf) return;
        
        const step = wf.steps[stepIdx];
        if (step && step.type === 'Safety') {
            step.status = 'APPROVED';
            if (window.memoryInspector) window.memoryInspector.log(`MANUAL APPROVAL GRANTED for ${step.title}`, 'success');
            this.render();
            
            // V14.0 Steel Symphony: Delegate to isolated engine
            this.engine.execute(wf);
        }
    }

    render() {
        const knowledgeItems = window.knowledgeCortex ? window.knowledgeCortex.knowledge : [];
        const registryItems = window.coreRegistry ? window.coreRegistry.records : [];

        this.flowContainer.innerHTML = `
            <div class="v9-auto-layout">
                <div class="v9-sidebar">
                    <div class="v9-knowledge-wrap glass">
                        <h5>KNOWLEDGE CORTEX</h5>
                        <div class="v9-knowledge-list">
                            ${knowledgeItems.length === 0 ? '<p class="empty-hint">Drag snippets here...</p>' : 
                                knowledgeItems.map(k => `<div class="v9-knowledge-chip glass">${k.content}</div>`).join('')}
                        </div>
                        <input type="text" id="knowledge-add" placeholder="+ Add Knowledge" onkeypress="if(event.key==='Enter'){window.knowledgeCortex.addSnippet(this.value); this.value=''}">
                        <button class="v13-xray-btn glass" onclick="window.memoryInspector.toggle()">TOGGLE NEURAL X-RAY</button>
                    </div>
                    
                    <div class="v9-registry-wrap glass">
                        <h5>CORE REGISTRY (LOGS)</h5>
                        <div class="v9-registry-table">
                            ${registryItems.map(r => `
                                <div class="v9-reg-row">
                                    <span class="reg-time">${r.timestamp}</span>
                                    <span class="reg-act">${r.action}</span>
                                    <span class="reg-out">${r.outcome}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="v9-main-builder">
                    ${this.workflows.length === 0 ? this.renderEmptyState() : 
                        this.workflows.map(wf => `
                            <div class="v9-workflow-chain" id="wf-${wf.id}">
                                ${wf.steps.map((step, idx) => `
                                    <div class="v9-node-container ${step.type === 'Path' ? 'v13-branching' : ''}">
                                        ${this.createNodeMarkup(step, wf.id, idx)}
                                        ${this.createSpineMarkup(step, idx, wf.steps.length)}
                                    </div>
                                `).join('')}
                            </div>
                        `).join('<div class="v9-chain-divider"></div>')}
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="v9-empty-state">
                <p>NO ACTIVE SYNAPSES</p>
                <span class="v9-subtitle">SELECT A NEURAL TEMPLATE TO BEGIN</span>
                <div class="v9-templates">
                    <div class="v9-tpl glass" onclick="window.automation.useTemplate('If cognitive load is high, /summarize and post to @slack')">
                        <h5>Agentic Summary</h5>
                        <span>Vitals → AI Core → Slack</span>
                    </div>
                    <div class="v9-tpl glass" onclick="window.automation.useTemplate('Weekly archive of vital trace to @gmail')">
                        <h5>Weekly Safety</h5>
                        <span>Schedule → Approval → Gmail</span>
                    </div>
                </div>
            </div>
        `;
    }

    createSpineMarkup(step, idx, total) {
        if (idx === total - 1) return '';
        if (step.type === 'Path') {
            return `
                <div class="v13-branch-spine">
                    <div class="branch-leg left"></div>
                    <div class="branch-leg right"></div>
                </div>
            `;
        }
        return '<div class="v9-spine-segment"></div>';
    }

    createNodeMarkup(step, wfId, stepIdx) {
        const meta = window.CONNECTOR_LIBRARY ? window.CONNECTOR_LIBRARY.getMetadata(step.app) : { icon: '📋' };
        const isPath = step.type === 'Path';
        const isAwaiting = step.status === 'AWAITING';
        
        return `
            <div class="v9-node glass ${isPath ? 'node-path' : ''} ${isAwaiting ? 'node-awaiting' : ''}">
                <div class="node-glow" style="background: ${meta.color || 'var(--theme-acc)'}"></div>
                <div class="node-icon-tray">${meta.icon}</div>
                <div class="node-content">
                    <div class="node-header">
                        <span class="node-tag">${step.type.toUpperCase()}</span>
                        <button class="v13-edit-btn" onclick="window.automation.editNodeContent(${wfId}, ${stepIdx})">EDIT</button>
                    </div>
                    <h4>${step.title}</h4>
                    <p class="node-desc">${step.desc}</p>
                    ${isAwaiting ? `<button class="node-approve-btn" onclick="window.automation.approveStep(${wfId}, ${stepIdx})">APPROVE ACTION</button>` : ''}
                </div>
                ${isPath ? `
                    <div class="v13-binary-options">
                        <div class="opt-box">PATH A: EXECUTE</div>
                        <div class="opt-box">PATH B: DISCARD</div>
                    </div>
                ` : ''}
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.automation = new AutomationHub();
});
