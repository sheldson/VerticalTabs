let sidebar;
let contentWrapper;

function createSidebar() {
  if (!sidebar) {
    // 创建侧边栏
    sidebar = document.createElement('div');
    sidebar.id = 'tab-sidebar';
    document.body.insertBefore(sidebar, document.body.firstChild);

    // 创建内容包装器
    contentWrapper = document.createElement('div');
    contentWrapper.id = 'tab-content';
    
    // 将所有现有内容移动到包装器中
    while (document.body.childNodes.length > 1) {
      contentWrapper.appendChild(document.body.childNodes[1]);
    }
    document.body.appendChild(contentWrapper);

    // 添加初始内容以验证侧边栏是否正确创建
    sidebar.innerHTML = '<div style="padding: 10px; color: black;">Sidebar Created</div>';
  }
}

function updateSidebarContent(tabs) {
  if (!sidebar) createSidebar();
  
  console.log('Updating sidebar content with', tabs.length, 'tabs');
  
  sidebar.innerHTML = '';
  tabs.forEach(tab => {
    const tabElement = document.createElement('div');
    tabElement.className = 'tab-item';
    tabElement.textContent = tab.title || 'Untitled Tab';
    tabElement.title = tab.title || 'Untitled Tab';
    if (tab.active) {
      tabElement.classList.add('active');
    }
    tabElement.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: "activateTab", tabId: tab.id });
    });
    sidebar.appendChild(tabElement);
  });
  
  // 添加调试信息
  const debugInfo = document.createElement('div');
  debugInfo.style.padding = '10px';
  debugInfo.style.color = 'black';
  debugInfo.textContent = `Tabs loaded: ${tabs.length}`;
  sidebar.appendChild(debugInfo);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  if (request.action === "updateTabs") {
    updateSidebarContent(request.tabs);
  }
});

function notifyReady() {
  console.log('Content script notifying ready');
  chrome.runtime.sendMessage({ action: "contentScriptReady" });
}

document.addEventListener('DOMContentLoaded', notifyReady);
window.addEventListener('load', notifyReady);

// 立即创建侧边栏和通知ready状态
createSidebar();
notifyReady();

console.log('Content script loaded and executed');