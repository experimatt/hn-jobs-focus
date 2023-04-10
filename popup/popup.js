document.addEventListener('DOMContentLoaded', () => {
  // initialize input values from chrome storage
  loadValuesFromStorage();

  // save form event listener
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

    // close popup
    window.close();

    // send updated values message to content
    await sendUpdatedValuesMessage(newValues);
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
});

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