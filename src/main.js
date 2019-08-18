let grid;
let w = 25;

let caseImg;
let flagImg;
let bombImg;

let gameOver = false;
let ai;

let gridWidth;
let gridHeight;
let gridBombs;
let lvl;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  document.addEventListener("contextmenu", event => event.preventDefault());
  caseImg = loadImage("../media/case.png");
  flagImg = loadImage("../media/flag.png");
  bombImg = loadImage("../media/bomb.png");

  gridWidth = 10;
  gridHeight = 10;
  gridBombs = 10;
  lvl = "noob";

  grid = new Grid(gridWidth, gridHeight, gridBombs);
  grid.print();
  print(grid);

  ai = false;

  aiBtn = createButton(ai ? "Play yourself" : "Let AI plays");
  aiBtn.mousePressed(toggleAI);
  aiBtn.position(w * grid.field[0].length + 20, 25 * 5);

  restartBtn = createButton("Restart");
  restartBtn.mousePressed(restart);
  restartBtn.position(w * grid.field[0].length + 20, 25 * 6);

  noobLVL = createButton("noob");
  noobLVL.mousePressed(restartNoob);
  noobLVL.position(w * grid.field[0].length + 20, 25 * 8);
  mediumLVL = createButton("medium");
  mediumLVL.mousePressed(restartMedium);
  mediumLVL.position(w * grid.field[0].length + 20, 25 * 9);
  hardLVL = createButton("hard");
  hardLVL.mousePressed(restartHard);
  hardLVL.position(w * grid.field[0].length + 20, 25 * 10);

  inputW = createInput();
  inputW.position(w * grid.field[0].length + 20, 25 * 12);
  inputH = createInput();
  inputH.position(w * grid.field[0].length + 20, 25 * 13);
  inputB = createInput();
  inputB.position(w * grid.field[0].length + 20, 25 * 14);
  persoLVL = createButton("OK");
  persoLVL.mousePressed(restartPerso);
  persoLVL.position(w * grid.field[0].length + 20, 25 * 15);
  inputW.elt.placeholder = "Width";
  inputH.elt.placeholder = "Height";
  inputB.elt.placeholder = "Bombs";
}

function draw() {
  background(51);

  grid.show();

  if (gameOver) {
    grid.showBombs();
  } else {
    if (grid.win && !grid.playing) {
      let s = floor((grid.end - grid.start) / 1000);
      alert(
        "Congrats" +
          (ai ? " Jarvis " : "") +
          ", you finished the " +
          lvl +
          " level in " +
          s +
          " sec."
      );
      if (ai) toggleAI();
      restart();
    }

    if (ai && !grid.win) {
      makeNextMove();
      grid.checkWin();
    }

    if (grid.win) {
      grid.completeWithFlags();
      print("WIN");
    }
  }
}

function makeNextMove() {
  let borders = grid.getBordersToComplete();
  let incompleteBorders = borders.incomplete;
  let completeBorders = borders.complete;
  if (completeBorders.length > 0) {
    grid.check(completeBorders[0].i, completeBorders[0].j);
    return;
  }
  let findMove = false;
  for (let c of incompleteBorders) {
    let surrounding = grid.getSurrounding(c.i, c.j);

    if (surrounding.flags.length + surrounding.hidden.length === c.getValue()) {
      // for(let toFlag of surrounding.hidden){
      //   grid.flag(toFlag.i,toFlag.j);
      // }
      grid.flag(surrounding.hidden[0].i, surrounding.hidden[0].j);
      grid.check(c.i, c.j);
      findMove = true;
      break;
    }
  }
  if (!findMove) {
    if (incompleteBorders.length > 0) {
      for (let c of grid.getBesideBorder()) {
        c.resetMaybe();
      }
      let totalHidden = grid.getHiddens().length;
      let probaGeneral = 1 - ((grid.numbombs - grid.bombFlagged)/totalHidden);
      for (let c of incompleteBorders) {
        let surrounding = grid.getSurrounding(c.i, c.j);
        let missingflags = c.getValue() - surrounding.flags.length;
        for (let h of surrounding.hidden) {
          h.maybe.push(1 - missingflags / surrounding.hidden.length);
        }
      }
      let hiddenCandidate = grid.getBesideBorder();
      const reducer = (accumulator, currentValue) => accumulator + currentValue;
      for(let c of hiddenCandidate){
        c.maybe.push(probaGeneral);
        c.proba = c.maybe.reduce(reducer)/c.maybe.length
      }
      hiddenCandidate.sort(function(a, b) {
        if (a.proba > b.proba) return -1;
        if (a.proba < b.proba) return 1;
        // a doit être égal à b
        return 0;
      });
      print("hiddenCandidate", hiddenCandidate);
      print("choosen",hiddenCandidate[0])
        grid.reveal(hiddenCandidate[0].i, hiddenCandidate[0].j);
      
      
    }
    let r = grid.makeRandomChoice();

    // premiere case
    if (!grid.isStarted()){
      grid.reveal(r.i, r.j);
    }
  }

  if (!grid.isStarted()) {
    grid.start = Date.now();
    grid.playing = true;
  }
}

