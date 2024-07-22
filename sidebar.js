document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.sendMessage({ action: "getTabs" });
  });
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateTabs") {
      updateSidebarContent(request.tabs);
    }
  });
  
  function updateSidebarContent(tabs) {
    const sidebar = document.getElementById('tab-sidebar');
    if (!sidebar) return;
  
    sidebar.innerHTML = '';
    tabs.forEach(tab => {
      const tabElement = document.createElement('div');
      tabElement.className = 'tab-item';
      tabElement.textContent = tab.title;
      tabElement.title = tab.title;
      if (tab.active) {
        tabElement.classList.add('active');
      }
      tabElement.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "activateTab", tabId: tab.id });
      });
      sidebar.appendChild(tabElement);
    });
  }