/**
 * Antigravity | Workflow Engine
 * SOLID: Responsibility Isolation (Execution Lifecycle)
 */

class WorkflowEngine {
    constructor(hub) {
        this.hub = hub; // Reference back for UI updates if needed
        this.monitorNeuralVitals();
    }

    /**
     * Monitors system vitals and triggers automated workflows if conditions met.
     */
    monitorNeuralVitals() {
        setInterval(() => {
            if (typeof VITALS_DATA === 'undefined') return;
            const load = VITALS_DATA.system_info.cognitive_load;
            
            this.hub.workflows.forEach(wf => {
                const el = document.getElementById(`wf-${wf.id}`);
                if (!el) return;

                const hasVitalsTrigger = wf.steps.some(s => s.app === 'vitals' && s.title === "Neural Spike");
                if (hasVitalsTrigger && load > 80) {
                    el.classList.add('v9-active-pulse');
                    this.execute(wf);
                } else {
                    el.classList.remove('v9-active-pulse');
                }
            });
        }, 1000);
    }

    /**
     * Executes the steps in a workflow sequentially.
     * @param {object} wf - The workflow to execute.
     */
    execute(wf) {
        if (window.memoryInspector) {
            window.memoryInspector.log(`COMMENCING NEURAL EXECUTION [${wf.id}]`, 'info');
        }

        const el = document.getElementById(`wf-${wf.id}`);
        // UI Safety: Ensure element exists
        if (!el) return;
        
        const nodes = el.querySelectorAll('.v9-node');
        
        let promise = Promise.resolve();
        wf.steps.forEach((step, idx) => {
            promise = promise.then(() => {
                return new Promise((resolve) => {
                    // Neural Trace Injection
                    if (window.memoryInspector) {
                        window.memoryInspector.log(`Processing ${step.title}: ${step.desc}`, 'neural');
                    }

                    // Check for Approval Gate Logic
                    if (step.type === 'Safety' && step.status === 'AWAITING') {
                        if (window.memoryInspector) window.memoryInspector.log(`EXECUTION PAUSED: AWAITING PRESIDENTIAL OVERRIDE`, 'warn');
                        return; // Halt chain
                    }

                    setTimeout(() => {
                        // UI Effect
                        if (nodes[idx]) {
                            nodes[idx].classList.add('executing');
                            setTimeout(() => nodes[idx].classList.remove('executing'), 1000);
                        }
                        
                        if (idx === wf.steps.length - 1) {
                            this.registerOutcome(wf);
                            if (window.memoryInspector) window.memoryInspector.log(`EXECUTION COMPLETED SUCCESSFULLY`, 'success');
                        }
                        
                        resolve();
                    }, 400); 
                });
            });
        });
    }

    /**
     * Persists the outcome of a successful synapse to the Core Registry.
     */
    registerOutcome(wf) {
        if (!window.coreRegistry) return;
        const lastStep = wf.steps[wf.steps.length - 1];
        window.coreRegistry.register(
            `Automated ${lastStep.title}`,
            "SUCCESSFUL SYNAPSE",
            { priority: 'HIGH', load: 84 }
        );
    }
}

window.WorkflowEngine = WorkflowEngine;
