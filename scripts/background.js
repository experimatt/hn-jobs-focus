chrome.contextMenus.create({
  id: "hn-highlight-word",
  title: "Add '%s' to highlight list",
  contexts: ["selection"],
});

chrome.contextMenus.create({
  id: "hn-ignore-word",
  title: "Add '%s' to ignore list",
  contexts: ["selection"],
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === "hn-highlight-word") {
    chrome.storage.local.get(["highlightWords"], function (data) {
      var highlightWords = data.highlightWords || [];
      highlightWords.push(info.selectionText);
      chrome.storage.local.set({ highlightWords: highlightWords });
      chrome.tabs.sendMessage(tab.id, {
        action: "hn-highlight-word",
        word: info.selectionText,
      });
    });
  }  else if (info.menuItemId === "hn-ignore-word") {
    chrome.storage.local.get(["ignoreWords"], function(data) {
      var ignoreWords = data.ignoreWords || [];
      ignoreWords.push(info.selectionText);
      chrome.storage.local.set({"ignoreWords": ignoreWords});
      chrome.tabs.sendMessage(tab.id, {action: "hn-ignore-word", word: info.selectionText});
    });
  }
});
