document.addEventListener('DOMContentLoaded', () => {
  // initialize input values from chrome storage
  loadValuesFromStorage();

  // save form event listener
  let popupForm = document.getElementById("popupForm");
  popupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    let highlightValue = document.getElementById("highlight").value;
    let excludeValue = document.getElementById("exclude").value;

    let newValues = {
      highlight: highlightValue,
      exclude: excludeValue,
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
    document.getElementById("highlight").value = "";
    document.getElementById("exclude").value = "";

    // close popup
    window.close();

    // send updated values message to content
    await sendUpdatedValuesMessage({
      highlight: undefined,
      exclude: undefined,
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
  chrome.storage.local.get(["highlight", "exclude"]).then((result) => {
    console.log(
      "popup.js: Retrieved values from chrome storage",
      result.highlight,
      result.exclude
    );

    result.highlight &&
      (document.getElementById("highlight").value = result.highlight);
    result.exclude &&
      (document.getElementById("exclude").value = result.exclude);
  });
}