const container = document.querySelector("table.comment-tree");
const comments = container.querySelectorAll("tr.athing.comtr");
console.log(`${comments?.length} comments found`)

let values = {
  highlight: undefined,
  ignore: undefined,
  removeUnhighlighted: false
}

const highlightedClassNames = [
  "hn-ext-green-300-highlight",
  "hn-ext-red-300-highlight",
  "hn-ext-orange-300-highlight",
];

const highlightedClassSelectors = highlightedClassNames.map((c) => `.${c}`);

const getValuesFromStorage = async () => {
   chrome.storage.local.get(
     ["highlightWords", "ignoreWords", "removeUnhighlighted"],
     (result) => {
       values = result;

      applyHighlights(values);
      showOrHideUnhiglightedComments(values);
     }
   );
}

getValuesFromStorage();

const escapeRegExpString = (string) => {
  return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// listen for updated values messages
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.newValues) {
    clearAllHighlights();
    applyHighlights(message.newValues);
    showOrHideUnhiglightedComments(message.newValues);
  }
});

// highlight comments
const applyHighlights = (values) => {
  if (container && comments) {
    let highlight, ignore;

    if (values["highlightWords"]) {
      highlight = splitTrimAndEscapeValues(values["highlightWords"]);
    }

    if (values["ignoreWords"]) {
      ignore = splitTrimAndEscapeValues(values["ignoreWords"]);
    }

    comments.forEach((commentElement) => {
      const commentTextElement = commentElement.querySelector(".commtext");
      const commentText = commentTextElement?.innerHTML;

      const highlightRegex = new RegExp(`(\\b)(${highlight})(\\b)`,"igm");
      const ignoreRegex = new RegExp(`(\\b)(${ignore})(\\b)`, "igm");

      // add highlight classes
      let highlightMatch = highlight && highlightRegex.test(commentText);
      let ignoreMatch = ignore && ignoreRegex.test(commentText);

      if (highlightMatch && ignoreMatch) {
        commentElement.classList.add("hn-ext-orange-300-highlight");
      } else if (highlightMatch) {
        commentElement.classList.add("hn-ext-green-300-highlight");
      } else if (ignoreMatch) {
        commentElement.classList.add("hn-ext-red-300-highlight");
      }

      // bold matching text
      if (highlightMatch || ignoreMatch) {
        newCommentText = commentText.replace(
          new RegExp(`\\b(${highlight}|${ignore})\\b`, "igm"),
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
  const highlightedComments = document.querySelectorAll(
    highlightedClassSelectors.toString()
  );

  // remove highlights from comments
  highlightedComments.forEach((commentElement) => {
    highlightedClassNames.forEach(className => {
      commentElement.classList.remove(className);
    });

    // remove bold from matching text
    const commentTextElement = commentElement.querySelector(".commtext");
    const commentText = commentTextElement.innerHTML;

    let newCommentText = commentText.replace(
      new RegExp(`<span class="hn-ext-font-semibold">(.*?)<\/span>`, "igm"),
      "$1"
    );

    commentTextElement.innerHTML = newCommentText;
  });

  // ensure no comments are hidden
  showUnhighlightedComments();
}

const showUnhighlightedComments = () => {
  // ensure no comments are hidden
  const hiddenComments = document.querySelectorAll(".hn-ext-hidden");
  hiddenComments.forEach((commentElement) => {
    commentElement.classList.remove("hn-ext-hidden");
  });
};

const showOrHideUnhiglightedComments = (values) => {
  if (container && comments) {
    if (
      values.removeUnhighlighted &&
      (values.highlightWords || values.ignoreWords)
    ) {
      // hide unhighlighted comments & show highlighted ones
      comments.forEach((commentElement) => {
        let isHighlighted = highlightedClassNames.some((className) =>
          commentElement.classList.contains(className)
        );

        if (isHighlighted) {
          commentElement.classList.remove("hn-ext-hidden");
        } else {
          commentElement.classList.add("hn-ext-hidden");
        }
      });
    } else {
      showUnhighlightedComments();
    }
  }
};
