class Grid {
  constructor(w, h, b) {
    // create grid
    let g = new Array();
    for (let i = 0; i < h; i++) {
      g[i] = new Array();
      for (let j = 0; j < w; j++) {
        g[i][j] = new Cell(i, j, undefined);
      }
    }
    this.field = g;
    this.playing = false;
    this.start = -1;
    this.end = 0;
    this.numbombs = b;
    this.bombFlagged = 0;
    this.win = false;
    this.placeBombs(b);
    this.placeIndicators();
  }

  reveal(i, j) {
    let c = this.field[i][j];
    if (!c.isFlagged()) c.reveal();
    if (c.isEmpty()) {
      this.revealSurrounding(i, j);
    }
  }

  isStarted() {
    return this.start !== -1;
  }

  showBombs() {
    for (let line of this.field) {
      for (let c of line) {
        if (c.isBomb() && !c.isFlagged()) {
          if (c.exploded) {
            push();
            fill("#f00");
            rect(w * c.j, w * c.i, w, w);
            pop();
          }
          image(bombImg, c.j * w, c.i * w, w, w);
        }
      }
    }
  }

  revealSurrounding(i, j) {
    for (let di = -1; di < 2; di++) {
      for (let dj = -1; dj < 2; dj++) {
        let newI = i + di;
        let newJ = j + dj;
        if (
          !(
            newI < 0 ||
            newJ < 0 ||
            newJ >= this.field[0].length ||
            newI >= this.field.length ||
            !this.field[newI][newJ].isHidden() ||
            (newI === i && newJ === j)
          )
        ) {
          this.reveal(newI, newJ);
        }
      }
    }
  }

  neigbhourIsRevealed(i, j) {
    let res = false;
    for (let di = -1; di < 2; di++) {
      for (let dj = -1; dj < 2; dj++) {
        let newI = i + di;
        let newJ = j + dj;
        if (
          !(
            newI < 0 ||
            newJ < 0 ||
            newJ >= this.field[0].length ||
            newI >= this.field.length ||
            (newI === i && newJ === j)
          )
        ) {
          if (
            !this.field[newI][newJ].isHidden() &&
            this.field[i][j].isHidden() &&
            !this.field[i][j].isFlagged()
          )
            res = true;
        }
      }
    }
    return res;
  }

  getBesideBorder() {
    let res = [];
    for (let l of this.field) {
      for (let c of l) {
        if (this.neigbhourIsRevealed(c.i, c.j)) {
          res.push(c);
        }
      }
    }
    return res;
  }

  getBordersToComplete() {
    let incomplete = [];
    let complete = [];
    for (let l of this.field) {
      for (let c of l) {
        let surrounding = this.getSurrounding(c.i, c.j);
        if (
          !c.isHidden() &&
          !c.isEmpty() &&
          surrounding.flags.length !== c.getValue()
        ) {
          incomplete.push(c);
        } else if (
          !c.isHidden() &&
          !c.isEmpty() &&
          surrounding.flags.length === c.getValue() &&
          surrounding.hidden.length > 0
        ) {
          complete.push(c);
        }
      }
    }
    return { incomplete: incomplete, complete: complete };
  }

  makeRandomChoice() {
    let hidden = [];
    for (let l of this.field) {
      for (let c of l) {
        if (c.isHidden() && !c.isFlagged()) {
          hidden.push(c);
        }
      }
    }
    return random(hidden);
  }

  getSurrounding(i, j) {
    let flags = [];
    let hidden = [];

    for (let di = -1; di < 2; di++) {
      for (let dj = -1; dj < 2; dj++) {
        let newI = i + di;
        let newJ = j + dj;
        if (
          !(
            newI < 0 ||
            newJ < 0 ||
            newJ >= this.field[0].length ||
            newI >= this.field.length ||
            (newI === i && newJ === j)
          )
        ) {
          if (this.field[newI][newJ].isFlagged())
            flags.push(this.field[newI][newJ]);
          else if (this.field[newI][newJ].isHidden())
            hidden.push(this.field[newI][newJ]);
        }
      }
    }
    return { flags: flags, hidden: hidden };
  }

