class QuickTranslate {
  constructor() {
    this.api_url = 'https://www.googleapis.com/language/translate/v2';
    this.api_key = 'AIzaSyC_0HAqnoDmHxJznBZZbSpHag_z0coAn28';
    this.translationMap = {
      "de": "German",
      "es": "Spanish",
      "fr": "French",
      "haw": "Hawaiian",
      "it": "Italian",
      "ja": "Japanese",
    }
  }

  showNotification(msgObj) {
    var message;

    if (msgObj.translation) {
      message = "Translation copied to clipboard";
    } else {
      message = msgObj.error.responseText;
    }

    chrome.notifications.clear('successPopup', function() {
      chrome.notifications.create('successPopup', {
        type: 'basic',
        title: 'Quick Translate',
        message: message,
        iconUrl: 'google-translate-logo.png'
      }, function(id) {});
    });
  }

  translate(to, phrase) {
    var that = this;
    return new Promise(resolve => {
      $.ajax({
        url: that.api_url,
        type: "GET",
        dataType: "json",
        data: {
          key: that.api_key,
          target: to,
          q: phrase
        },
        success: function(response) {
          var translation = response.data.translations[0].translatedText;
          resolve(translation);
        },
        error: function(err) {
          resolve(err.message);
        }
      });
    });
  }

  onError(errorMsg) {
    this.showNotification({
      error: errorMsg
    })
  }

  onSuccess(text) {
    this.copyToClipboard(text);
    this.showNotification({
      translation: text
    });
  }
}


var translator = new QuickTranslate();

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  if (text.length > 10) {
    for (let languageCode in translator.translationMap) {
      translator.translate(languageCode, text).then(translation => {
        suggest([{
          description: `${translator.translationMap[languageCode]} translation`,
          content: translation,
        }]);
      });
    };
  }
});

chrome.omnibox.onInputEntered.addListener(translation => {
  browser.tabs.executeScript({
    code: `
      let field = document.createElement("textarea");
      document.body.appendChild(field);
      field.value = "${translation}";
      field.select();
      document.execCommand("copy");
    `,
  }).then(() => {
    translator.showNotification({translation});
  });
});
