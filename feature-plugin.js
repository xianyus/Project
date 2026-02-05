/**
 * feature-plugin.js
 * 整合功能：全局搜尋、截止日警示、子任務清單、深色模式
 * [v2.1 更新]：修正深色模式下「設定視窗」的配色對比度問題
 */

// ==========================================
// 1. 全局搜尋與篩選 (Search & Filter)
// ==========================================
function initSearchUI() {
    const navRight = document.querySelector('nav .flex.items-center.gap-3');
    if (navRight && !document.getElementById('searchInput')) {
        const searchContainer = document.createElement('div');
        searchContainer.className = "relative hidden md:block mr-2";
        searchContainer.innerHTML = `
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input type="text" id="searchInput" oninput="window.filterCards()" placeholder="搜尋關鍵字..." 
                   class="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 transition-all w-40 focus:w-60">
        `;
        navRight.insertBefore(searchContainer, navRight.firstElementChild);
    }
}

window.filterCards = function() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.card-item');
    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(query) ? 'block' : 'none';
    });
};

// ==========================================
// 2. 截止日期顏色警示 (Visual Due Date Alerts)
// ==========================================
window.getDueDateStyle = function(dateStr, isDone) {
    if (isDone) return 'bg-green-100 text-green-700 border-green-200'; // 已完成
    if (!dateStr) return 'bg-slate-100 text-slate-500'; // 無日期

    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(dateStr);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'bg-red-100 text-red-600 font-bold border-red-200 animate-pulse'; // 已過期 (紅 + 閃爍)
    if (diffDays <= 2) return 'bg-orange-100 text-orange-600 font-bold border-orange-200'; // 即將到期 (橘)
    return 'bg-slate-100 text-slate-600'; // 未來 (灰)
};

