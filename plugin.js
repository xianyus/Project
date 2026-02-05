/**
 * 補釘檔案 v3：支援動態編輯、分頁選單與字體調整
 */

// 初始化設定
if (!localStorage.getItem('plugin_config')) {
    localStorage.setItem('plugin_config', JSON.stringify({
        owners: ['Nancy', 'Dennis', '未指定'],
        labels: ['生產中', '急件', '暫停'],
        listFontSize: 11,
        cardFontSize: 13
    }));
}

function getPluginConfig() {
    return JSON.parse(localStorage.getItem('plugin_config'));
}

function updatePluginConfig(newConfig) {
    localStorage.setItem('plugin_config', JSON.stringify(newConfig));
    if (typeof renderBoard === 'function') renderBoard();
    initPluginUI(); 
}

/**
 * 分頁切換功能
 * @param {string} tab - 分頁名稱 ('data' 或 'font')
 */
function switchTab(tab) {
    const dataPanel = document.getElementById('panel-data');
    const fontPanel = document.getElementById('panel-font');
    const dataTab = document.getElementById('tab-data');
    const fontTab = document.getElementById('tab-font');

    if (tab === 'data') {
        dataPanel.classList.remove('hidden');
        fontPanel.classList.add('hidden');
        dataTab.classList.add('active');
        fontTab.classList.remove('active');
    } else {
        dataPanel.classList.add('hidden');
        fontPanel.classList.remove('hidden');
        dataTab.classList.remove('active');
        fontTab.classList.add('active');
    }
}

/**
 * 更新字體大小設定
 */
function updateFontSize(type, value) {
    const config = getPluginConfig();
    const val = parseInt(value) || (type === 'list' ? 11 : 13);
    
    if (type === 'list') {
        config.listFontSize = val;
    } else {
        config.cardFontSize = val;
    }
    updatePluginConfig(config);
}

// 渲染設定面板
function initPluginUI() {
    const config = getPluginConfig();
    
    // 渲染負責人管理
    const ownerList = document.getElementById('ownerSettings');
    ownerList.innerHTML = config.owners.map((o, i) => `
        <div class="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
            <span>${o}</span>
            <button onclick="removeOption('owners', ${i})" class="text-red-400 hover:text-red-600"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join('');

    // 渲染標籤管理
    const labelList = document.getElementById('labelSettings');
    labelList.innerHTML = config.labels.map((l, i) => `
        <div class="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
            <span class="font-bold text-indigo-600">${l}</span>
            <button onclick="removeOption('labels', ${i})" class="text-red-400 hover:text-red-600"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join('');

    // 更新字體輸入框的值
    document.getElementById('input-list-font').value = config.listFontSize || 11;
    document.getElementById('input-card-font').value = config.cardFontSize || 13;
}

// 新增選項
function addOption(type) {
    const inputId = type === 'owners' ? 'newOwnerInput' : 'newLabelInput';
    const val = document.getElementById(inputId).value.trim();
    if (!val) return;
    
    const config = getPluginConfig();
    config[type].push(val);
    updatePluginConfig(config);
    document.getElementById(inputId).value = '';
}

// 刪除選項
function removeOption(type, index) {
    const config = getPluginConfig();
    if (config[type].length <= 1) {
        alert("請至少保留一個選項！");
        return;
    }
    config[type].splice(index, 1);
    updatePluginConfig(config);
}