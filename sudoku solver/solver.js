// solver.js
// Provides synchronous solver + animated solver via callbacks.
// Exposes global SudokuSolver with functions: solve(grid), solveAnimated(grid, onStep, delay), validate(grid), getSolution(grid)

(function(global){
  function cloneGrid(g){
    return g.map(r=>r.slice());
  }

  function isValidPlacement(grid, row, col, val){
    // check row
    for(let c=0;c<9;c++){
      if(grid[row][c] === val) return false;
    }
    // check col
    for(let r=0;r<9;r++){
      if(grid[r][col] === val) return false;
    }
    // check 3x3
    const br = Math.floor(row/3)*3;
    const bc = Math.floor(col/3)*3;
    for(let r=br;r<br+3;r++){
      for(let c=bc;c<bc+3;c++){
        if(grid[r][c] === val) return false;
      }
    }
    return true;
  }

  function findEmpty(grid){
    for(let r=0;r<9;r++){
      for(let c=0;c<9;c++){
        if(grid[r][c] === 0) return [r,c];
      }
    }
    return null;
  }

  // Synchronous backtracking solver (returns true and mutates grid)
  function solve(grid){
    const empty = findEmpty(grid);
    if(!empty) return true;
    const [r,c] = empty;
    for(let v=1; v<=9; v++){
      if(isValidPlacement(grid,r,c,v)){
        grid[r][c] = v;
        if(solve(grid)) return true;
        grid[r][c] = 0;
      }
    }
    return false;
  }

  function getSolution(grid){
    const cloned = cloneGrid(grid);
    const ok = solve(cloned);
    return ok ? cloned : null;
  }

  // validate grid (no conflicts)
  function validate(grid){
    for(let r=0;r<9;r++){
      for(let c=0;c<9;c++){
        const v = grid[r][c];
        if(v !== 0){
          grid[r][c] = 0;
          if(!isValidPlacement(grid,r,c,v)){
            grid[r][c] = v;
            return { ok:false, row:r, col:c, val:v };
          }
          grid[r][c] = v;
        }
      }
    }
    return { ok:true };
  }

  // Animated solver (async) - calls onStep({r,c,val,action}) where action is 'place' or 'remove'
  async function solveAnimated(grid, onStep, delay = 40, stopToken = {stop:false}){
    function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

    async function dfs(){
      if(stopToken.stop) return false;
      const empty = findEmpty(grid);
      if(!empty) return true;
      const [r,c] = empty;
      for(let v=1; v<=9; v++){
        if(isValidPlacement(grid,r,c,v)){
          grid[r][c] = v;
          if(onStep) await onStep({r,c,val:v,action:'place'});
          await sleep(delay);
          if(await dfs()) return true;
          // backtrack
          grid[r][c] = 0;
          if(onStep) await onStep({r,c,val:0,action:'remove'});
          await sleep(Math.max(8, Math.floor(delay/2)));
          if(stopToken.stop) return false;
        }
      }
      return false;
    }
    return await dfs();
  }

  global.SudokuSolver = {
    solve,
    getSolution,
    validate,
    solveAnimated,
    cloneGrid
  };
})(window);
