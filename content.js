let sidebar;
let contentWrapper;
let isExpanded = false;

function createSidebar() {
  if (!sidebar) {
    sidebar = document.createElement('div');
    sidebar.id = 'tab-sidebar';
    document.body.insertBefore(sidebar, document.body.firstChild);

    contentWrapper = document.createElement('div');
    contentWrapper.id = 'tab-content';
    
    while (document.body.childNodes.length > 1) {
      contentWrapper.appendChild(document.body.childNodes[1]);
    }
    document.body.appendChild(contentWrapper);

    // 添加鼠标进入和离开事件
    sidebar.addEventListener('mouseenter', expandSidebar);
    sidebar.addEventListener('mouseleave', collapseSidebar);
  }
}

function expandSidebar() {
  sidebar.classList.add('expanded');
  isExpanded = true;
  updateContentMargin();
}

function collapseSidebar() {
  sidebar.classList.remove('expanded');
  isExpanded = false;
  updateContentMargin();
}

function updateContentMargin() {
  if (isExpanded) {
    const sidebarWidth = sidebar.offsetWidth;
    document.body.style.marginLeft = `${sidebarWidth}px`;
  } else {
    document.body.style.marginLeft = '30px';
  }
}

function updateSidebarContent(tabs) {
  if (!sidebar) createSidebar();
  
  console.log('Updating sidebar content with', tabs.length, 'tabs');
  
  sidebar.innerHTML = '';
  tabs.forEach(tab => {
    const tabElement = document.createElement('div');
    tabElement.className = 'tab-item';
    
    const faviconContainer = document.createElement('div');
    faviconContainer.className = 'favicon-container';
    
    const favicon = document.createElement('img');
    favicon.src = tab.favIconUrl || 'defaultIcon.png';
    favicon.className = 'favicon';
    faviconContainer.appendChild(favicon);
    
    const titleContainer = document.createElement('div');
    titleContainer.className = 'title-container';
    titleContainer.textContent = tab.title || 'Untitled Tab';
    
    tabElement.appendChild(faviconContainer);
    tabElement.appendChild(titleContainer);
    
    if (tab.active) {
      tabElement.classList.add('active');
    }
    tabElement.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: "activateTab", tabId: tab.id });
    });
    sidebar.appendChild(tabElement);
  });

  updateContentMargin();
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

createSidebar();
notifyReady();

console.log('Content script loaded and executed');