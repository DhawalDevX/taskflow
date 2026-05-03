// ==================== STATE ====================
const API = '';
let currentUser = null;
let currentProjectId = null;
let allUsers = [];
let allProjectTasks = [];
let myTasks = []; // State for my tasks to fix edit bug

// ==================== TOAST ====================
function showToast(msg, type = '') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#6366f1;color:#fff;padding:12px 24px;border-radius:12px;z-index:9999;font-weight:600;display:none;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.1);transition:all 0.3s ease;';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.background = type === 'error' ? '#ef4444' : '#6366f1';
    toast.style.display = 'block';
    toast.style.animation = 'fadeIn 0.3s ease-out';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// ==================== INIT ====================
window.onload = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) { window.location.href = '/login.html'; return; }
    currentUser = JSON.parse(userData);

    const nameEl = document.getElementById('user-name');
    const roleEl = document.getElementById('user-role');
    const avatarEl = document.getElementById('user-avatar');
    const welcomeEl = document.getElementById('welcome-name');

    if (nameEl) nameEl.textContent = currentUser.name;
    if (roleEl) roleEl.textContent = currentUser.role;
    if (avatarEl) avatarEl.textContent = currentUser.name.charAt(0).toUpperCase();
    if (welcomeEl) welcomeEl.textContent = currentUser.name;

    if (currentUser.role === 'ADMIN') {
        const navAdmin = document.getElementById('nav-admin');
        if (navAdmin) navAdmin.style.display = 'flex';
    }
    await loadDashboard();
    await loadUsers();
};

// ==================== HELPERS ====================
const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

async function apiFetch(url, opts = {}) {
    opts.headers = { ...authHeader(), ...(opts.headers || {}) };
    try {
        const res = await fetch(API + url, opts);
        if (res.status === 401) { logout(); return null; }
        return res;
    } catch (err) {
        showToast('Network error', 'error');
        return null;
    }
}

function showPage(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const page = document.getElementById('page-' + name);
    if (page) page.classList.add('active');

    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const navMap = { dashboard: 0, projects: 1, tasks: 2, admin: 3 };
    if (navMap[name] !== undefined && navItems[navMap[name]]) {
        navItems[navMap[name]].classList.add('active');
    }

    if (name === 'dashboard') loadDashboard();
    else if (name === 'projects') loadProjects();
    else if (name === 'tasks') loadMyTasks();
    else if (name === 'admin') loadAdmin();
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function logout() { localStorage.clear(); window.location.href = '/login.html'; }

function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ==================== DASHBOARD ====================
async function loadDashboard() {
    const res = await apiFetch('/api/dashboard');
    if (!res) return;
    const data = await res.json();
    document.getElementById('stat-projects').textContent = data.totalProjects || 0;
    document.getElementById('stat-todo').textContent = data.todoTasks || 0;
    document.getElementById('stat-inprogress').textContent = data.inProgressTasks || 0;
    document.getElementById('stat-done').textContent = data.doneTasks || 0;
    document.getElementById('stat-overdue').textContent = data.overdueTasks || 0;

    const recentEl = document.getElementById('recent-tasks');
    if (!data.recentTasks || data.recentTasks.length === 0) {
        recentEl.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-dim);">No recent activity.</div>`;
        return;
    }
    recentEl.innerHTML = data.recentTasks.map(t => renderTaskItem(t, false)).join('');
}

// ==================== USERS ====================
async function loadUsers() {
    const res = await apiFetch('/api/projects/users');
    if (!res) return;
    allUsers = await res.json();
}

// ==================== PROJECTS ====================
async function loadProjects() {
    const res = await apiFetch('/api/projects');
    if (!res) return;
    const projects = await res.json();
    const grid = document.getElementById('projects-grid');
    if (!projects.length) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:60px; background:var(--bg-card); border-radius:16px; border:1px solid var(--border);">No projects found. Click "New Project" to start.</div>`;
        return;
    }
    grid.innerHTML = projects.map(p => renderProjectCard(p)).join('');
}

