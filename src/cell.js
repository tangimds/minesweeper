let colors = [
  "#1d00dc",
  "#159100",
  "#cd0018",
  "#00037d",
  "#960000",
  "#00a1d6",
  "#ca006d",
  "#5d0000"
];

class Cell {
  constructor(i, j, v) {
    this.i = i;
    this.j = j;
    this.value = v;
    this.hidden = true;
    this.bomb = false;
    this.col = "#bbb";
    this.flag = false;
    this.exploded = false;
    this.maybe = [];
  }

  resetMaybe(){
    this.maybe =[];
  }
  setBomb() {
    this.bomb = true;
    this.value = -1;
  }

  noBomb() {
    this.bomb = false;
  }

  hide() {
    this.hidden = true;
  }

  reveal() {
    this.hidden = false;
    if (this.bomb) {
      print("DIE");
      gameOver = true;
      this.exploded = true;
    }
  }

  setValue(v) {
    this.value = v;
  }

  add() {
    if (this.isEmpty()) {
      this.value = 1;
    } else {
      this.value++;
    }
  }

  getValue() {
    return this.value;
  }

  isHidden() {
    return this.hidden;
  }

  isBomb() {
    return this.bomb;
  }

  isEmpty() {
    return this.value === undefined;
  }

  toggleFlag() {
    this.flag = !this.flag;
  }

  isFlagged() {
    return this.flag;
  }

  show() {
    if (this.flag) {
      image(flagImg, this.j * w, this.i * w, w, w);
    } else if (this.hidden) {
      image(caseImg, this.j * w, this.i * w, w, w);
    } else if(!this.isBomb()){
      push();
      fill(this.col);
      stroke("#999");
      rect(this.j * w, this.i * w, w, w);
      pop();
      if (!this.isEmpty() ) {
        push();
        fill(colors[this.value - 1]);
        textSize(w - 5);
        textAlign(CENTER, CENTER);
        text(this.value, this.j * w + w / 2, this.i * w + w / 2);
        pop();
      }
    }
  }
}
