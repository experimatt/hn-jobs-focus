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

      const highlightRegex = new RegExp(
        `(?<![[:alpha:]])${highlight}(?!:void)(?![[:alpha:]])`,
        "i"
      );
      const excludeRegex = new RegExp(
        `(?<![[:alpha:]])${exclude}(?![[:alpha:]])`,
        "i"
      );

      // add highlight classes
      let highlightMatch = highlight && highlightRegex.test(commentText);
      let excludeMatch = exclude && excludeRegex.test(commentText);

      if (highlightMatch && excludeMatch) {
        commentElement.classList.add("orange-300-highlight");
      } else if (highlightMatch) {
        commentElement.classList.add("green-300-highlight");
      } else if (excludeMatch) {
        commentElement.classList.add("red-300-highlight");
      }

      // bold matching text
      const boldMatches = (input, text) => {
        return input.replace(
          new RegExp(`(?<![[:alpha:]])(${text})(?![[:alpha:]])`, "igm"),
          "<span class='font-semibold'>$1</span>"
        );
      }

      if (highlightMatch || excludeMatch) {
        let newCommentText = boldMatches(commentText, `${highlight}|${exclude}`);
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
    ".green-300-highlight, .red-300-highlight"
  );
  highlightedComments.forEach((commentElement) => {
    commentElement.classList.remove("green-300-highlight");
    commentElement.classList.remove("red-300-highlight");
  });
}

// debugging
// let c = comments[1]
// let cEl = c.querySelector(".commtext");
// let cText = c?.innerHTML;
// let h = 'Linux|Rust'
// let hRegex = new RegExp(
//   `(?<![[:alpha:]])${h}(?!:void)(?![[:alpha:]])`,
//   "i"
// );
// let hMatch = h && hRegex.test(cText);

// let newCText = cText.replace(
//   new RegExp(`(?<![[:alpha:]])(${cText})(?![[:alpha:]])`, "igm"),
//   "<span class='font-semibold'>$2</span>"
// );

// console.log(h, hMatch)
// console.log('original:', cText);
// console.log('---------------------------------------------');
// console.log('new:', newCText);