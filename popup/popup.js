document.addEventListener('DOMContentLoaded', function() {

  // save button event listener
  let saveButton = document.getElementById("saveButton");
  saveButton.addEventListener("click", async () => {
    let highlightValue = document.getElementById("highlight").value;
    let excludeValue = document.getElementById("exclude").value;

    let newValues = {
      highlight: highlightValue,
      exclude: excludeValue,
    };

    // update values in local storage
    await chrome.storage.local.set(newValues);

    // send updated values to content
    await sendUpdatedValuesMessage(newValues);
    window.close();
  });

  // reset button event listener
  let resetButton = document.getElementById("resetButton");
  resetButton.addEventListener("click", async () => {
    // update values in local storage
    await chrome.storage.local.clear();

    // send updated values to content
    await sendUpdatedValuesMessage({
      highlight: undefined,
      exclude: undefined
    });
    window.close();
  });

  // initialize input values from chrome storage
  chrome.storage.local.get(["highlight", "exclude"]).then((result) => {
    // console.log("popup.js: Retrieved values from chrome storage", result);

    result.highlight &&
      (document.getElementById("highlight").value = result.highlight);
    result.exclude &&
      (document.getElementById("exclude").value = result.exclude);
  });
});

const sendUpdatedValuesMessage = async (values) => {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);

  if (tab) {
    await chrome.tabs.sendMessage(tab.id, { newValues: values });
  } else {
    console.log("active tab not found :(");
  }
};