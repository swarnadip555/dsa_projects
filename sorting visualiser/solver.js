// --- Sorting algorithms returning animation steps ---

function bubbleSortAnim(arr) {
  const animations = [];
  const a = arr.slice();
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      animations.push({ type: 'compare', a: j, b: j + 1 });
      if (a[j] > a[j + 1]) {
        animations.push({ type: 'swap', a: j, b: j + 1 });
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
      }
    }
  }
  return animations;
}

function selectionSortAnim(arr) {
  const animations = [];
  const a = arr.slice();
  for (let i = 0; i < a.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < a.length; j++) {
      animations.push({ type: 'compare', a: minIdx, b: j });
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      animations.push({ type: 'swap', a: i, b: minIdx });
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
    }
  }
  return animations;
}

function insertionSortAnim(arr) {
  const animations = [];
  const a = arr.slice();
  for (let i = 1; i < a.length; i++) {
    let key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      animations.push({ type: 'compare', a: j, b: j + 1 });
      animations.push({ type: 'overwrite', a: j + 1, value: a[j] });
      a[j + 1] = a[j];
      j--;
    }
    animations.push({ type: 'overwrite', a: j + 1, value: key });
    a[j + 1] = key;
  }
  return animations;
}

function mergeSortAnim(arr) {
  const animations = [];
  const a = arr.slice();

  function merge(l, m, r) {
    const left = a.slice(l, m + 1);
    const right = a.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      animations.push({ type: 'compare', a: l + i, b: m + 1 + j });
      if (left[i] <= right[j]) {
        animations.push({ type: 'overwrite', a: k, value: left[i] });
        a[k++] = left[i++];
      } else {
        animations.push({ type: 'overwrite', a: k, value: right[j] });
        a[k++] = right[j++];
      }
    }
    while (i < left.length) animations.push({ type: 'overwrite', a: k++, value: left[i++] });
    while (j < right.length) animations.push({ type: 'overwrite', a: k++, value: right[j++] });
  }

  function sort(l, r) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    sort(l, m);
    sort(m + 1, r);
    merge(l, m, r);
  }

  sort(0, a.length - 1);
  return animations;
}

function quickSortAnim(arr) {
  const animations = [];
  const a = arr.slice();

  function partition(low, high) {
    const pivot = a[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      animations.push({ type: 'compare', a: j, b: high });
      if (a[j] < pivot) {
        i++;
        animations.push({ type: 'swap', a: i, b: j });
        [a[i], a[j]] = [a[j], a[i]];
      }
    }
    animations.push({ type: 'swap', a: i + 1, b: high });
    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    return i + 1;
  }

  function qs(low, high) {
    if (low < high) {
      const p = partition(low, high);
      qs(low, p - 1);
      qs(p + 1, high);
    }
  }

  qs(0, a.length - 1);
  return animations;
}

function heapSortAnim(arr) {
  const animations = [];
  const a = arr.slice();
  const n = a.length;

  function heapify(n, i) {
    let largest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    if (l < n) { animations.push({ type: 'compare', a: l, b: largest }); if (a[l] > a[largest]) largest = l; }
    if (r < n) { animations.push({ type: 'compare', a: r, b: largest }); if (a[r] > a[largest]) largest = r; }
    if (largest !== i) {
      animations.push({ type: 'swap', a: i, b: largest });
      [a[i], a[largest]] = [a[largest], a[i]];
      heapify(n, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
  for (let i = n - 1; i > 0; i--) { animations.push({ type: 'swap', a: 0, b: i }); [a[0], a[i]] = [a[i], a[0]]; heapify(i, 0); }
  return animations;
}

const algoMap = {
  'Bubble Sort': bubbleSortAnim,
  'Selection Sort': selectionSortAnim,
  'Insertion Sort': insertionSortAnim,
  'Merge Sort': mergeSortAnim,
  'Quick Sort': quickSortAnim,
  'Heap Sort': heapSortAnim,
};
