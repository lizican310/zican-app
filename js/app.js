// 应用状态
let currentUser = localStorage.getItem('zican-user') || '';

// DOM 元素
const loginScreen = document.getElementById('login-screen');
const mainScreen = document.getElementById('main-screen');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const usernameInput = document.getElementById('username');
const currentUserSpan = document.getElementById('current-user');
const addMemberBtn = document.getElementById('add-member-btn');
const newMemberInput = document.getElementById('new-member-name');
const memberList = document.getElementById('member-list');
const addTaskBtn = document.getElementById('add-task-btn');
const newTaskInput = document.getElementById('new-task-title');
const taskAssigneeSelect = document.getElementById('task-assignee');
const taskList = document.getElementById('task-list');

// 初始化
async function init() {
    if (currentUser) {
        showMainScreen();
    }

    await loadMembers();
    await loadTasks();
    setupRealtime();
}

// 显示主界面
function showMainScreen() {
    loginScreen.classList.remove('active');
    mainScreen.classList.add('active');
    currentUserSpan.textContent = currentUser;
}

// 登录
loginBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (!username) {
        alert('请输入你的名字');
        return;
    }
    currentUser = username;
    localStorage.setItem('zican-user', username);
    showMainScreen();
    init();
});

// 退出登录
logoutBtn.addEventListener('click', () => {
    currentUser = '';
    localStorage.removeItem('zican-user');
    mainScreen.classList.remove('active');
    loginScreen.classList.add('active');
});

// 加载组员
async function loadMembers() {
    const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('加载组员失败:', error);
        return;
    }

    renderMembers(data);
    updateAssigneeSelect(data);
}

// 渲染组员列表
function renderMembers(members) {
    memberList.innerHTML = '';
    members.forEach(member => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="member-name">${member.name}</span>
            <button class="btn danger" onclick="deleteMember(${member.id})">删除</button>
        `;
        memberList.appendChild(li);
    });
}

// 更新任务分配下拉框
function updateAssigneeSelect(members) {
    taskAssigneeSelect.innerHTML = '<option value="">未分配</option>';
    members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.name;
        option.textContent = member.name;
        taskAssigneeSelect.appendChild(option);
    });
}

// 添加组员
addMemberBtn.addEventListener('click', async () => {
    const name = newMemberInput.value.trim();
    if (!name) {
        alert('请输入组员名字');
        return;
    }

    const { error } = await supabase
        .from('members')
        .insert([{ name }]);

    if (error) {
        if (error.code === '23505') {
            alert('组员已存在');
        } else {
            console.error('添加组员失败:', error);
        }
        return;
    }

    newMemberInput.value = '';
});

// 删除组员
async function deleteMember(id) {
    if (!confirm('确定要删除这个组员吗？')) return;

    const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('删除组员失败:', error);
    }
}

// 加载任务
async function loadTasks() {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('加载任务失败:', error);
        return;
    }

    renderTasks(data);
}

// 渲染任务列表
function renderTasks(tasks) {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';
        li.innerHTML = `
            <div class="task-info">
                <div class="task-title">${task.title}</div>
                ${task.assignee ? `<div class="task-assignee">👤 ${task.assignee}</div>` : ''}
                <div class="task-assignee">创建者: ${task.created_by}</div>
            </div>
            <div class="task-actions">
                <button class="btn small" onclick="toggleTask(${task.id}, ${!task.completed})">
                    ${task.completed ? '恢复' : '完成'}
                </button>
                <button class="btn danger" onclick="deleteTask(${task.id})">删除</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// 添加任务
addTaskBtn.addEventListener('click', async () => {
    const title = newTaskInput.value.trim();
    if (!title) {
        alert('请输入任务标题');
        return;
    }

    const assignee = taskAssigneeSelect.value;
    const { error } = await supabase
        .from('tasks')
        .insert([{
            title,
            assignee: assignee || null,
            completed: false,
            created_by: currentUser
        }]);

    if (error) {
        console.error('添加任务失败:', error);
        return;
    }

    newTaskInput.value = '';
});

// 切换任务状态
async function toggleTask(id, completed) {
    const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', id);

    if (error) {
        console.error('更新任务失败:', error);
    }
}

// 删除任务
async function deleteTask(id) {
    if (!confirm('确定要删除这个任务吗？')) return;

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('删除任务失败:', error);
    }
}

// 设置实时订阅
function setupRealtime() {
    supabase
        .channel('members-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
            loadMembers();
        })
        .subscribe();

    supabase
        .channel('tasks-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
            loadTasks();
        })
        .subscribe();
}

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', init);

// 按回车键登录
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loginBtn.click();
    }
});

// 按回车键添加组员
newMemberInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addMemberBtn.click();
    }
});

// 按回车键添加任务
newTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTaskBtn.click();
    }
});
