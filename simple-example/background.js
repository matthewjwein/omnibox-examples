chrome.omnibox.setDefaultSuggestion({
  description: "This is a simple omnibox example",
});

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  console.log(`onInputChanged: {text: ${text}}`);
  suggest([
    {content: text + " one", description: "the first entry provided by the extension"},
    {content: text + " two", description: "the second entry provided by the extension"}
  ]);
});

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  console.log(`onInputEntered: {disposition: ${disposition} text: ${text}}`);
  switch (disposition) {
    case "currentTab":
      chrome.tabs.update({url: text});
      break;
    case "newForegroundTab":
      chrome.tabs.create({url: text});
      break;
    case "newBackgroundTab":
      chrome.tabs.create({url: text, active: false});
      break;
  }
});

chrome.omnibox.onInputCancelled.addListener(() => {
  console.log("onInputCancelled");
});