/**
 * 獨立補釘：日曆功能模組 (Calendar Plugin) - 支援黑色懸浮提示框
 */

let calendarInstance = null;

// 初始化或切換日曆顯示
function toggleCalendarModal() {
    const modal = document.getElementById('calendarModal');
    if (!modal) return;

    modal.classList.toggle('hidden');
    
    // 如果顯示 Modal，則初始化或更新日曆內容
    if (!modal.classList.contains('hidden')) {
        renderCalendar();
    }
}

// 渲染日曆核心邏輯
function renderCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const events = [];
    // 從主程式的 lists 變數中提取所有卡片作為事件
    if (typeof lists !== 'undefined') {
        lists.forEach(list => {
            list.cards.forEach(card => {
                events.push({
                    id: card.id,
                    extendedProps: { 
                        listId: list.id,
                        owner: card.owner,
                        label: card.label,
                        rawTitle: card.text
                    },
                    title: `[${card.owner}] ${card.text}`,
                    start: card.date,
                    backgroundColor: card.color,
                    borderColor: 'transparent',
                    textColor: '#000'
                });
            });
        });
    }

    if (calendarInstance) {
        calendarInstance.destroy();
    }

    calendarInstance = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'zh-tw',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
        },
        events: events,
        
        // 滑鼠移入：觸發黑色框框 (Tippy.js)
        eventMouseEnter: function(info) {
            const props = info.event.extendedProps;
            // 格式化顯示內容：標題 <換行> 標籤 <換行> 負責人
            const tooltipContent = `
                <div style="text-align: left; font-size: 12px; line-height: 1.6; padding: 4px;">
                    <div style="font-weight: bold; border-bottom: 1px solid #555; margin-bottom: 4px; padding-bottom: 2px;">${props.rawTitle}</div>
                    <div>標籤：${props.label}</div>
                    <div>負責人：${props.owner}</div>
                </div>
            `;
            
            // 使用 tippy 建立提示
            tippy(info.el, {
                content: tooltipContent,
                allowHTML: true,      // 允許 HTML 換行
                theme: 'material',    // 經典黑色主題
                placement: 'top',     // 顯示在上方
                arrow: true,          // 顯示小箭頭
                animation: 'shift-away',
                zIndex: 9999
            });
        },

        eventClick: function(info) {
            toggleCalendarModal();
            if (typeof openModal === 'function') {
                // 修正原先代碼中的 listId 抓取位置
                openModal(info.event.extendedProps.listId, info.event.id);
            }
        },
        height: 'auto'
    });

    calendarInstance.render();
}