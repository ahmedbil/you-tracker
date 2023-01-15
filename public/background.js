function setIcon(sixteen, thirtytwo, ninetysix) {
    chrome.action.setIcon({
        path: {
            "16": sixteen,
            "32": thirtytwo,
            "48": ninetysix
        }
    });
}

function isTabURLValid(tab) {
    let isValid = false;
    if ((tab != undefined) && (tab.url.indexOf("https://www.youtube.com") == 0)) {
        isValid = true;
    }
    return isValid;
}

function changeAction(action) {
    if (action) {
        // Enable the extension
        chrome.action.enable();
        setIcon("./icons/favicon-16x16.png", "./icons/favicon-32x32.png", "./icons/favicon-96x96.png")
    } else {
        // Disable the extension
        chrome.action.disable();
        setIcon("./icons/disabled16.png", "./icons/disabled32.png", "./icons/disabled96.png")
    }
}
// Listen for tab updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // Check if the updated tab's URL starts with "https://www.youtube.com"
    const enable = isTabURLValid(tab);
    changeAction(enable);
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
       const enable = isTabURLValid(tab);
       changeAction(enable);
    });
});

chrome.runtime.onInstalled.addListener(function(details) {
    changeAction(false);
});

