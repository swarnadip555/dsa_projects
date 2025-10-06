// script.js
// UI glue for Swarnadip's Sudoku Solver

const sudokuEl = document.getElementById('sudoku');
const statusEl = document.getElementById('status');
const themeBtn = document.getElementById('themeBtn');
const sampleBtn = document.getElementById('sampleBtn');
const clearBtn = document.getElementById('clearBtn');
const hintBtn = document.getElementById('hintBtn');
const validateBtn = document.getElementById('validateBtn');
const solveBtn = document.getElementById('solveBtn');
const solveAnimBtn = document.getElementById('solveAnimBtn');
const speedRange = document.getElementById('speed');

let inputs = [];
let stopToken = { stop:false };

// Pre-built set of puzzles (0 = empty). Each load picks one randomly and maybe removes some digits to vary.
const PUZZLES = [
  // easy
  [ [5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],[8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],[0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9] ],
  // medium
  [ [0,0,0,2,6,0,7,0,1],[6,8,0,0,7,0,0,9,0],[1,9,0,0,0,4,5,0,0],[8,2,0,1,0,0,0,4,0],[0,0,4,6,0,2,9,0,0],[0,5,0,0,0,3,0,2,8],[0,0,9,3,0,0,0,7,4],[0,4,0,0,5,0,0,3,6],[7,0,3,0,1,8,0,0,0] ],
  // hard
  [ [0,0,0,0,0,0,0,1,2],[0,0,0,0,0,0,0,0,0],[0,0,1,0,0,7,0,0,0],[0,0,0,0,6,0,0,0,0],[3,0,0,0,0,0,0,0,8],[0,0,0,0,0,0,0,0,0],[0,0,0,5,0,0,9,0,0],[0,0,0,0,0,0,0,0,0],[4,7,0,0,0,0,0,0,0] ],
  // other
  [ [2,0,0,6,0,8,0,0,0],[0,0,0,0,7,0,0,9,0],[0,0,0,0,0,0,6,0,0],[0,0,7,0,4,0,2,0,0],[0,4,0,0,0,0,0,1,0],[0,0,1,0,5,0,8,0,0],[0,0,6,0,0,0,0,0,0],[0,1,0,0,3,0,0,0,0],[0,0,0,5,0,9,0,0,7] ],
];

// build grid inputs
function buildGrid(){
  sudokuEl.innerHTML = '';
  inputs = [];
  for(let i=0;i<81;i++){
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.inputMode = 'numeric';
    inp.maxLength = 1;
    inp.dataset.index = i;
    inp.addEventListener('input', onInput);
    inp.addEventListener('keydown', onKeyDown);
    inp.addEventListener('click', onClickCell);
    sudokuEl.appendChild(inp);
    inputs.push(inp);
  }
}
buildGrid();

// helpers
function setStatus(msg, type='muted'){
  statusEl.textContent = msg;
  statusEl.className = type === 'muted' ? 'muted' : (type==='error' ? 'error' : 'success');
}
function readGrid(){
  const grid = [];
  for(let r=0;r<9;r++){
    const row = [];
    for(let c=0;c<9;c++){
      const v = inputs[r*9+c].value.trim();
      row.push(v === '' ? 0 : parseInt(v,10));
    }
    grid.push(row);
  }
  return grid;
}
function writeGrid(grid, markGiven=false){
  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      const idx = r*9+c;
      if(grid[r][c] === 0){
        inputs[idx].value = '';
        inputs[idx].classList.remove('given','locked','invalid');
      } else {
        inputs[idx].value = grid[r][c];
        if(markGiven) inputs[idx].classList.add('given');
        else inputs[idx].classList.remove('given','locked');
      }
    }
  }
}

// input restrictions
function onInput(e){
  const v = e.target.value.replace(/[^1-9]/g,'');
  e.target.value = v;
  e.target.classList.remove('invalid');
  setStatus('Edited');
}
function onKeyDown(e){
  const idx = Number(e.target.dataset.index);
  const r = Math.floor(idx/9), c = idx%9;
  if(e.key === 'Backspace'){ e.target.value=''; }
  // arrow navigation
  if(e.key === 'ArrowLeft') focusCell(r, Math.max(0,c-1));
  if(e.key === 'ArrowRight') focusCell(r, Math.min(8,c+1));
  if(e.key === 'ArrowUp') focusCell(Math.max(0,r-1), c);
  if(e.key === 'ArrowDown') focusCell(Math.min(8,r+1), c);
}
function focusCell(r,c){
  const idx = r*9 + c;
  inputs[idx].focus();
}

// allow shift+click to lock a cell as pre-filled (toggle)
function onClickCell(e){
  if(e.shiftKey){
    const el = e.target;
    el.classList.toggle('locked');
    el.classList.add('given');
  }
}

// sample loader: pick a random puzzle and display
function loadRandomPuzzle(){
  stopAnimation();
  const p = PUZZLES[Math.floor(Math.random()*PUZZLES.length)];
  // deep clone
  const grid = p.map(r => r.slice());
  writeGrid(grid, true);
  // randomly remove a few givens to vary (but keep a solvable puzzle)
  // We'll remove up to 12 additional numbers randomly (but keep at least 18 givens)
  const indices = [];
  for(let i=0;i<81;i++) if(inputs[i].value) indices.push(i);
  const removeCount = Math.min(12, Math.max(0, Math.floor(Math.random()*10)));
  for(let k=0;k<removeCount;k++){
    if(indices.length <= 18) break;
    const i = indices.splice(Math.floor(Math.random()*indices.length),1)[0];
    inputs[i].value = '';
    inputs[i].classList.remove('given');
  }
  setStatus('Random puzzle loaded');
}

