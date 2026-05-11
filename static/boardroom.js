// 6名の巨神のアバターシードとカラーマッピング
const AGENT_CONFIG = {
  kikou: { color: 'kikou', label: '機巧' },
  shinbou: { color: 'shinbou', label: '深謀' },
  hyoujin: { color: 'hyoujin', label: '兵神' },
  zero: { color: 'zero', label: '零' },
  librarian: { color: 'librarian', label: '司書' },
  shingun: { color: 'shingun', label: '進軍' }
};

/**
 * SERVER API SYNC
 */
async function syncTasks() {
  try {
    const response = await fetch('/api/status');
    const data = await response.json();
    
    if (data.status === 'success') {
      const serverTasks = data.tasks || [];
      const localTasks = JSON.parse(localStorage.getItem('AGY_USER_TASKS') || '[]');
      
      const allTasks = [...serverTasks];
      
      // サーバーに未反映のローカルタスク（Optimistic UI用）をマージ
      localTasks.forEach(lt => {
        if (!allTasks.find(st => st.id === lt.id)) {
          allTasks.push(lt);
        }
      });
      
      renderBoard(allTasks);
    }
  } catch (e) {
    console.error("Sync failed, falling back to local storage:", e);
    const localTasks = JSON.parse(localStorage.getItem('AGY_USER_TASKS') || '[]');
    renderBoard(localTasks);
  }
}

function renderBoard(tasks) {
  const lists = {
    'TODO': document.getElementById('list-todo'),
    'IN_PROGRESS': document.getElementById('list-progress'),
    'REVIEW': document.getElementById('list-review'),
    'DONE': document.getElementById('list-done'),
    'ESCALATED': document.getElementById('list-review')
  };

  const counts = {
    'TODO': document.getElementById('count-todo'),
    'IN_PROGRESS': document.getElementById('count-progress'),
    'REVIEW': document.getElementById('count-review'),
    'DONE': document.getElementById('count-done')
  };

  Object.values(lists).forEach(list => { if(list) list.innerHTML = ''; });
  const columnCounts = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 };

  // 日付順にソート（新しいものが上）
  tasks.sort((a, b) => new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now()));

  tasks.forEach(task => {
    const card = createTaskCard(task);
    const targetList = lists[task.status];
    if (targetList) {
      targetList.appendChild(card);
      const colKey = (task.status === 'ESCALATED' || task.status === 'REVIEW') ? 'REVIEW' : task.status;
      if(columnCounts[colKey] !== undefined) columnCounts[colKey]++;
    }
  });

  Object.keys(counts).forEach(key => {
    if(counts[key]) counts[key].textContent = columnCounts[key];
  });
}

function createTaskCard(task) {
  const div = document.createElement('div');
  div.className = 'task-card';
  const agent = AGENT_CONFIG[task.assignee] || { color: 'kikou', label: task.assignee };
  div.style.borderLeft = `4px solid var(--color-${agent.color})`;

  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${task.assignee}&backgroundColor=transparent`;

  div.innerHTML = `
    <div class="task-title">${task.title}</div>
    <div class="task-desc">${task.description}</div>
    <div class="task-footer">
      <div class="task-agent-chip">
        <img src="${avatarUrl}" alt="${agent.label}">
        <span>${agent.label}</span>
      </div>
      <div class="task-id">#${String(task.id || 'new').substring(0, 4)}</div>
    </div>
  `;
  return div;
}

// Modal & Form Logic
const modal = document.getElementById('task-modal');
const btnNewTask = document.getElementById('btn-new-task');
const btnCloseModal = document.getElementById('close-modal');
const btnCancel = document.getElementById('btn-cancel-task');
const taskForm = document.getElementById('task-form');

btnNewTask.onclick = () => modal.showModal();
btnCloseModal.onclick = () => modal.close();
btnCancel.onclick = () => modal.close();

taskForm.onsubmit = async (e) => {
  e.preventDefault();
  
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-desc').value;
  
  // サーバーに送る指示文字列（タイトルと詳細を結合）
  const fullInstruction = title + (description ? "\n" + description : "");

  const btn = taskForm.querySelector('.btn-submit');
  const originalText = btn.textContent;
  btn.textContent = 'TRANSMITTING...';

  try {
    // サーバーのAPIエンドポイントに直接POST
    const res = await fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instruction: fullInstruction })
    });
    
    const data = await res.json();
    
    if(data.status === 'success') {
      btn.textContent = 'DEPLOYED!';
      
      // LocalStorageにも念のため保存（Optimistic UI）
      const newTask = {
        id: 'user-' + Date.now(),
        title: "緊急ミッション受領",
        description: fullInstruction,
        assignee: document.getElementById('task-assignee').value,
        status: 'TODO',
        created_at: new Date().toISOString()
      };
      const localTasks = JSON.parse(localStorage.getItem('AGY_USER_TASKS') || '[]');
      localTasks.push(newTask);
      localStorage.setItem('AGY_USER_TASKS', JSON.stringify(localTasks));

      setTimeout(() => {
        btn.textContent = originalText;
        modal.close();
        taskForm.reset();
        syncTasks(); // ボードを再描画
      }, 800);
      
    } else {
      btn.textContent = 'FAILED';
      console.error(data.message);
      setTimeout(() => btn.textContent = originalText, 2000);
    }
    
  } catch(e) {
    console.error("Network error:", e);
    btn.textContent = 'NETWORK ERROR';
    setTimeout(() => btn.textContent = originalText, 2000);
  }
};

// Start Sync (3秒に1回、自動で最新データをサーバーから取得)
syncTasks();
setInterval(syncTasks, 3000);
