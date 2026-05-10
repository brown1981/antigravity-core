const API_URL = '/api/tasks';

// Agent Avatar Seed Mapping (Dicebear Bottts)
const agentSeeds = {
  'ceo': 'ceo',
  'security': 'sec',
  'developer': 'dev',
  'pr': 'pr',
  'reviewer': 'rev',
  'curator': 'cur'
};

async function fetchTasks() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('API server is unreachable. Is The Loop running?');
    const tasks = await response.json();
    renderBoard(tasks);
  } catch (error) {
    console.warn('Failed to fetch tasks:', error.message);
    // Silent fail in UI to avoid spam, but logs in console.
  }
}

function renderBoard(tasks) {
  const lists = {
    'TODO': document.getElementById('list-todo'),
    'IN_PROGRESS': document.getElementById('list-progress'),
    'REVIEW': document.getElementById('list-review'),
    'DONE': document.getElementById('list-done')
  };

  // Clear existing tasks
  Object.values(lists).forEach(list => list.innerHTML = '');
  
  const counts = { 'TODO': 0, 'IN_PROGRESS': 0, 'REVIEW': 0, 'DONE': 0, 'ESCALATED': 0 };

  tasks.forEach(task => {
    // Map escalated tasks to the TODO column visually (or separate column later)
    const colName = task.status === 'ESCALATED' ? 'TODO' : task.status;
    counts[task.status] = (counts[task.status] || 0) + 1;
    
    if (lists[colName]) {
      const card = createTaskCard(task);
      lists[colName].appendChild(card);
    }
  });

  // Update counts in column headers
  document.querySelector('#col-todo .task-count').textContent = counts['TODO'] + counts['ESCALATED'];
  document.querySelector('#col-progress .task-count').textContent = counts['IN_PROGRESS'];
  document.querySelector('#col-review .task-count').textContent = counts['REVIEW'];
  document.querySelector('#col-done .task-count').textContent = counts['DONE'];
}

function createTaskCard(task) {
  const div = document.createElement('div');
  div.className = 'task-card';
  
  // Create Escalate Badge if needed
  const escalateBadge = task.status === 'ESCALATED' 
    ? '<span style="color:#ff3366;font-size:11px;font-weight:bold;display:block;margin-bottom:8px;">⚠️ ESCALATED (Requires Human)</span>' 
    : '';

  // Get Avatar
  const seed = agentSeeds[task.assignee] || 'bot';
  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=transparent`;

  // Material 3 Web Component: md-ripple adds the standard Google touch ripple effect
  div.innerHTML = `
    <md-ripple></md-ripple>
    <div class="task-card-header">
      <span class="task-id">#${task.id.split('-')[0]}</span>
      <md-icon-button style="margin: -8px -8px 0 0;"><md-icon>more_horiz</md-icon></md-icon-button>
    </div>
    <h3 class="task-title">${task.title}</h3>
    ${escalateBadge}
    
    <!-- Result Summary (if task is finished) -->
    ${task.status === 'DONE' && task.result ? `
      <div class="task-result-preview">
        <md-icon style="font-size: 14px; color: var(--color-pr);">check_circle</md-icon>
        <p>${JSON.parse(task.result).summary || 'No summary available'}</p>
      </div>
    ` : ''}

    <div class="task-footer">
      <div class="task-agent">
        <img src="${avatarUrl}" alt="${task.assignee}">
        <span style="text-transform: capitalize;">${task.assignee}</span>
      </div>
      <span class="task-depth">Depth: ${task.delegation_depth}/${task.max_retries}</span>
    </div>
  `;

  // Click to show full result in a simple alert (for now)
  div.addEventListener('click', () => {
    if (task.result) {
      const res = JSON.parse(task.result);
      let message = `【${task.title}】\n\n■ AI要約:\n${res.summary}\n`;
      
      if (res.payload && Object.keys(res.payload).length > 0) {
        message += `\n■ 詳細データ (Payload):\n${JSON.stringify(res.payload, null, 2)}\n`;
      }
      
      message += `\n■ アクション: ${res.action}`;
      alert(message);
    }
  });

  return div;
}

// Initial fetch
fetchTasks();

// Poll the API every 3 seconds to keep the board auto-updating
setInterval(fetchTasks, 3000);

// --- Modal Logic ---
const modal = document.getElementById('task-modal');
const btnNewTask = document.querySelector('md-filled-button');
const btnClose = document.getElementById('close-modal');
const btnCancel = document.getElementById('btn-cancel-task');
const form = document.getElementById('task-form');

btnNewTask.addEventListener('click', () => modal.showModal());
btnClose.addEventListener('click', () => modal.close());
btnCancel.addEventListener('click', () => modal.close());

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const title = document.getElementById('task-title').value;
  const assignee = document.getElementById('task-assignee').value;
  const description = document.getElementById('task-desc').value;
  
  const submitBtn = form.querySelector('.btn-submit');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Deploying...';
  submitBtn.disabled = true;
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, assignee, description })
    });
    
    if (!res.ok) throw new Error('Failed to create task');
    
    // Success
    form.reset();
    modal.close();
    fetchTasks(); // instantly refresh board
  } catch (error) {
    alert(error.message);
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});
