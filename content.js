let sidebar;
let isExpanded = false;
let activeTabId = null;
let sidebarVisible = false;

function createSidebar() {
  if (!sidebar) {
    sidebar = document.createElement('div');
    sidebar.id = 'tab-sidebar';
    document.body.appendChild(sidebar);

    sidebar.addEventListener('mouseenter', expandSidebar);
    sidebar.addEventListener('mouseleave', handleSidebarMouseLeave);

    adjustSidebarPosition();

    // 创建一个检测区域
    const detectionArea = document.createElement('div');
    detectionArea.style.position = 'fixed';
    detectionArea.style.left = '0';
    detectionArea.style.top = '0';
    detectionArea.style.width = '5px';
    detectionArea.style.height = '100%';
    detectionArea.style.zIndex = '2147483646';
    document.body.appendChild(detectionArea);

    detectionArea.addEventListener('mouseenter', showSidebar);
  }
}

function showSidebar() {
  if (!sidebarVisible && sidebar) {
    sidebar.classList.add('visible');
    const tabContent = document.getElementById('tab-content');
    if (tabContent) {
      tabContent.classList.add('sidebar-visible');
    }
    sidebarVisible = true;
  }
}

function hideSidebar() {
  if (sidebarVisible && sidebar) {
    sidebar.classList.remove('visible');
    const tabContent = document.getElementById('tab-content');
    if (tabContent) {
      tabContent.classList.remove('sidebar-visible');
    }
    sidebarVisible = false;
    isExpanded = false;
    sidebar.classList.remove('expanded');
  }
}

function expandSidebar() {
  if (sidebar) {
    sidebar.classList.add('expanded');
    isExpanded = true;
    showAllTabs();
  }
}

function handleSidebarMouseLeave() {
  if (!isExpanded) {
    hideSidebar();
  } else {
    collapseSidebar();
  }
}

function collapseSidebar() {
  if (sidebar) {
    sidebar.classList.remove('expanded');
    isExpanded = false;
    showOnlyActiveTab();
    hideSidebar();
  }
}

function showAllTabs() {
  if (sidebar) {
    const tabs = sidebar.querySelectorAll('.tab-item');
    tabs.forEach(tab => tab.style.display = 'flex');
  }
}

function showOnlyActiveTab() {
  if (sidebar) {
    const tabs = sidebar.querySelectorAll('.tab-item');
    tabs.forEach(tab => {
      tab.style.display = tab.dataset.tabId === activeTabId ? 'flex' : 'none';
    });
  }
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
    
    const faviconContainer = document.createElement('div');
    faviconContainer.className = 'favicon-container';
    
    const favicon = document.createElement('img');
    favicon.src = tab.favIconUrl || 'defaultIcon.png';
    favicon.className = 'favicon';
    faviconContainer.appendChild(favicon);
    
    const titleContainer = document.createElement('div');
    titleContainer.className = 'title-container';
    titleContainer.textContent = tab.title || 'Untitled Tab';
    
    tabElement.appendChild(closeButton);
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
  } else {
    showAllTabs();
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createSidebar();
      requestUpdate();
    });
  } else {
    createSidebar();
    requestUpdate();
  }
  const resizeObserver = new ResizeObserver(() => {
    adjustSidebarPosition();
  });
  resizeObserver.observe(document.body);
}

function requestUpdate() {
  chrome.runtime.sendMessage({ action: "requestUpdate" });
}

document.addEventListener('DOMContentLoaded', () => {
  notifyReady();
  initializeSidebar();
});

window.addEventListener('load', () => {
  notifyReady();
  requestUpdate();
});

console.log('Content script loaded and executed');