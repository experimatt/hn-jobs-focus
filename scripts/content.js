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
      const commentTextElement = commentElement.querySelector(".commtext");
      const commentText = commentTextElement?.innerHTML;

      const highlightRegex = new RegExp(`\\b${highlight}\\b`,"igm");
      const excludeRegex = new RegExp(`\\b${exclude}\\b`, "igm");

      // add highlight classes
      let highlightMatch = highlight && highlightRegex.test(commentText);
      let excludeMatch = exclude && excludeRegex.test(commentText);

      if (highlightMatch && excludeMatch) {
        commentElement.classList.add("hn-ext-orange-300-highlight");
      } else if (highlightMatch) {
        commentElement.classList.add("hn-ext-green-300-highlight");
      } else if (excludeMatch) {
        commentElement.classList.add("hn-ext-red-300-highlight");
      }

      // bold matching text
      if (highlightMatch || excludeMatch) {
        newCommentText = commentText.replace(
          new RegExp(`\\b(${highlight}|${exclude})\\b`, "igm"),
          `<span class="hn-ext-font-semibold">$1</span>`
        );

        commentTextElement.innerHTML = newCommentText;
      }
    });
  }
}

const splitTrimAndEscapeValues = (values) => {
  let splitValues = values.split(",").map((v) => v.trim());
  return splitValues.map((v) => escapeRegExpString(v)).join("|");
}

const clearAllHighlights = () => {
  // remove highlights from comments
  const highlightedComments = document.querySelectorAll(
    ".hn-ext-green-300-highlight, .hn-ext-red-300-highlight, .hn-ext-orange-300-highlight"
  );
  highlightedComments.forEach((commentElement) => {
    commentElement.classList.remove("hn-ext-green-300-highlight");
    commentElement.classList.remove("hn-ext-red-300-highlight");
    commentElement.classList.remove("hn-ext-orange-300-highlight");

    // remove bold from matching text
    const commentTextElement = commentElement.querySelector(".commtext");
    const commentText = commentTextElement.innerHTML;

    let newCommentText = commentText.replace(
      new RegExp(`<span class="hn-ext-font-semibold">(.*?)<\/span>`, "igm"),
      "$1"
    );

    commentTextElement.innerHTML = newCommentText;
  });
}