function keyPressed(){}

let leftMouse = false;
let rightMouse = false;


function mousePressed(e) {
  print(e.which);
  switch (e.which) {
    case 1:
      leftMouse = true;
      break;
    case 3:
      rightMouse = true;
      break;
  }
  let j = floor(mouseX / w);
  let i = floor(mouseY / w);
  if (i >= grid.field.length || j >= grid.field[0].length) return;

  if (!gameOver) {
    if (mouseButton === LEFT) {
      if (!grid.isStarted()) {
        grid.start = Date.now();
        grid.playing = true;
      }
      grid.reveal(i, j);
    }
    if (mouseButton === RIGHT) {
      if (grid.isHidden(i, j)) grid.flag(i, j);
    }
    if (leftMouse && rightMouse) {
      print("doubleClick");
      grid.check(i, j);
    }

    if (mouseButton === CENTER) {
      print(grid.getBesideBorder());
    }
  }
}

function mouseReleased(e) {
  switch (e.which) {
    case 1:
      leftMouse = false;
      break;
    case 3:
      rightMouse = false;
      break;
  }
  grid.checkWin();
}

function toggleAI() {
  ai = !ai;
  aiBtn.elt.innerText = ai ? "Play yourself" : "Let AI plays";
}

function restart() {
  w=25;
  gameOver = false;
  switch (lvl) {
    case "noob":
      gridWidth = 10;
      gridHeight = 10;
      gridBombs = 10;
      break;
    case "medium":
      gridWidth = 20;
      gridHeight = 25;
      gridBombs = 80;
      break;
    case "hard":
      gridWidth = 40;
      gridHeight = 25;
      gridBombs = 200;
      break;
  }
  if (gridWidth * w > window.innerWidth) {
    w = floor((window.innerWidth - 200) / gridWidth);
  }
  if (gridHeight * w > window.innerHeight) {
    w = floor((window.innerHeight - 200) / gridHeight);
  }
  grid = new Grid(gridWidth, gridHeight, gridBombs);
  positionButton();
}

function positionButton() {
  aiBtn.position(w * grid.field[0].length + 20, 25 * 5);
  restartBtn.position(w * grid.field[0].length + 20, 25 * 6);
  noobLVL.position(w * grid.field[0].length + 20, 25 * 8);
  mediumLVL.position(w * grid.field[0].length + 20, 25 * 9);
  hardLVL.position(w * grid.field[0].length + 20, 25 * 10);
  inputW.position(w * grid.field[0].length + 20, 25 * 12);
  inputH.position(w * grid.field[0].length + 20, 25 * 13);
  inputB.position(w * grid.field[0].length + 20, 25 * 14);
  persoLVL.position(w * grid.field[0].length + 20, 25 * 15);
}

function restartNoob() {
  lvl = "noob";
  setTimeout(restart, 10);
}

function restartMedium() {
  lvl = "medium";
  setTimeout(restart, 10);
}

function restartHard() {
  lvl = "hard";
  setTimeout(restart, 10);
}

function restartPerso() {
  lvl = "perso";
  gameOver = false;
  print(inputW.value());
  gridWidth = parseInt(inputW.value());
  gridHeight = parseInt(inputH.value());
  gridBombs = parseInt(inputB.value());
  if (gridWidth * gridHeight * gridBombs > 0) {
    setTimeout(function() {
      if (gridWidth * w > window.innerWidth) {
        w = floor((window.innerWidth - 50) / gridWidth);
      }
      if (gridHeight * w > window.innerHeight) {
        w = floor((window.innerHeight - 50) / gridHeight);
      }
      grid = new Grid(gridWidth, gridHeight, gridBombs);
      positionButton();
    }, 10);
  } else {
    lvl = "noob";
    setTimeout(restart, 10);
  }
}

/*

prendre tous les rebords et placer les mines dont on est sur
développer tous les rebords autours des flags posés

*/
