chrome.omnibox.setDefaultSuggestion({
  description: "Search the Firefox source code",
});

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  searchGithub(text, suggest);
});

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  let url = text;
  if (!text.startsWith("https://dxr.mozilla.org")) {
    url = `https://dxr.mozilla.org/mozilla-central/search?q=${text}+-path%3Aobj-&redirect=false`
  }
  chrome.tabs.create({url});
});

function searchGithub(text, suggest) {
  let url = "https://api.github.com/search/code";
  let query = `q=${text}+repo:mozilla/gecko-dev`;

  ajax(url, query).then(data => {
    data = JSON.parse(data);
    if (data.total_count) {
      let items = data.items.slice(0, 3);
      suggest(items.map(item => {
        return {
          content: `https://dxr.mozilla.org/mozilla-central/source/${item.path}`,
          description: `${item.path}`,
        };
      }))
    } else {
      suggest([{
        content: "http://dxr.mozilla.org/",
        description: "no results found",
      }]);
    }
  });
}

function ajax(url, query) {
  return new Promise(resolve => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", `${url}?${query}`, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.responseText) {
        resolve(xhr.responseText);
      }
    }
    xhr.send();
  });
}