const $ = (sel) => document.querySelector(sel);
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

let array = [];
let isSorting = false;
let isPaused = false;

const barsEl = $('#bars');
const sizeRange = $('#sizeRange');
const speedRange = $('#speedRange');
const algoSelect = $('#algoSelect');
const complexityEl = $('#complexity');
const statusEl = $('#status');

const complexities = {
  'Bubble Sort': 'O(n²)',
  'Selection Sort': 'O(n²)',
  'Insertion Sort': 'O(n²)',
  'Merge Sort': 'O(n log n)',
  'Quick Sort': 'O(n log n)',
  'Heap Sort': 'O(n log n)'
};

function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
}
$('#themeBlue').onclick = () => setTheme('blue');
$('#themeDark').onclick = () => setTheme('dark');
$('#themeLight').onclick = () => setTheme('light');

function generateArray() {
  if (isSorting) return;
  const n = parseInt(sizeRange.value, 10);
  array = Array.from({ length: n }, () => Math.floor(Math.random() * 300) + 8);
  renderArray();
  statusEl.textContent = 'Array generated — size ' + n;
}

function renderArray(highlights = {}) {
  barsEl.innerHTML = '';
  const max = Math.max(...array);
  const minWidth = Math.max(2, Math.floor(900 / array.length));
  array.forEach((val, i) => {
    const h = Math.round((val / (max || 1)) * 100);
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = (h * 2.6) + 'px';
    bar.style.flex = '1 1 ' + (minWidth + 'px');
    if (highlights.compare?.includes(i)) bar.style.background = 'var(--compare)';
    else if (highlights.swap?.includes(i)) bar.style.background = 'var(--swap)';
    else if (highlights.sorted?.includes(i)) bar.style.background = 'var(--sorted)';
    else bar.style.background = 'var(--bar)';
    barsEl.appendChild(bar);
  });
}

$('#newArrayBtn').onclick = generateArray;

algoSelect.onchange = () => {
  const algo = algoSelect.value;
  complexityEl.textContent = 'Time: ' + complexities[algo];
};

$('#sortBtn').onclick = async () => {
  if (isSorting) return;
  isSorting = true;
  isPaused = false;
  const algo = algoSelect.value;
  const anims = algoMap[algo](array);
  statusEl.textContent = algo + ' running...';
  const speed = parseInt(speedRange.value, 10);
  for (const step of anims) {
    while (isPaused) await sleep(80);
    if (step.type === 'compare') renderArray({ compare: [step.a, step.b] });
    if (step.type === 'swap') {
      [array[step.a], array[step.b]] = [array[step.b], array[step.a]];
      renderArray({ swap: [step.a, step.b] });
    }
    if (step.type === 'overwrite') {
      array[step.a] = step.value;
      renderArray({ swap: [step.a] });
    }
    await sleep(600 - speed);
  }
  renderArray({ sorted: array.map((_, i) => i) });
  statusEl.textContent = algo + ' completed!';
  isSorting = false;
};

$('#pauseBtn').onclick = () => {
  if (!isSorting) return;
  isPaused = !isPaused;
  $('#pauseBtn').textContent = isPaused ? '▶️ Resume' : '⏸️ Pause';
};

generateArray();
