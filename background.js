let readyTabs = new Set();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  if (request.action === "contentScriptReady") {
    readyTabs.add(sender.tab.id);
    console.log('Tab ready:', sender.tab.id);
    updateAllTabs();
  } else if (request.action === "activateTab") {
    chrome.tabs.update(request.tabId, { active: true });
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('Tab activated:', activeInfo.tabId);
  updateAllTabs();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('Tab updated:', tabId);
    updateAllTabs();
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log('Tab removed:', tabId);
  readyTabs.delete(tabId);
  updateAllTabs();
});

function updateAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    console.log('Updating all tabs. Ready tabs:', Array.from(readyTabs));
    tabs.forEach(tab => {
      if (readyTabs.has(tab.id)) {
        console.log('Sending update to tab:', tab.id);
        chrome.tabs.sendMessage(tab.id, { action: "updateTabs", tabs: tabs }).catch(error => {
          console.log(`Error sending message to tab ${tab.id}: ${error}`);
          readyTabs.delete(tab.id);
        });
      }
    });
  });
}

console.log('Background script loaded');