// ==========================================
// 3. 子任務清單 (Checklist)
// ==========================================
window.renderChecklistUI = function(listId, cardId) {
    // 這裡需要依賴主程式的 lists 變數，若 lists 未定義則跳過
    if (typeof lists === 'undefined') return;
    
    // 尋找卡片邏輯 (兼容多層級與單層級資料結構)
    let card = null;
    let list = null;
    
    // 嘗試從全域 lists 尋找
    list = lists.find(l => l.id === listId);
    if (list) {
        card = list.cards.find(c => c.id === cardId);
    }
    
    if (!card) return;
    if (!card.checklist) card.checklist = [];

    const container = document.getElementById('checklistContainer');
    if (!container) return;

    // 計算進度
    const total = card.checklist.length;
    const done = card.checklist.filter(i => i.done).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    container.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <label class="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <i class="fa-solid fa-list-check"></i> 待辦清單 (${done}/${total})
            </label>
            <button onclick="deleteCheckedItems('${listId}', '${cardId}')" class="text-[10px] text-slate-400 hover:text-red-500 underline">清除已完成</button>
        </div>
        
        <div class="w-full bg-slate-200 rounded-full h-1.5 mb-4 overflow-hidden">
            <div class="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
        </div>

        <div class="space-y-2 mb-3">
            ${card.checklist.map((item, index) => `
                <div class="flex items-start gap-2 group">
                    <input type="checkbox" ${item.done ? 'checked' : ''} 
                           onchange="toggleCheckItem('${listId}', '${cardId}', ${index})"
                           class="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer">
                    <span class="flex-1 text-sm ${item.done ? 'line-through text-slate-400' : 'text-slate-700'} break-all">${item.text}</span>
                    <button onclick="deleteCheckItem('${listId}', '${cardId}', ${index})" class="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            `).join('')}
        </div>

        <div class="flex gap-2">
            <input type="text" id="newCheckInput" placeholder="新增子任務..." 
                   class="flex-1 border rounded-lg px-3 py-1.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                   onkeydown="if(event.key === 'Enter') addCheckItem('${listId}', '${cardId}')">
            <button onclick="addCheckItem('${listId}', '${cardId}')" class="bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-bold">新增</button>
        </div>
    `;
};

window.addCheckItem = function(lid, cid) {
    const input = document.getElementById('newCheckInput');
    const text = input.value.trim();
    if (!text) return;
    
    // 獲取卡片 (需確保 lists 可訪問)
    if (typeof lists === 'undefined') return;
    const card = lists.find(l => l.id === lid)?.cards.find(c => c.id === cid);
    if (!card) return;

    if (!card.checklist) card.checklist = [];
    
    card.checklist.push({ text: text, done: false });
    input.value = '';
    
    if (typeof saveAll === 'function') saveAll(); 
    renderChecklistUI(lid, cid);
};

window.toggleCheckItem = function(lid, cid, index) {
    if (typeof lists === 'undefined') return;
    const card = lists.find(l => l.id === lid)?.cards.find(c => c.id === cid);
    if (!card) return;

    card.checklist[index].done = !card.checklist[index].done;
    if (typeof saveAll === 'function') saveAll();
    renderChecklistUI(lid, cid);
};

window.deleteCheckItem = function(lid, cid, index) {
    if (typeof lists === 'undefined') return;
    const card = lists.find(l => l.id === lid)?.cards.find(c => c.id === cid);
    if (!card) return;

    card.checklist.splice(index, 1);
    if (typeof saveAll === 'function') saveAll();
    renderChecklistUI(lid, cid);
};

window.deleteCheckedItems = function(lid, cid) {
    if (typeof lists === 'undefined') return;
    const card = lists.find(l => l.id === lid)?.cards.find(c => c.id === cid);
    if (!card) return;

    card.checklist = card.checklist.filter(i => !i.done);
    if (typeof saveAll === 'function') saveAll();
    renderChecklistUI(lid, cid);
};

// ==========================================
// 4. 深色模式 (Dark Mode)
// ==========================================
function initDarkMode() {
    // 注入 CSS 變數
    const style = document.createElement('style');
    style.innerHTML = `
        body.dark-mode { background-color: #020617 !important; color: #e2e8f0; }
        
        /* 基礎 UI 深色化 */
        body.dark-mode nav, 
        body.dark-mode #dashboardPage, 
        body.dark-mode #sidebar { 
            background-color: #020617 !important; 
            border-color: #1e293b !important; 
        }
        
        /* 主看板背景 */
        body.dark-mode #mainApp {
            background-color: #020617 !important; 
        }

        /* 文字顏色調整 */
        body.dark-mode .text-slate-700 { color: #f1f5f9 !important; } /* 標題亮白 */
        body.dark-mode .text-slate-600 { color: #cbd5e1 !important; } /* 次要文字淺灰 */
        body.dark-mode .text-slate-500 { color: #94a3b8 !important; } /* 輔助文字灰 */
        body.dark-mode .text-slate-400 { color: #64748b !important; } 

        /* 列表容器 */
        body.dark-mode .list-container { 
            background-color: #0f172a !important; /* 深藍黑 */
            border-color: #1e293b !important; 
            box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.3) !important;
        }

        /* 卡片 */
        body.dark-mode .card-item { 
            background-color: #1e293b !important; 
            border-color: #334155 !important; 
            color: #fff !important; 
        }
        body.dark-mode .card-item.card-done {
            background-color: #0f172a !important; 
            opacity: 0.5;
        }
        
        /* Modal 通用設定 */
        body.dark-mode .bg-white { 
            background-color: #1e293b !important; 
            color: #fff !important; 
            border-color: #334155 !important; 
        }
        body.dark-mode .bg-slate-50 {
            background-color: #0f172a !important; 
            border-color: #1e293b !important;
        }

        /* [新增修正] 設定頁面 (Settings Modal) 專屬修正 */
        body.dark-mode #settingModal .bg-indigo-50 {
            background-color: #172554 !important; /* 資料備份區塊：深靛藍 */
            border-color: #1e1b4b !important;
        }
        body.dark-mode #settingModal .text-indigo-500 {
            color: #818cf8 !important; /* 淺紫亮色文字，確保可讀 */
        }
        /* 修正列表項目 (plugin.js 生成的 bg-gray-50) */
        body.dark-mode .bg-gray-50 {
            background-color: #0f172a !important; 
            color: #e2e8f0 !important;
            border: 1px solid #334155 !important;
        }
        body.dark-mode .text-indigo-600 {
            color: #818cf8 !important; /* 標籤文字調亮 */
        }

        /* 按鈕與輸入框 */
        body.dark-mode button.bg-slate-100, 
        body.dark-mode .board-tile.bg-slate-200,
        body.dark-mode input.bg-slate-50 { 
            background-color: #1e293b !important; 
            color: #94a3b8 !important; 
            border-color: #334155 !important; 
        }
        body.dark-mode button.bg-slate-100:hover,
        body.dark-mode .board-tile.bg-slate-200:hover { 
            background-color: #334155 !important; 
            color: #fff !important; 
        }
        
        /* 編輯器與輸入框通用 */
        body.dark-mode input, body.dark-mode textarea, body.dark-mode select, 
        body.dark-mode #editor-container { 
            background-color: #0f172a !important; 
            border-color: #334155 !important; 
            color: #fff !important; 
        }
        body.dark-mode .ql-toolbar { 
            background-color: #1e293b !important; 
            border-color: #334155 !important; 
        }
        body.dark-mode .ql-stroke { stroke: #cbd5e1 !important; }
        body.dark-mode .ql-picker { color: #cbd5e1 !important; }
        
        /* 捲軸深色化 */
        body.dark-mode ::-webkit-scrollbar-track { background: #0f172a; }
        body.dark-mode ::-webkit-scrollbar-thumb { background: #334155; border: 1px solid #0f172a; }
        body.dark-mode ::-webkit-scrollbar-thumb:hover { background: #475569; }
    `;
    document.head.appendChild(style);

    // 注入按鈕
    const navRight = document.querySelector('nav .flex.items-center.gap-3'); // 這裡需要更精確的選擇器，避免選到側邊欄
    const boardNav = document.getElementById('boardNav'); // 優先注入到看板導覽列
    
    // 如果找不到 boardNav (例如在大廳)，嘗試找通用 nav
    const targetNav = boardNav ? boardNav.querySelector('.flex.items-center.gap-3') : document.querySelector('nav .flex.items-center.gap-3');

    if (targetNav && !document.getElementById('darkModeBtn')) {
        const btn = document.createElement('button');
        btn.id = 'darkModeBtn';
        btn.className = "bg-slate-100 hover:bg-slate-200 text-slate-500 p-2.5 rounded-lg border border-slate-200 transition-colors";
        btn.onclick = toggleDarkMode;
        btn.innerHTML = `<i class="fa-solid fa-moon text-lg"></i>`; 
        
        // 插入在最前面 (搜尋框之前，或者其他按鈕之前)
        targetNav.insertBefore(btn, targetNav.firstElementChild);
    }

    // 讀取設定
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon(true);
    }
}

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateDarkModeIcon(isDark);
}

function updateDarkModeIcon(isDark) {
    const btn = document.getElementById('darkModeBtn');
    if (btn) btn.innerHTML = isDark ? `<i class="fa-solid fa-sun text-yellow-400 text-lg"></i>` : `<i class="fa-solid fa-moon text-slate-500 text-lg"></i>`;
}

// ==========================================
// 初始化所有功能
// ==========================================
// 使用 defer 或 DOMContentLoaded 確保 DOM 載入
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initSearchUI();
        initDarkMode();
    });
} else {
    initSearchUI();
    initDarkMode();
}