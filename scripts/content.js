const container = document.querySelector("table.comment-tree");
const comments = container.querySelectorAll("tr.athing.comtr");
console.log(`${comments?.length} comments found`)

let values = {
  highlight: undefined,
  exclude: undefined
}

const getValuesFromStorage = async () => {
  chrome.storage.local.get(["highlight", "exclude"]).then((result) => {
    values = result;
    applyHighlights(values);
  });
}

getValuesFromStorage();

const escapeRegExpString = (string) => {
  return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// listen for updated values messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.newValues) {
    clearAllHighlights();
    applyHighlights(message.newValues);
  }
});

// highlight comments
const applyHighlights = (values) => {
  if (container && comments) {
    let highlight, exclude;

    if (values["highlight"]) {
      highlight = splitTrimAndEscapeValues(values["highlight"]);
    }

    if (values["exclude"]) {
      exclude = splitTrimAndEscapeValues(values["exclude"]);
    }

    comments.forEach((commentElement) => {
      const commentText = commentElement.querySelector(".commtext")?.innerHTML;

      const highlightRegex = new RegExp(
        `(?<![[:alpha:]])${highlight}(?!:void)(?![[:alpha:]])`,
        "i"
      );
      const excludeRegex = new RegExp(
        `(?<![[:alpha:]])${exclude}(?![[:alpha:]])`,
        "i"
      );

      let highlightMatch = highlight && highlightRegex.test(commentText);
      let excludeMatch = exclude && excludeRegex.test(commentText);

      if (highlightMatch && excludeMatch) {
        commentElement.classList.add("orange-300-highlight");
      } else if (highlightMatch) {
        commentElement.classList.add("green-300-highlight");
      } else if (excludeMatch) {
        commentElement.classList.add("red-300-highlight");
      }
    });
  }
}

const splitTrimAndEscapeValues = (values) => {
  let splitValues = values.split(",").map((v) => v.trim());
  return splitValues.map((v) => escapeRegExpString(v)).join("|");
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