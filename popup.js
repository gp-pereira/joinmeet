const createAlarmButton = document.getElementById("create-alarm");
createAlarmButton.addEventListener('click', createAlarm);

function createAlarm () {
    const weekday = document.getElementById('weekday');
    const meeting = document.getElementById('meeting');
    const repeat = document.getElementById('repeat');
    const time = document.getElementById('time');
    const url = document.getElementById('url');

    if (!time.value || !url.value) return;
    
    const date = buildDate(time.value, parseInt(weekday.value));

    chrome.alarms.create(`${meeting.value}***${url.value}`, { 
        when: date.getTime(), 
        periodInMinutes: repeat.checked ? 10080 : null // 1 week in minutes
    });
}

function buildDate (time, weekday) {
    const date = new Date();
    
    const [hours, minutes] = time.split(':');
    date.setHours(hours, minutes, 0);
    
    while(date.getDay() !== weekday) 
        date.setHours(date.getHours() + 24);

    return date;
}

popupSetup();
resetUserSchedule();

function popupSetup () {
    const now = new Date();

    const options = document.getElementsByClassName("weekday");
    options[now.getDay()].selected = true;

    const hours = padNumber(now.getHours());
    const minutes = padNumber(now.getMinutes());

    const time = document.getElementById('time');
    time.value = `${hours}:${minutes}`;
}

function padNumber (number) {
    return `${number}`.padStart(2, '0');
}

async function resetUserSchedule () {
    const userSchedule = document.querySelector('.user-schedule');
    userSchedule.innerHTML = '';

    chrome.alarms.getAll(alarms => {
        if (alarms.length === 0) userSchedule.appendChild(noScheduledAlarms());
        else alarms.forEach(alarm => userSchedule.appendChild(scheduledAlarm(alarm)));
    });
}

function noScheduledAlarms () {
    const div = document.createElement('div');
    div.className = "no-scheduled-alarms";

    const span = document.createElement('span');
    span.innerText = "You don't have any scheduled meetings yet :(";

    div.appendChild(span);

    return div;
}

function scheduledAlarm (alarm) {
    const div = document.createElement('div');
    div.className = 'scheduled-alarm';

    let alarmInfo = buildAlarmInfo(alarm);
    let removeButton = buildRemoveButton(alarm);

    div.appendChild(alarmInfo);
    div.appendChild(removeButton);

    return div;
}

function buildAlarmInfo (alarm) {
    const alarmInfo = document.createElement('div');
    alarmInfo.className = 'scheduled-alarm-info';

    const [meeting,] = alarm.name.split('***');

    const info = document.createElement('span');
    info.innerText = `${meeting}, ${getFormattedTime(alarm.scheduledTime)}`;

    alarmInfo.appendChild(info);

    if (alarm.periodInMinutes) {
        const repeatIcon = document.createElement('img');

        repeatIcon.src = "images/repeat.png"
        repeatIcon.className = 'repeat-icon';

        alarmInfo.appendChild(repeatIcon);
    }

    return alarmInfo;
}

function getFormattedTime (time) {
    const weekdays = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ];
    
    const date = new Date(time);

    const hours = padNumber(date.getHours());
    const minutes = padNumber(date.getMinutes());

    return `${weekdays[date.getDay()]}, ${hours}:${minutes}`;
}

function buildRemoveButton (alarm) {
    const button = document.createElement('button');
    button.className = 'remove-alarm';

    button.addEventListener('click', () => removeAlarm(alarm.name));

    const trashIcon = document.createElement('img');
    trashIcon.src = 'images/trash.png';
    trashIcon.className = 'trash-icon';

    button.appendChild(trashIcon);

    return button;
}

async function removeAlarm (alarmName) {
    await chrome.alarms.clear(alarmName);

    resetUserSchedule();
}