function renderProjectCard(p) {
    const done = p.doneTasks || 0;
    const total = p.totalTasks || 0;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const canEdit = currentUser.role === 'ADMIN' || p.createdBy === currentUser.name;

    return `
    <div class="stat-card" style="cursor:pointer;" onclick="openProjectDetail(${p.id})">
        <div style="font-size:18px; font-weight:700; color:#fff; margin-bottom:8px">${escHtml(p.name)}</div>
        <div style="font-size:14px; color:var(--text-dim); margin-bottom:16px; line-height:1.5; height: 42px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${escHtml(p.description || 'No description provided')}</div>
        <div style="font-size:13px; color:var(--text-dim); margin-bottom:12px">Created by <span style="color:var(--primary); font-weight:600">${escHtml(p.createdBy)}</span></div>

        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:16px">
            ${(p.members || []).slice(0, 3).map(m => `
                <span style="background:rgba(255,255,255,0.05); border:1px solid var(--border); border-radius:6px; padding:2px 8px; font-size:11px; color:#fff">
                    ${escHtml(m.name)}
                </span>`).join('')}
            ${p.members && p.members.length > 3 ? `<span style="font-size:11px; color:var(--text-dim)">+${p.members.length - 3} more</span>` : ''}
        </div>

        <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; margin-bottom:10px; overflow:hidden">
            <div style="height:100%; width:${pct}%; background:var(--primary); box-shadow: 0 0 10px var(--primary-glow); transition:width 0.6s ease"></div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-dim); margin-bottom:20px">
            <span>${done}/${total} tasks completed</span>
            <span>${pct}%</span>
        </div>

        <div style="display:flex; gap:8px" onclick="event.stopPropagation()">
            <button class="btn btn-outline" style="padding:6px 12px; font-size:12px" onclick="openProjectDetail(${p.id})">View</button>
            ${canEdit ? `
                <button class="btn btn-outline" style="padding:6px 12px; font-size:12px" onclick="editProject(${p.id}, event)">Edit</button>
                <button class="btn btn-primary" style="padding:6px 12px; font-size:12px; background:#ef4444; box-shadow:none" onclick="deleteProject(${p.id}, event)">Delete</button>
            ` : ''}
        </div>
    </div>`;
}

function openProjectDetail(id) {
    currentProjectId = id;
    showPage('project-detail');
    loadProjectTasks(id);
}

async function loadProjectTasks(id) {
    const pRes = await apiFetch('/api/projects/' + id);
    if (!pRes) return;
    const project = await pRes.json();
    document.getElementById('detail-project-name').textContent = project.name;
    document.getElementById('detail-project-desc').textContent = project.description || 'No description';
    document.getElementById('proj-todo').textContent = project.todoTasks || 0;
    document.getElementById('proj-inprogress').textContent = project.inProgressTasks || 0;
    document.getElementById('proj-done').textContent = project.doneTasks || 0;

    const sel = document.getElementById('task-assignee');
    if (sel) {
        sel.innerHTML = '<option value="">— Unassigned —</option>';
        (project.members || []).forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = `${m.name} [${m.role}]`;
            sel.appendChild(opt);
        });
    }

    const res = await apiFetch('/api/tasks/project/' + id);
    if (!res) return;
    allProjectTasks = await res.json();
    renderProjectTaskList(allProjectTasks);
}

function filterTasks() {
    const status = document.getElementById('task-filter-status').value;
    const filtered = status ? allProjectTasks.filter(t => t.status === status) : allProjectTasks;
    renderProjectTaskList(filtered);
}

function renderProjectTaskList(tasks) {
    const el = document.getElementById('project-tasks');
    if (!tasks.length) {
        el.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-dim);">No tasks found in this project.</div>`;
        return;
    }
    el.innerHTML = tasks.map(t => renderTaskItem(t, true)).join('');
}

