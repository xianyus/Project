/**
 * 獨立補釘：日曆功能模組 (Calendar Plugin) - 旗艦互動版 v4.1 (修復版)
 * 包含：2026-2028 完整節日、點擊新增、拖曳排程
 */

let calendarInstance = null;

// 輔助：格式化日期 YYYY-MM-DD
function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
}

// 產生台灣國定假日資料 (2026-2028 完整版)
function getTaiwanHolidays() {
    const holidays = [
        // ==========================================
        //  2026 (依據詳細清單)
        // ==========================================
        { title: '🎉 元旦', date: '2026-01-01' },
        
        // 春節 (2/15~2/20)
        { title: '🧧 除夕', date: '2026-02-15' },
        { title: '🧧 春節', date: '2026-02-16' },
        { title: '🧧 春節', date: '2026-02-17' },
        { title: '🧧 春節', date: '2026-02-18' },
        { title: '🧧 春節', date: '2026-02-19' },
        { title: '🧧 春節', date: '2026-02-20' },

        // 228 (2/28週六 -> 2/27週五補假)
        { title: '🕊️ 228補假', date: '2026-02-27' },
        { title: '🕊️ 228紀念', date: '2026-02-28' },

        // 兒童清明 (4/3~4/6)
        { title: '🧒 兒童節(補)', date: '2026-04-03' },
        { title: '🧒 兒童節', date: '2026-04-04' },
        { title: '🌱 清明節', date: '2026-04-05' },
        { title: '🌱 清明節(補)', date: '2026-04-06' },

        // 勞動節
        { title: '🛠️ 勞動節', date: '2026-05-01' },

        // 端午節 (6/19~6/21)
        { title: '🐲 端午節', date: '2026-06-19' },
        { title: '🐲 端午節', date: '2026-06-20' },
        { title: '🐲 端午節', date: '2026-06-21' },

        // 中秋+教師 (9/25~9/28)
        { title: '🥮 中秋節', date: '2026-09-25' },
        { title: '🥮 中秋連假', date: '2026-09-26' },
        { title: '🥮 中秋連假', date: '2026-09-27' },
        { title: '🎓 教師節', date: '2026-09-28' },

        // 國慶 (10/10週六 -> 10/9週五補假)
        { title: '🇹🇼 國慶補假', date: '2026-10-09' },
        { title: '🇹🇼 國慶日', date: '2026-10-10' },
        { title: '🇹🇼 國慶連假', date: '2026-10-11' },

        // 光復節 (10/25週日 -> 10/26週一補假)
        { title: '🇹🇼 臺灣光復', date: '2026-10-25' },
        { title: '🇹🇼 光復補假', date: '2026-10-26' },

        // 行憲紀念日
        { title: '⚖️ 行憲紀念', date: '2026-12-25' },


        // ==========================================
        //  2027 (推算預估)
        // ==========================================
        { title: '🎉 元旦', date: '2027-01-01' },

        // 春節 (預估 2/5 除夕 ~ 2/10)
        { title: '🧧 除夕', date: '2027-02-05' },
        { title: '🧧 春節', date: '2027-02-06' },
        { title: '🧧 春節', date: '2027-02-07' },
        { title: '🧧 春節', date: '2027-02-08' },
        { title: '🧧 春節', date: '2027-02-09' },
        { title: '🧧 春節', date: '2027-02-10' },

        // 228 (2/28週日 -> 3/1週一補假)
        { title: '🕊️ 228紀念', date: '2027-02-28' },
        { title: '🕊️ 228補假', date: '2027-03-01' },

        // 兒童清明 (4/4週日, 4/5週一 -> 4/3-4/6連假)
        { title: '🧒 兒童節(補)', date: '2027-04-03' }, // 週六補假
        { title: '🧒 兒童節', date: '2027-04-04' },
        { title: '🌱 清明節', date: '2027-04-05' },
        { title: '🌱 清明連假', date: '2027-04-06' }, // 補假

        // 勞動節 (5/1週六 -> 4/30週五補假)
        { title: '🛠️ 勞動補假', date: '2027-04-30' },
        { title: '🛠️ 勞動節', date: '2027-05-01' },

        // 端午 (6/9週三)
        { title: '🐲 端午節', date: '2027-06-09' },

        // 中秋 (9/15週三)
        { title: '🥮 中秋節', date: '2027-09-15' },
        
        // 教師節 (9/28週二)
        { title: '🎓 教師節', date: '2027-09-28' },

        // 國慶 (10/10週日 -> 10/11週一補假)
        { title: '🇹🇼 國慶日', date: '2027-10-10' },
        { title: '🇹🇼 國慶補假', date: '2027-10-11' },

        // 光復節 (10/25週一)
        { title: '🇹🇼 臺灣光復', date: '2027-10-25' },

        // 行憲紀念日 (12/25週六 -> 12/24週五補假)
        { title: '⚖️ 行憲補假', date: '2027-12-24' },
        { title: '⚖️ 行憲紀念', date: '2027-12-25' },


        // ==========================================
        //  2028 (推算預估)
        // ==========================================
        { title: '🎉 元旦', date: '2028-01-01' },

        // 春節 (預估 1/25 除夕 ~ 1/30)
        { title: '🧧 除夕', date: '2028-01-25' },
        { title: '🧧 春節', date: '2028-01-26' },
        { title: '🧧 春節', date: '2028-01-27' },
        { title: '🧧 春節', date: '2028-01-28' },
        { title: '🧧 春節', date: '2028-01-29' },
        { title: '🧧 春節', date: '2028-01-30' },

        // 228 (2/28週一)
        { title: '🕊️ 228紀念', date: '2028-02-28' },

        // 兒童清明 (4/4週二) - 預估彈性放假連假 4/1-4/5
        { title: '🧒 兒童節連假', date: '2028-04-03' }, // 彈性放假
        { title: '🧒 兒童節', date: '2028-04-04' },
        { title: '🌱 清明節', date: '2028-04-05' },

        // 勞動節 (5/1週一)
        { title: '🛠️ 勞動節', date: '2028-05-01' },

        // 端午 (5/28週日 -> 5/29週一補假)
        { title: '🐲 端午節', date: '2028-05-28' },
        { title: '🐲 端午補假', date: '2028-05-29' },

        // 教師節 (9/28週四)
        { title: '🎓 教師節', date: '2028-09-28' },

        // 中秋 (10/3週二) - 預估彈性放假 10/2
        { title: '🥮 中秋連假', date: '2028-10-02' }, 
        { title: '🥮 中秋節', date: '2028-10-03' },

        // 國慶 (10/10週二) - 預估彈性放假 10/9
        { title: '🇹🇼 國慶連假', date: '2028-10-09' },
        { title: '🇹🇼 國慶日', date: '2028-10-10' },

        // 光復節 (10/25週三)
        { title: '🇹🇼 臺灣光復', date: '2028-10-25' },

        // 行憲紀念日 (12/25週一)
        { title: '⚖️ 行憲紀念', date: '2028-12-25' }
    ];

    return holidays.map(h => ({
        id: 'holiday-' + h.date,
        title: h.title,
        start: h.date,
        allDay: true,
        editable: false,
        backgroundColor: '#fee2e2', // 淺紅色背景
        textColor: '#ef4444',       // 紅色文字
        borderColor: 'transparent',
        display: 'block',
        classNames: ['holiday-event']
    }));
}

