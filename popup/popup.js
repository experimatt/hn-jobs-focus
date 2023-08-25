document.addEventListener('DOMContentLoaded', () => {
  // initialize input values from chrome storage
  loadValuesFromStorage();

  // save event form listener
  let popupForm = document.getElementById("popupForm");
  popupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    let highlightValue = document.getElementById("highlightWords").value;
    let ignoreValue = document.getElementById("ignoreWords").value;

    let newValues = {
      highlightWords: highlightValue,
      ignoreWords: ignoreValue,
    };

    // update values in local storage
    await chrome.storage.local.set(newValues);
    await sendUpdatedValuesMessage(newValues);
    await reloadActiveTab();

    window.close();
  });

  // reset button event listener
  let resetButton = document.getElementById("resetButton");
  resetButton.addEventListener("click", async () => {
    // update values in local storage
    await chrome.storage.local.clear();

    // clear input values
    document.getElementById("highlightWords").value = "";
    document.getElementById("ignoreWords").value = "";

    // close popup
    window.close();

    // send updated values message to content
    await sendUpdatedValuesMessage({
      highlightWords: undefined,
      ignoreWords: undefined,
    });
  });

  // Checkbox event listener
  let removeUnhighlightedCheckbox = document.getElementById("removeUnhighlighted");
  removeUnhighlightedCheckbox.addEventListener("change", async () => {
    let removeUnhighlighted = removeUnhighlightedCheckbox.checked;

    // Update value in local storage
    await chrome.storage.local.set({ removeUnhighlighted });

    // Send updated value message to content script
    await sendUpdatedValuesMessage({ removeUnhighlighted });

    // If checked, reload the active tab
    if (removeUnhighlighted) {
      await reloadActiveTab();
    }
  });

  // Load value from storage and set the checkbox state
  loadValueFromStorage("removeUnhighlighted", (value) => {
    removeUnhighlightedCheckbox.checked = value;
  });
});

  const loadValueFromStorage = async (key, callback) => {
    chrome.storage.local.get([key], (result) => {
      if (callback && result[key] !== undefined) {
        callback(result[key]);
      }
    });
  };

const sendUpdatedValuesMessage = async (values) => {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);

  if (tab) {
    await chrome.tabs.sendMessage(tab.id, { newValues: values });
    return true;
  } else {
    console.log("active tab not found :(");
  }
};

const loadValuesFromStorage = async () => {
  chrome.storage.local.get(["highlightWords", "ignoreWords"]).then((result) => {
    console.log(
      "popup.js: Retrieved values from chrome storage",
      result.highlightWords,
      result.ignoreWords
    );

    result.highlightWords &&
      (document.getElementById("highlightWords").value = result.highlightWords);
    result.ignoreWords &&
      (document.getElementById("ignoreWords").value = result.ignoreWords);
  });
}

const reloadActiveTab = async () => {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);

  if (tab) {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        location.reload();
      },
    });
  } else {
    console.log("active tab not found :(");
  }
};