// clear board (remove non-locked givens)
function clearBoard(){
  stopAnimation();
  for(let i=0;i<81;i++){
    inputs[i].value = '';
    inputs[i].classList.remove('given','locked','invalid');
  }
  setStatus('Cleared');
}

// Validate
validateBtn.addEventListener('click', ()=>{
  const grid = readGrid();
  const res = SudokuSolver.validate(grid.map(r=>r.slice()));
  if(res.ok){
    setStatus('No conflicts detected', 'success');
  } else {
    const idx = res.row*9 + res.col;
    inputs[idx].classList.add('invalid');
    setStatus(`Conflict at row ${res.row+1}, col ${res.col+1}`, 'error');
    focusCell(res.row, res.col);
  }
});

// Hint: solve a clone and fill a single empty cell
hintBtn.addEventListener('click', ()=>{
  stopAnimation();
  const grid = readGrid();
  const solution = SudokuSolver.getSolution(grid);
  if(!solution){ setStatus('No solution available for current board', 'error'); return; }
  // find first empty cell to fill
  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      if(grid[r][c] === 0){
        const idx = r*9+c;
        inputs[idx].value = solution[r][c];
        inputs[idx].classList.add('given');
        setStatus(`Hint: filled row ${r+1}, col ${c+1}`);
        return;
      }
    }
  }
  setStatus('No empty cells to hint');
});

// Solve (instant)
solveBtn.addEventListener('click', ()=>{
  stopAnimation();
  const grid = readGrid();
  const validation = SudokuSolver.validate(grid.map(r=>r.slice()));
  if(!validation.ok){
    const idx = validation.row*9 + validation.col;
    inputs[idx].classList.add('invalid');
    setStatus(`Invalid puzzle (conflict at row ${validation.row+1}, col ${validation.col+1})`, 'error');
    focusCell(validation.row, validation.col);
    return;
  }
  const cloned = SudokuSolver.cloneGrid(grid);
  const ok = SudokuSolver.solve(cloned);
  if(ok){
    writeGrid(cloned, false);
    setStatus('Solved ✅', 'success');
  } else {
    setStatus('No solution found', 'error');
  }
});

// Animated solve (visualize backtracking)
let animating = false;
async function startAnimatedSolve(){
  stopAnimation();
  const grid = readGrid();
  const validation = SudokuSolver.validate(grid.map(r=>r.slice()));
  if(!validation.ok){
    const idx = validation.row*9 + validation.col;
    inputs[idx].classList.add('invalid');
    setStatus(`Invalid puzzle (conflict at row ${validation.row+1}, col ${validation.col+1})`, 'error');
    focusCell(validation.row, validation.col);
    return;
  }
  const cloned = SudokuSolver.cloneGrid(grid);
  stopToken = { stop:false };
  const delay = Math.max(6, 120 - Number(speedRange.value)); // convert slider to ms: higher slider -> faster
  animating = true;
  clearVisualMarks();
  setStatus('Animating solver...');
  const ok = await SudokuSolver.solveAnimated(cloned, async (step) => {
    const idx = step.r*9 + step.c;
    if(step.action === 'place'){
      inputs[idx].value = step.val;
      inputs[idx].classList.add('given');
      inputs[idx].classList.remove('invalid');
    } else if(step.action === 'remove'){
      // only clear if not locked/given originally
      const el = inputs[idx];
      if(!el.classList.contains('locked')) el.value = '';
    }
    // tiny UI breathing
    return;
  }, delay, stopToken);
  animating = false;
  if(ok){
    writeGrid(cloned, false);
    setStatus('Solved (animated) ✅', 'success');
  } else {
    setStatus('No solution found (animated)', 'error');
  }
}

solveAnimBtn.addEventListener('click', ()=> startAnimatedSolve());

// stop animation helper
function stopAnimation(){
  if(animating){
    stopToken.stop = true;
    animating = false;
    setStatus('Animation stopped');
  }
}

// clear visual marks (invalid etc) but preserve givens/locks
function clearVisualMarks(){
  inputs.forEach(inp => {
    inp.classList.remove('invalid');
  });
}

// clear button
clearBtn.addEventListener('click', clearBoard);

// sample button
sampleBtn.addEventListener('click', loadRandomPuzzle);

// theme toggle
themeBtn.addEventListener('click', ()=>{
  document.body.classList.toggle('theme-dark');
  document.body.classList.toggle('theme-light');
});

// small extra: clicking a given cell while holding shift toggles lock (already handled in onClickCell)

// initial sample on load
setTimeout(()=> {
  loadRandomPuzzle();
}, 120);

// small accessibility: pressing Enter on any input tries to solve
inputs.forEach(inp=>{
  inp.addEventListener('keypress', e=>{
    if(e.key === 'Enter') solveBtn.click();
  });
});
