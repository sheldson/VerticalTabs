let sidebar;
let isExpanded = false;
let activeTabId = null;

function createSidebar() {
  if (!sidebar) {
    sidebar = document.createElement('div');
    sidebar.id = 'tab-sidebar';
    document.body.appendChild(sidebar);

    sidebar.addEventListener('mouseenter', expandSidebar);
    sidebar.addEventListener('mouseleave', collapseSidebar);

    adjustSidebarPosition();
  }
}

function expandSidebar() {
  sidebar.classList.add('expanded');
  isExpanded = true;
  showAllTabs();
}

function collapseSidebar() {
  sidebar.classList.remove('expanded');
  isExpanded = false;
  showOnlyActiveTab();
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
    
    const closeButton = document.createElement('div');
    closeButton.className = 'close-button';
    closeButton.textContent = 'X';
    closeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      chrome.runtime.sendMessage({ action: "closeTab", tabId: tab.id });
    });
    tabElement.appendChild(closeButton);

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

  if (!isExpanded) {
    showOnlyActiveTab();
  }
  
  adjustSidebarPosition();
}

function adjustSidebarPosition() {
  const header = document.querySelector('#masthead-container');
  if (header && sidebar) {
    const headerHeight = header.offsetHeight;
    sidebar.style.top = `${headerHeight}px`;
    sidebar.style.height = `calc(100vh - ${headerHeight}px)`;
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

function initializeSidebar() {
  createSidebar();
  const resizeObserver = new ResizeObserver(() => {
    adjustSidebarPosition();
  });
  resizeObserver.observe(document.body);
}

document.addEventListener('DOMContentLoaded', () => {
  notifyReady();
  initializeSidebar();
});

window.addEventListener('load', notifyReady);

console.log('Content script loaded and executed');