// ==================== TASK ITEM ====================
function renderTaskItem(t, showActions) {
    const dueDateFormatted = t.dueDate ? formatDate(t.dueDate) : null;
    const statusColors = {
        'TODO': { bg: 'rgba(251,191,36,0.1)', text: '#fbbf24' },
        'IN_PROGRESS': { bg: 'rgba(56,189,248,0.1)', text: '#38bdf8' },
        'DONE': { bg: 'rgba(74,222,128,0.1)', text: '#4ade80' }
    };
    const style = statusColors[t.status] || { bg: 'rgba(255,255,255,0.1)', text: '#fff' };
    const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE';

    return `
    <div style="background:var(--bg-card); border:1px solid ${isOverdue ? 'var(--danger)' : 'var(--border)'}; border-radius:16px; padding:20px; margin-bottom:16px; backdrop-filter:blur(10px)">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; gap:16px">
            <div>
                <div style="font-weight:700; font-size:16px; color:#fff; margin-bottom:4px">
                    <i class="fas fa-thumbtack" style="color:var(--primary); font-size:14px; margin-right:8px"></i> ${escHtml(t.title)}
                    ${isOverdue ? '<span style="color:var(--danger); font-size:10px; margin-left:8px; font-weight:800">[OVERDUE]</span>' : ''}
                </div>
                ${t.description ? `<div style="color:var(--text-dim); font-size:14px; margin-top:8px; line-height:1.5">${escHtml(t.description)}</div>` : ''}
            </div>
            <span style="padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; background:${style.bg}; color:${style.text}; border:1px solid ${style.text}44">
                ${t.status.replace('_', ' ')}
            </span>
        </div>

        <div style="display:flex; gap:20px; flex-wrap:wrap; font-size:12px; color:var(--text-dim); border-top:1px solid var(--border); padding-top:16px; margin-top:16px">
            <span title="Assigned To"><i class="fas fa-user" style="margin-right:6px"></i> Assigned: ${escHtml(t.assignedTo || 'Unassigned')}</span>
            <span title="Assigned By"><i class="fas fa-user-shield" style="margin-right:6px"></i> By: ${escHtml(t.createdBy)}</span>
            <span title="Due Date" style="${isOverdue ? 'color:var(--danger); font-weight:700' : ''}"><i class="fas fa-calendar-alt" style="margin-right:6px"></i> Due: ${dueDateFormatted || 'No deadline'}</span>
        </div>

        ${showActions ? `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; padding-top:16px; border-top:1px dashed var(--border)">
            <div style="display:flex; gap:8px">
                <select onchange="quickStatus(${t.id}, this.value)" style="padding:6px 12px; border-radius:8px; background:rgba(15,23,42,0.5); border:1px solid var(--border); color:#fff; font-size:12px; cursor:pointer">
                    <option value="TODO" ${t.status === 'TODO' ? 'selected' : ''}>To Do</option>
                    <option value="IN_PROGRESS" ${t.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
                    <option value="DONE" ${t.status === 'DONE' ? 'selected' : ''}>Done</option>
                </select>
                <button class="btn btn-outline" style="padding:6px 12px; font-size:12px" onclick="editTask(${t.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </div>
            <button class="btn" style="padding:6px 12px; font-size:12px; color:#ef4444; background:transparent" onclick="deleteTask(${t.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        ` : ''}
    </div>`;
}

async function quickStatus(taskId, status) {
    const res = await apiFetch('/api/tasks/' + taskId + '/status', { method: 'PATCH', body: JSON.stringify({ status }) });
    if (res && res.ok) {
        if (currentProjectId) await loadProjectTasks(currentProjectId);
        await loadMyTasks();
        await loadDashboard();
        showToast('Status updated', 'success');
    }
}

// ==================== PROJECT MODAL ====================
async function openProjectModal(projectId = null) {
    if (allUsers.length === 0) await loadUsers();
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    document.getElementById('project-modal-title').textContent = projectId ? 'Edit Project' : 'New Project';
    document.getElementById('edit-project-id').value = projectId || '';
    document.getElementById('proj-name').value = '';
    document.getElementById('proj-desc').value = '';

    const box = document.getElementById('members-checkboxes');
    if (box) {
        if (allUsers.length === 0) {
            box.innerHTML = `<div style="color:var(--text-dim); padding:10px">No users found</div>`;
        } else {
            box.innerHTML = allUsers.map(u => `
                <div style="display:flex; align-items:center; gap:12px; padding:10px; border-bottom:1px solid var(--border)">
                    <input type="checkbox" class="member-cb" value="${u.id}" id="cb-${u.id}" style="width:16px; height:16px; accent-color:var(--primary)">
                    <label for="cb-${u.id}" style="cursor:pointer; flex:1; font-size:14px; color:#fff">
                        ${escHtml(u.name)} <span style="color:var(--primary); font-size:12px">[${u.role}]</span>
                    </label>
                </div>
            `).join('');
        }
    }

    if (projectId) {
        const res = await apiFetch('/api/projects/' + projectId);
        if (res && res.ok) {
            const p = await res.json();
            document.getElementById('proj-name').value = p.name;
            document.getElementById('proj-desc').value = p.description || '';
            const memberIds = (p.members || []).map(m => String(m.id));
            document.querySelectorAll('.member-cb').forEach(cb => { cb.checked = memberIds.includes(cb.value); });
        }
    }

    modal.style.display = 'flex';
}

async function saveProject() {
    const id = document.getElementById('edit-project-id').value;
    const memberIds = [...document.querySelectorAll('.member-cb:checked')].map(cb => parseInt(cb.value));
    const body = {
        name: document.getElementById('proj-name').value,
        description: document.getElementById('proj-desc').value,
        memberIds
    };
    if (!body.name) { showToast('Project name required', 'error'); return; }

    const res = await apiFetch(id ? '/api/projects/' + id : '/api/projects', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(body)
    });
    if (res && res.ok) {
        closeModal('project-modal');
        await loadProjects();
        showToast(id ? 'Project updated' : 'Project created', 'success');
    } else if (res) {
        const err = await res.json();
        showToast(err.error || 'Operation failed', 'error');
    }
}

async function editProject(id, event) {
    if (event) event.stopPropagation();
    await openProjectModal(id);
}

async function deleteProject(id, event) {
    if (event) event.stopPropagation();
    if (!confirm('Delete this project? All tasks will be deleted.')) return;
    const res = await apiFetch('/api/projects/' + id, { method: 'DELETE' });
    if (res && res.ok) {
        await loadProjects();
        showToast('Project deleted', 'success');
    }
}

// ==================== TASK MODAL ====================
function openTaskModal(taskId = null) {
    const modal = document.getElementById('task-modal');
    if (!modal) return;

    document.getElementById('task-modal-title').textContent = taskId ? 'Edit Task' : 'New Task';
    document.getElementById('edit-task-id').value = taskId || '';
    if (!taskId) {
        document.getElementById('task-title').value = '';
        document.getElementById('task-desc').value = '';
        document.getElementById('task-status').value = 'TODO';
        document.getElementById('task-priority').value = 'MEDIUM';
        document.getElementById('task-due').value = '';
        if (document.getElementById('task-assignee')) document.getElementById('task-assignee').value = '';
    }
    modal.style.display = 'flex';
}

async function editTask(id) {
    // Check in all possible lists to fix "Task not found"
    let task = allProjectTasks.find(t => t.id === id) || myTasks.find(t => t.id === id);

    if (!task) {
        const res = await apiFetch('/api/tasks/' + id);
        if (res && res.ok) task = await res.json();
    }

    if (!task) { showToast('Task not found', 'error'); return; }

    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-desc').value = task.description || '';
    document.getElementById('task-status').value = task.status;
    document.getElementById('task-priority').value = task.priority || 'MEDIUM';
    document.getElementById('task-due').value = task.dueDate ? task.dueDate.split('T')[0] : '';

    // Ensure project context is set if editing from My Tasks
    if (task.projectId) currentProjectId = task.projectId;

    // Re-load project users for the assignee dropdown if needed
    if (currentProjectId) {
        const pRes = await apiFetch('/api/projects/' + currentProjectId);
        if (pRes && pRes.ok) {
            const project = await pRes.json();
            const sel = document.getElementById('task-assignee');
            if (sel) {
                sel.innerHTML = '<option value="">— Unassigned —</option>';
                (project.members || []).forEach(m => {
                    const opt = document.createElement('option');
                    opt.value = m.id;
                    opt.textContent = `${m.name} [${m.role}]`;
                    if (m.id === task.assignedToId) opt.selected = true;
                    sel.appendChild(opt);
                });
            }
        }
    }

    document.getElementById('task-modal-title').textContent = 'Edit Task';
    document.getElementById('task-modal').style.display = 'flex';
}

async function saveTask() {
    const id = document.getElementById('edit-task-id').value;
    const assigneeVal = document.getElementById('task-assignee')?.value;
    const dueVal = document.getElementById('task-due').value;

    const body = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-desc').value,
        status: document.getElementById('task-status').value,
        priority: document.getElementById('task-priority').value,
        projectId: currentProjectId, // Ensure this is not null for Admins
        assignedToId: assigneeVal ? parseInt(assigneeVal) : null,
        dueDate: dueVal || null
    };

    if (!body.title) { showToast('Task title required', 'error'); return; }
    if (!body.projectId) { showToast('Project context missing', 'error'); return; }

    const url = id ? '/api/tasks/' + id : '/api/tasks';
    const method = id ? 'PUT' : 'POST';
    const res = await apiFetch(url, { method: method, body: JSON.stringify(body) });

    if (res && res.ok) {
        closeModal('task-modal');
        if (currentProjectId) await loadProjectTasks(currentProjectId);
        await loadMyTasks();
        await loadDashboard();
        showToast(id ? 'Task updated' : 'Task created', 'success');
    } else if (res) {
        const err = await res.json();
        showToast(err.error || 'Operation failed', 'error');
    }
}

async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    const res = await apiFetch('/api/tasks/' + id, { method: 'DELETE' });
    if (res && res.ok) {
        if (currentProjectId) await loadProjectTasks(currentProjectId);
        await loadMyTasks();
        await loadDashboard();
        showToast('Task deleted', 'success');
    }
}

// ==================== MY TASKS ====================
async function loadMyTasks() {
    const res = await apiFetch('/api/tasks/my');
    if (!res) return;
    myTasks = await res.json();
    const el = document.getElementById('my-tasks');
    if (!myTasks.length) {
        el.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-dim);">No tasks assigned to you.</div>`;
        return;
    }
    el.innerHTML = myTasks.map(t => renderTaskItem(t, true)).join('');
}

// ==================== ADMIN ====================
async function loadAdmin() {
    const res = await apiFetch('/api/projects/users');
    if (!res) return;
    const users = await res.json();
    const el = document.getElementById('admin-users');
    el.innerHTML = users.map(u => `
        <div style="background:var(--bg-card); border-radius:16px; padding:16px; margin-bottom:12px; display:flex; align-items:center; gap:16px; border:1px solid var(--border)">
            <div style="width:48px; height:48px; background:var(--primary); border-radius:12px; display:flex; align-items:center; justify-content:center; font-weight:700; color:#fff; font-size:18px">${u.name.charAt(0).toUpperCase()}</div>
            <div style="flex:1">
                <div style="font-weight:700; color:#fff">${escHtml(u.name)}</div>
                <div style="font-size:13px; color:var(--text-dim)">${escHtml(u.email)}</div>
            </div>
            <span style="padding:6px 14px; border-radius:20px; font-size:11px; font-weight:700; background:${u.role === 'ADMIN' ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)'}; color:${u.role === 'ADMIN' ? '#ef4444' : '#6366f1'}; border:1px solid currentColor">${u.role}</span>
        </div>
    `).join('');
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.style.display = 'none';
    });
});