// 初始化或切換日曆顯示
function toggleCalendarModal() {
    const modal = document.getElementById('calendarModal');
    if (!modal) return;

    modal.classList.toggle('hidden');
    
    if (!modal.classList.contains('hidden')) {
        setTimeout(() => renderCalendar(), 50);
    }
}

// 渲染日曆核心邏輯
function renderCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    // 1. 準備任務事件
    let events = [];
    if (typeof lists !== 'undefined') {
        lists.forEach(list => {
            list.cards.forEach(card => {
                const isDone = card.done === true;
                const eventColor = isDone ? '#94a3b8' : (card.color || '#3b82f6');
                const textColor = isDone ? '#f1f5f9' : '#ffffff';

                if (card.date) {
                    events.push({
                        id: card.id,
                        title: `${isDone ? '✔ ' : ''}${card.text}`,
                        start: card.date,
                        backgroundColor: eventColor,
                        borderColor: eventColor,
                        textColor: textColor,
                        extendedProps: { 
                            listId: list.id,
                            owner: card.owner,
                            label: card.label,
                            done: isDone
                        },
                        classNames: isDone ? ['opacity-75', 'line-through'] : []
                    });
                }
            });
        });
    }

    // 2. 合併節日資料
    const holidayEvents = getTaiwanHolidays();
    events = [...holidayEvents, ...events];

    if (calendarInstance) {
        calendarInstance.destroy();
    }

    calendarInstance = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'zh-tw',
        height: 'auto',
        contentHeight: 700,
        stickyHeaderDates: true,

        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,listMonth' 
        },
        buttonText: {
            today: '今天',
            month: '月曆',
            week: '週曆',
            list: '清單'
        },

        editable: true,
        droppable: true,
        selectable: true,

        events: events,

        // --- A. 拖曳修改日期 ---
        eventDrop: function(info) {
            if (info.event.id.startsWith('holiday-')) {
                info.revert();
                return;
            }
            const newDate = formatDate(info.event.start);
            const listId = info.event.extendedProps.listId;
            const cardId = info.event.id;
            const list = lists.find(l => l.id === listId);
            if (list) {
                const card = list.cards.find(c => c.id === cardId);
                if (card) {
                    card.date = newDate;
                    if (typeof saveAll === 'function') saveAll();
                }
            }
        },

        // --- B. 點擊空白處：直接開啟完整編輯視窗 (Modal) ---
        dateClick: function(info) {
            const dateStr = info.dateStr;
            
            // 檢查是否有列表
            if (!lists || lists.length === 0) {
                alert("請先建立至少一個列表才能新增卡片！");
                return;
            }

            // 1. 預設加到第一個列表
            const targetList = lists[0];
            const newCardId = 'c' + Date.now();
            const config = window.safeGetPluginConfig ? window.safeGetPluginConfig() : { owners:['未指定'], labels:['待處理']};
            
            // 2. 建立一張暫存的新卡片
            const newCard = {
                id: newCardId,
                text: "新任務", // 預設標題
                date: dateStr, // 自動填入點擊的日期
                owner: config.owners[0] || '未指定',
                label: config.labels[0] || '待處理',
                color: '#facc15', // 預設黃色
                done: false,
                priority: '中',
                desc: ''
            };
            
            // 3. 寫入資料
            targetList.cards.push(newCard);
            if (typeof saveAll === 'function') saveAll();

            // 4. 關鍵動作：先關閉日曆，再打開編輯視窗
            toggleCalendarModal(); 

            setTimeout(() => {
                if (typeof renderBoard === 'function') renderBoard(); // 確保背景更新
                if (typeof openModal === 'function') {
                    // 打開這張新卡片的編輯視窗
                    openModal(targetList.id, newCardId);
                }
            }, 150); // 稍微延遲讓動畫跑完
        },

        // --- C. 點擊卡片：開啟編輯視窗 ---
        eventClick: function(info) {
            if (info.event.id.startsWith('holiday-')) return;
            info.jsEvent.stopPropagation();
            
            toggleCalendarModal(); // 關閉日曆
            
            setTimeout(() => {
                if (typeof openModal === 'function') {
                    openModal(info.event.extendedProps.listId, info.event.id);
                }
            }, 150);
        },

        // --- D. 懸浮提示 ---
        eventMouseEnter: function(info) {
            if (info.event.id.startsWith('holiday-')) {
                tippy(info.el, { content: '🇹🇼 國定假日', theme: 'light' });
                return;
            }
            const props = info.event.extendedProps;
            const tooltipContent = `
                <div style="text-align: left; font-size: 12px; line-height: 1.5;">
                    <div style="font-weight: bold; border-bottom: 1px solid #eee; margin-bottom: 4px; padding-bottom: 2px;">
                        ${props.done ? '✅ ' : ''}${info.event.title}
                    </div>
                    <div>👤 ${props.owner}</div>
                    <div style="color: #cbd5e1; font-size: 10px;">(點擊編輯 / 拖曳改期)</div>
                </div>
            `;
            tippy(info.el, { content: tooltipContent, allowHTML: true, theme: 'material', placement: 'top', arrow: true });
        }
    });

    calendarInstance.render();
}