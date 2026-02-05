/**
 * 獨立補丁：進階封存系統 (Advanced Archive Plugin)
 * 樣式更新：移至左側並與行事曆樣式同步
 */

let archivedCards = JSON.parse(localStorage.getItem('trello_archives')) || [];

function saveArchiveData() {
    localStorage.setItem('trello_archives', JSON.stringify(archivedCards));
}

// 注入「封存管理」按鈕到左側標題區
function injectArchiveButton() {
    const navLeft = document.querySelector('nav .flex.items-center.gap-6');
    
    if (navLeft && !document.getElementById('archive-nav-btn')) {
        const archiveBtn = document.createElement('button');
        archiveBtn.id = 'archive-nav-btn';
        archiveBtn.onclick = () => window.toggleArchiveModal();
        
        // 套用與行事曆按鈕完全一致的 CSS
        archiveBtn.className = "flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium";
        archiveBtn.innerHTML = `<i class="fa-solid fa-box-archive"></i><span>封存管理</span>`;
        
        // 插入到左側區域
        navLeft.appendChild(archiveBtn);
    }
}

// 確保在各種載入情境下都能正確注入
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectArchiveButton);
} else {
    injectArchiveButton();
}
// 二次保險，防止其他 JS 渲染延遲
setTimeout(injectArchiveButton, 500);

// 注入 Modal 結構 (如果不存在)
if (!document.getElementById('archiveModal')) {
    document.body.insertAdjacentHTML('beforeend', `
        <div id="archiveModal" class="hidden fixed inset-0 z-[100] modal-overlay flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
                <div class="p-6 border-b flex justify-between items-center bg-slate-50">
                    <div class="flex items-center gap-3">
                        <i class="fa-solid fa-box-archive text-indigo-600 text-xl"></i>
                        <h3 class="font-bold text-slate-700">封存卡片管理</h3>
                    </div>
                    <button onclick="window.toggleArchiveModal()" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-xl"></i></button>
                </div>
                <div class="p-4 bg-white border-b grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" id="archiveSearch" oninput="window.renderArchiveList()" placeholder="搜尋卡片內容..." class="md:col-span-2 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <input type="date" id="archiveDateStart" onchange="window.renderArchiveList()" class="px-4 py-2 border rounded-xl text-sm">
                    <input type="date" id="archiveDateEnd" onchange="window.renderArchiveList()" class="px-4 py-2 border rounded-xl text-sm">
                </div>
                <div id="archiveList" class="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 no-scrollbar"></div>
            </div>
        </div>
    `);
}

window.toggleArchiveModal = function() {
    const modal = document.getElementById('archiveModal');
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) window.renderArchiveList();
};

window.renderArchiveList = function() {
    const listEl = document.getElementById('archiveList');
    if (!listEl) return;
    
    const search = document.getElementById('archiveSearch').value.toLowerCase();
    const start = document.getElementById('archiveDateStart').value;
    const end = document.getElementById('archiveDateEnd').value;

    let filtered = archivedCards.filter(card => {
        const matchesSearch = card.text.toLowerCase().includes(search) || (card.owner && card.owner.toLowerCase().includes(search));
        const cardDate = card.archivedAt ? card.archivedAt.split('T')[0] : "";
        const matchesStart = !start || cardDate >= start;
        const matchesEnd = !end || cardDate <= end;
        return matchesSearch && matchesStart && matchesEnd;
    });

    if (filtered.length === 0) {
        listEl.innerHTML = `<div class="text-center py-20 text-slate-400"><i class="fa-solid fa-box-open text-4xl mb-3 block"></i>無符合條件的封存內容</div>`;
        return;
    }

    listEl.innerHTML = filtered.map(card => `
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-colors">
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase" style="background:${card.color}20; color:${card.color}">${card.label}</span>
                    <span class="text-xs text-slate-400">封存於: ${new Date(card.archivedAt).toLocaleString()}</span>
                </div>
                <div class="font-medium text-slate-700">${card.text}</div>
            </div>
            <div class="flex gap-2">
                <button onclick="window.restoreCardFromArch('${card.id}')" class="w-9 h-9 flex items-center justify-center text-emerald-500 hover:bg-emerald-50 rounded-full border border-emerald-100" title="還原">
                    <i class="fa-solid fa-rotate-left"></i>
                </button>
                <button onclick="window.permanentlyDeleteCard('${card.id}')" class="w-9 h-9 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-full border border-red-100" title="刪除">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
    `).join('');
};

// 全域 API
window.archiveCard = function(listId, cardId) {
    if(!confirm('確定要封存此卡片嗎？')) return;
    const list = lists.find(l => l.id === listId);
    if (!list) return;
    const cardIdx = list.cards.findIndex(c => c.id === cardId);
    const [card] = list.cards.splice(cardIdx, 1);
    
    card.archivedAt = new Date().toISOString();
    card.originalListId = listId;
    
    archivedCards.unshift(card);
    saveArchiveData();
    if (typeof saveAll === 'function') saveAll();
    if (typeof renderBoard === 'function') renderBoard();
};

window.restoreCardFromArch = function(cid) {
    const idx = archivedCards.findIndex(c => c.id === cid);
    const [card] = archivedCards.splice(idx, 1);
    const targetList = lists.find(l => l.id === card.originalListId) || lists[0];
    targetList.cards.push(card);
    
    saveArchiveData();
    if (typeof saveAll === 'function') saveAll();
    if (typeof renderBoard === 'function') renderBoard();
    window.renderArchiveList();
};

window.permanentlyDeleteCard = function(cid) {
    if(!confirm('確定要永久刪除嗎？')) return;
    archivedCards = archivedCards.filter(c => c.id !== cid);
    saveArchiveData();
    window.renderArchiveList();
};