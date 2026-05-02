const STORAGE_KEY = 'dice_history';
const MAX_HISTORY = 20;

function getHistory()
{
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
}

function saveHistory(history)
{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function addRoll(roll)
{
    const history = getHistory();
    history.push(roll);
    if (history.length > MAX_HISTORY) history.shift();
    saveHistory(history);
    return history;
}

function clearHistory()
{
    localStorage.removeItem(STORAGE_KEY);
}

/* -------------------------------------------------------
 * Statistics
 * ------------------------------------------------------- */

function getStats(history)
{
    if (history.length === 0) return { avg: null, min: null, max: null };
    const sum = history.reduce((a, b) => a + b, 0);
    return {
        avg: parseFloat((sum / history.length).toFixed(2)),
        min: Math.min(...history),
        max: Math.max(...history),
    };
}

/* -------------------------------------------------------
 * UI helpers
 * ------------------------------------------------------- */

const ROLL_TIERS = [
    { min: 96,  cls: 'roll-critical' },
    { min: 65,  cls: 'roll-decent'   },
    { min:  6,  cls: 'roll-lame'     },
    { min:  1,  cls: 'roll-fumble'   },
];

function getRollClass(n)
{
    return ROLL_TIERS.find(t => n >= t.min).cls;
}

const DIE_RESULT_CLASSES = ['die-critical', 'die-decent', 'die-lame', 'die-fumble'];

function applyDieResult(dieEl, roll)
{
    dieEl.classList.remove('rolling', ...DIE_RESULT_CLASSES);
    void dieEl.offsetWidth;
    const tier = getRollClass(roll).replace('roll-', 'die-');
    dieEl.classList.add('rolling', tier);
}

function renderHistory(history)
{
    const el = document.getElementById('history');
    if (history.length === 0)
    {
        el.innerHTML = '<p class="no-history">No rolls yet</p>';
        return;
    }
    el.innerHTML = history.slice().reverse().map((n, idx) =>
        `<span class="roll-badge ${getRollClass(n)}${idx === 0 ? ' roll-latest' : ''}" title="Roll: ${n}">${n}</span>`
    ).join('');
}

function renderStats(history)
{
    const { avg, min, max } = getStats(history);
    const dash = '—';
    document.getElementById('stat-avg').textContent   = avg !== null ? avg  : dash;
    document.getElementById('stat-count').textContent = history.length;
    document.getElementById('stat-min').textContent   = min !== null ? min  : dash;
    document.getElementById('stat-max').textContent   = max !== null ? max  : dash;
}

function refreshUI(history)
{
    renderHistory(history);
    renderStats(history);
}

/* -------------------------------------------------------
 * Roll
 * ------------------------------------------------------- */

function naturalRoll()
{
    return Math.floor(Math.random() * 100) + 1;
}

/* -------------------------------------------------------
 * Init
 * ------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', function ()
{
    refreshUI(getHistory());

    document.getElementById('rollBtn').addEventListener('click', function ()
    {
        const roll  = naturalRoll();
        const dieEl = document.getElementById('die');
        applyDieResult(dieEl, roll);
        dieEl.textContent = roll;
        refreshUI(addRoll(roll));
    });

    document.getElementById('clearBtn').addEventListener('click', function ()
    {
        clearHistory();
        refreshUI([]);
        const dieEl = document.getElementById('die');
        dieEl.textContent = '?';
        dieEl.classList.remove('rolling', ...DIE_RESULT_CLASSES);
    });
});
