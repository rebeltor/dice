/* -------------------------------------------------------
 * Cookie helpers
 * ------------------------------------------------------- */

function setCookieValue(cookieName, value, expiryDays)
{
    const d = new Date();
    d.setTime(d.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = cookieName + "=" + encodeURIComponent(value) + ";" + expires + ";path=/;SameSite=Strict";
}

function getCookieValue(cookieName)
{
    const name = cookieName + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let i = 0; i < cookieArray.length; i++)
    {
        let c = cookieArray[i].trimStart();
        if (c.indexOf(name) === 0)
        {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

/* -------------------------------------------------------
 * History stored in a cookie as a comma-separated list
 * e.g. "45,67,23,89,12"  (newest at the end)
 * ------------------------------------------------------- */

const HISTORY_COOKIE = 'dice_history';
const MAX_HISTORY    = 20;
const COOKIE_DAYS    = 365;

function getHistory()
{
    const val = getCookieValue(HISTORY_COOKIE);
    if (!val) return [];
    return val.split(',').map(Number);
}

function saveHistory(history)
{
    setCookieValue(HISTORY_COOKIE, history.join(','), COOKIE_DAYS);
}

function addRoll(roll)
{
    const history = getHistory();
    history.push(roll);
    if (history.length > MAX_HISTORY)
    {
        history.shift();
    }
    saveHistory(history);
    return history;
}

function clearHistory()
{
    setCookieValue(HISTORY_COOKIE, '', -1);
}

/* -------------------------------------------------------
 * Statistics
 * ------------------------------------------------------- */

function getAverage(history)
{
    if (history.length === 0) return null;
    const sum = history.reduce((a, b) => a + b, 0);
    return parseFloat((sum / history.length).toFixed(2));
}

/* -------------------------------------------------------
 * UI helpers
 * ------------------------------------------------------- */

/*
 * colour-codes a roll badge based on its value
 * 90-100: critical (red)  |  70-89: high (amber)
 * 40-69:  mid (green)     |  1-39:  low (indigo)
 */
function getRollClass(n)
{
    if (n >= 90) return 'roll-critical';
    if (n >= 70) return 'roll-high';
    if (n >= 40) return 'roll-mid';
    return 'roll-low';
}

function renderHistory(history)
{
    const el = document.getElementById('history');
    if (history.length === 0)
    {
        el.innerHTML = '<p class="no-history">No rolls yet</p>';
        return;
    }

    // show newest first
    el.innerHTML = history.slice().reverse().map((n, idx) =>
        `<span class="roll-badge ${getRollClass(n)}${idx === 0 ? ' roll-latest' : ''}" title="Roll: ${n}">${n}</span>`
    ).join('');
}

function renderStats(history)
{
    const avg = getAverage(history);
    document.getElementById('average').textContent = avg !== null ? avg : '—';
    document.getElementById('count').textContent   = history.length;
}

function refreshUI(history)
{
    renderHistory(history);
    renderStats(history);
}

/* -------------------------------------------------------
 * Roll – pure JavaScript, no server needed
 * ------------------------------------------------------- */

function naturalRoll()
{
    return Math.floor(Math.random() * 100) + 1;
}

/* -------------------------------------------------------
 * Initialise on DOMContentLoaded
 * ------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', function()
{
    // populate stats from saved cookie history on page load
    refreshUI(getHistory());

    // roll button
    document.getElementById('rollBtn').addEventListener('click', function()
    {
        const roll = naturalRoll();

        // animate the die
        const dieEl = document.getElementById('die');
        dieEl.classList.remove('rolling');
        // force reflow so the animation restarts if clicked rapidly
        void dieEl.offsetWidth;
        dieEl.classList.add('rolling');
        dieEl.textContent = roll;

        // save and refresh UI
        refreshUI(addRoll(roll));
    });

    // clear history button
    document.getElementById('clearBtn').addEventListener('click', function()
    {
        clearHistory();
        refreshUI([]);
        document.getElementById('die').textContent = '?';
        document.getElementById('die').classList.remove('rolling');
    });
});