  checkWin() {
    let win = true;
    for (let line of this.field) {
      for (let c of line) {
        if (!c.isBomb() && c.isHidden()) {
          win = false;
        }
      }
    }
    if (win && this.playing) {
      this.end = Date.now();
    }
    this.win = win;
  }

  completeWithFlags() {
    for (let line of this.field) {
      for (let c of line) {
        if (c.isBomb() && c.isHidden() && !c.isFlagged()) {
          c.toggleFlag();
          if (c.isFlagged()) {
            this.bombFlagged++;
          } else {
            this.bombFlagged--;
          }
        }
      }
    }
    background(51);
    this.show();
    this.playing = false;
  }

  check(i, j) {
    let v = this.field[i][j].getValue();
    if (v === undefined) return;
    let flags = 0;
    for (let di = -1; di < 2; di++) {
      for (let dj = -1; dj < 2; dj++) {
        let newI = i + di;
        let newJ = j + dj;
        if (
          !(
            newI < 0 ||
            newJ < 0 ||
            newJ >= this.field[0].length ||
            newI >= this.field.length ||
            (newI === i && newJ === j)
          )
        ) {
          if (this.field[newI][newJ].isFlagged()) flags++;
        }
      }
    }
    if (flags === v) {
      this.revealSurrounding(i, j);
    }
  }

  flag(i, j) {
    for (let line of this.field) {
      for (let c of line) {
        if (c.i === i && c.j === j) {
          c.toggleFlag();
          if (c.isFlagged()) {
            this.bombFlagged++;
          } else {
            this.bombFlagged--;
          }
          return;
        }
      }
    }
  }

  isHidden(i, j) {
    for (let line of this.field) {
      for (let c of line) {
        if (c.i === i && c.j === j) {
          return c.isHidden();
        }
      }
    }
  }

  getHiddens() {
    let res = [];
    for (let l of this.field) {
      for (let c of l) {
        if (c.isHidden() && !c.isFlagged()) res.push(c);
      }
    }
    return res;
  }

  placeBombs(n) {
    let placed = 0;
    while (placed < n) {
      let y = floor(random(this.field[0].length));
      let x = floor(random(this.field.length));
      if (!this.field[x][y].isBomb()) {
        this.field[x][y].setBomb();
        placed++;
      }
    }
  }

  placeIndicators() {
    for (let i = 0; i < this.field.length; i++) {
      for (let j = 0; j < this.field[i].length; j++) {
        // if it's a bomb
        if (this.field[i][j].isBomb()) {
          // increment all surounding
          this.incrementSurounding(i, j);
        }
      }
    }
  }

  incrementSurounding(i, j) {
    for (let di = -1; di < 2; di++) {
      for (let dj = -1; dj < 2; dj++) {
        let newI = i + di;
        let newJ = j + dj;
        if (
          !(
            newI < 0 ||
            newJ < 0 ||
            newJ >= this.field[0].length ||
            newI >= this.field.length ||
            this.field[newI][newJ].isBomb() ||
            (newI === i && newJ === j)
          )
        ) {
          this.field[newI][newJ].add();
        }
      }
    }
  }

  showTime() {
    let t;
    if (this.playing && !gameOver) {
      t = floor((Date.now() - this.start) / 1000);
    } else if (this.end === 0) {
      t = 0;
    } else {
      t = floor((this.end - this.start) / 1000);
    }
    if (t < 10) {
      t = "00" + t;
    } else if (t < 100) {
      t = "0" + t;
    }
    push();
    fill(255);
    textSize(20);
    text(t, w * this.field[0].length + 20, 25);
    pop();
  }

  showBombsRemaining() {
    push();
    fill(255);
    textSize(20);
    let b = this.numbombs - this.bombFlagged;
    text("bombs : " + b, w * this.field[0].length + 20, 25 * 3);
    pop();
  }

  show() {
    for (let l of this.field) {
      for (let c of l) {
        c.show();
      }
    }
    this.showTime();
    this.showBombsRemaining();
  }

  print() {
    let txt = "";
    for (let line of this.field) {
      for (let cell of line) {
        if (cell.isBomb()) txt += "B ";
        else if (cell.isEmpty()) txt += "- ";
        else txt += cell.value + " ";
      }
      txt += "\n";
    }
    print(txt);
  }
}
