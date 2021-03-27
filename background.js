const timer = ms => new Promise(resolve => setTimeout(resolve, ms));

chrome.alarms.onAlarm.addListener(
    async function (alarm) {
        const [, url] = alarm.name.split('***');
        const tab = await createTab(url);

        // wait page loading
        await timer(5000);

        disableAudioAndVideo(tab);

        while (await isTabOpen(tab) && !await hasJoined(tab)) tryJoining(tab);
    }
)

function buildDate (time, weekday) {
    const date = new Date();
    
    const [hours, minutes] = time.split(':');
    date.setHours(hours, minutes, 0);
    
    while(date.getDay() !== weekday) 
        date.setHours(date.getHours() + 24);

    return date;
}

async function createTab (url) {
    return await chrome.tabs.create({ url });
}

function disableAudioAndVideo (tab) {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
            const buttons = document.querySelectorAll('[jsname="BOHaEe"]');
            buttons.forEach(button => button.click());
        }
    });
}

async function isTabOpen (tab) {
    try {
        await chrome.tabs.get(tab.id);
        return true;
    
    } catch { return false; }
}

async function hasJoined (tab) {
    let hasJoined;

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
            const videoCall = document.getElementsByClassName('T3F3Rd');
            return videoCall.length ? true : false;
        }
    }, (response) => hasJoined = response[0].result)

    // wait checkJoined script
    await timer(3000); 

    return hasJoined;
}

async function tryJoining (tab) {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
            const join = document.querySelector('[jsname="Qx7uuf"]');
            join.click();
        }
    });
}