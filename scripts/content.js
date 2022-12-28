const container = document.querySelector("table.comment-tree");
const comments = container.querySelectorAll("tr.athing.comtr");
console.log(`${comments?.length} HN comments found`)

// TODO: Figure out how to isolate just "Javascript" within innerHTML
//    e.g. don't match `href="javascript:void(0)` 

let values = {
  highlight: undefined,
  exclude: undefined
}

const getValuesFromStorage = async () => {
  chrome.storage.local.get(["highlight", "exclude"]).then((result) => {
    console.log("stored values:", result);

    values = result;
    applyHighlights(values);
  });
}

getValuesFromStorage();

// listen for updated values messages
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.newValues) {
    console.log("updated values:", message.newValues);
    clearAllHighlights();
    applyHighlights(message.newValues);
  }
});

// highlight comments
const applyHighlights = (values) => {
  if (container && comments) {
    let highlight, exclude;

    if (values["highlight"]) {
      highlight = values["highlight"];
    }

    if (values["exclude"]) {
      exclude = values["exclude"];
    }

    comments.forEach((commentElement) => {
      if (!!highlight && new RegExp(highlight, "i").test(commentElement.innerHTML)) {
        commentElement.classList.add("green-300-highlight");
      } else if (!!exclude && new RegExp(exclude, "i").test(commentElement.innerHTML)) {
        commentElement.classList.add("red-300-highlight");
      }
    });
  }
}

const clearAllHighlights = () => {
  const highlightedComments = document.querySelectorAll(
    ".green-300-highlight, .red-300-highlight"
  );
  highlightedComments.forEach((commentElement) => {
    commentElement.classList.remove("green-300-highlight");
    commentElement.classList.remove("red-300-highlight");
  });
}