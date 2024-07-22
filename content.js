let sidebar;
let contentWrapper;
let isExpanded = false;
let activeTabId = null;

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

    sidebar.addEventListener('mouseenter', expandSidebar);
    sidebar.addEventListener('mouseleave', collapseSidebar);
  }
}

function expandSidebar() {
  sidebar.classList.add('expanded');
  isExpanded = true;
  updateContentMargin();
  showAllTabs();
}

function collapseSidebar() {
  sidebar.classList.remove('expanded');
  isExpanded = false;
  updateContentMargin();
  showOnlyActiveTab();
}

function updateContentMargin() {
  if (isExpanded) {
    const sidebarWidth = sidebar.offsetWidth;
    contentWrapper.style.marginLeft = `${sidebarWidth}px`;
  } else {
    contentWrapper.style.marginLeft = '30px'; // 默认宽度
  }
}

function showAllTabs() {
  const tabs = sidebar.querySelectorAll('.tab-item');
  tabs.forEach(tab => tab.style.display = 'flex');
}

function showOnlyActiveTab() {
  const tabs = sidebar.querySelectorAll('.tab-item');
  tabs.forEach(tab => {
    if (tab.dataset.tabId === activeTabId) {
      tab.style.display = 'flex';
    } else {
      tab.style.display = 'none';
    }
  });
}

function updateSidebarContent(tabs) {
  if (!sidebar) createSidebar();
  
  console.log('Updating sidebar content with', tabs.length, 'tabs');
  
  sidebar.innerHTML = '';
  tabs.forEach(tab => {
    const tabElement = document.createElement('div');
    tabElement.className = 'tab-item';
    tabElement.dataset.tabId = tab.id.toString();
    
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
      activeTabId = tab.id.toString();
    }
    tabElement.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: "activateTab", tabId: tab.id });
    });
    sidebar.appendChild(tabElement);
  });

  updateContentMargin();
  if (!isExpanded) {
    showOnlyActiveTab();
  }
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