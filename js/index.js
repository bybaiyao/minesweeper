function Mine(col, row, mineNumTotal) {
  this.col = col; //总列数
  this.row = row; //总行数
  this.mineNumTotal = mineNumTotal; //总的地雷数
  this.noMarkNum = mineNumTotal; //未标记的雷的数量

  //获取棋盘的DOM对象
  this.chessBoard = document.getElementsByClassName("gamearea")[0];
  this.squares = []; //存放所有的方格的对象信息
  this.tds = []; //存放所有方格的DOM信息
  this.mineaddr = []; //雷的位置
  this.firstClick = true;
  this.open = 0;
}

Mine.prototype.random = function (row, col) {
  //参数为第一次点击的方格的定位
  let result = [];
  let len = this.row * this.col - 1;
  //第一次点击的方格不会是雷
  for (let i = 0; i < len; i++) {
    if (i == row * this.col + col) {
      continue;
    } else {
      result.push(i);
    }
  }
  function shuffle(arr) {
    if (!arr || !arr.length) return -1;
    let length = arr.length;
    for (let i = length - 1; i > 0; i--) {
      let randomIndex = Math.floor(Math.random() * i); //生成一个随机数作为数组的一个index
      [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]]; //交换当前index的元素和生成的随机index的元素的值
    }
    return arr;
  }
  shuffle(result);

  //   result.sort(function () {
  //     // return 0.5 - Math.random();
  //     function getRandom(min, max) {
  //       const randomBuffer = new Uint32Array(1);
  //       window.crypto.getRandomValues(randomBuffer);
  //       let randomNumber = randomBuffer[0] / (0xffffffff + 1);
  //       min = Math.ceil(min);
  //       max = Math.floor(max);
  //       return Math.floor(randomNumber * (max - min + 1)) + min;
  //     }
  //     const arr = getRandom(0, 10);
  //     return 5 - arr;
  //   });
  return result.slice(0, this.mineNumTotal);
};
Mine.prototype.createDom = function () {
  let This = this;
  let table = document.createElement("table");
  for (let i = 0; i < this.row; i++) {
    let row = document.createElement("tr");
    this.tds[i] = [];
    for (let j = 0; j < this.col; j++) {
      let col = document.createElement("td");
      col.pos = [i, j];
      col.onmousedown = function (event) {
        This.play(event, col);
      };
      this.tds[i][j] = col;
      row.appendChild(col);
    }
    table.appendChild(row);
  }
  this.chessBoard.innerHTML = "";
  this.chessBoard.appendChild(table);

  this.noMarkDom = document.getElementsByClassName("noMark")[0];
  this.noMarkDom.innerHTML = this.mineNumTotal;
};

Mine.prototype.init = function (row, col) {
  let minePos = this.random(row, col);
  let n = 0;

  console.log(minePos);

  for (let i = 0; i < this.row; i++) {
    this.squares[i] = [];
    for (let j = 0; j < this.col; j++) {
      if (minePos.indexOf(n++) != -1) {
        this.mineaddr.push([i, j]);
        this.squares[i][j] = { type: "mine", row: i, col: j, isOpen: false }; //false:未展开 true：展开
      } else {
        this.squares[i][j] = {
          type: "number",
          row: i,
          col: j,
          isOpen: false,
          value: 0,
          flagnum: 0,
        };
      }
    }
  }
  this.updateValue();
  this.chessBoard.oncontextmenu = function () {
    return false;
  };
};
// Mine.prototype.flush=function(){
//     for(let i=0;i<this.row;i++){
//         for(let j=0;j<this.col;j++){

//         }
//     }
// }
Mine.prototype.nine = function (r, c, isFlag) {
  let result = [];
  this.squares[r][c].flagnum = 0;

  // 九宫格位置
  // row-1，col-1   row-1，col   row-1，col+1
  //  row，col-1     row，col     row，col+1
  // row+1，col-1   row+1，col   row+1，col+1
  if (isFlag) {
    for (let i = r - 1; i <= r + 1; i++) {
      for (let j = c - 1; j <= c + 1; j++) {
        if (
          i < 0 ||
          i >= this.row ||
          j < 0 ||
          j >= this.col ||
          (i == r && j == c) ||
          this.squares[i][j].isOpen
        ) {
          continue;
        } else {
          if (this.tds[i][j].className == "flag") {
            this.squares[r][c].flagnum += 1;
          } else {
            result.push([i, j]);
          }
        }
      }
    }
  } else {
    for (let i = r - 1; i <= r + 1; i++) {
      for (let j = c - 1; j <= c + 1; j++) {
        if (
          i < 0 ||
          i >= this.row ||
          j < 0 ||
          j >= this.col ||
          (i == r && j == c) ||
          this.squares[i][j].type == "mine"
        ) {
          continue;
        } else {
          result.push([i, j]);
        }
      }
    }
  }

  return result;
};
Mine.prototype.updateValue = function () {
  for (let i = 0; i < this.mineaddr.length; i++) {
    let findNum = this.nine(this.mineaddr[i][0], this.mineaddr[i][1], false);
    for (let j = 0; j < findNum.length; j++) {
      this.squares[findNum[j][0]][findNum[j][1]].value += 1;
    }
  }
};
Mine.prototype.play = function (e, obj) {
  let This = this; //保存实例对象mine

  function getAllZero(square) {
    let findNum = This.nine(square.row, square.col, false);
    for (let i = 0; i < findNum.length; i++) {
      let ro = findNum[i][0];
      let co = findNum[i][1];
      if (This.tds[ro][co].className == "flag") {
        continue;
      }
      This.tds[ro][co].classList.add(numCss[This.squares[ro][co].value]);
      if (This.squares[ro][co].value == 0) {
        if (!This.squares[ro][co].isOpen) {
          This.squares[ro][co].isOpen = true;
          This.open += 1;
          getAllZero(This.squares[ro][co]);
        }
      } else {
        if (!This.squares[ro][co].isOpen) {
          This.tds[ro][co].innerHTML = This.squares[ro][co].value;
          This.squares[ro][co].isOpen = true;
          This.open += 1;
        }
      }
    }
  }

  if (e.which == 1) {
    if (this.firstClick) {
      this.init(obj.pos[0], obj.pos[1]);
      this.firstClick = false;
    }

    let squareInfo = this.squares[obj.pos[0]][obj.pos[1]];

    if (obj.className == "flag") {
      obj.classList.remove("flag");
      this.noMarkDom.innerHTML = ++this.noMarkNum;
      return;
    }

    if (squareInfo.type == "number") {
      if (!squareInfo.isOpen) {
        obj.innerHTML = squareInfo.value;
        obj.classList.add(numCss[squareInfo.value]);
        squareInfo.isOpen = true;
        this.open += 1;
        //如果用户的数字是0
        if (squareInfo.value == 0) {
          obj.innerHTML = "";
          getAllZero(squareInfo);
        }
      } else {
        //左键已经展开的数字
        let blank = This.nine(squareInfo.row, squareInfo.col, true); //返回被点击方格周围未展开方格且未标旗方格的位置
        if (squareInfo.flagnum == This.squares[obj.pos[0]][obj.pos[1]].value) {
          for (let i = 0; i < blank.length; i++) {
            let bobj = This.tds[blank[i][0]][blank[i][1]];
            let bsquare = This.squares[blank[i][0]][blank[i][1]];
            if (!bsquare.isOpen) {
              if (bsquare.type == "number") {
                bobj.innerHTML = bsquare.value;
                bobj.classList.add(numCss[bsquare.value]);
                bsquare.isOpen = true;
                this.open += 1;
                //如果用户的数字是0
                if (bsquare.value == 0) {
                  bobj.innerHTML = "";
                  getAllZero(bsquare);
                }
              } else {
                this.gameOver(bobj);
              }
            }
          }
        } else {
          for (let i = 0; i < blank.length; i++) {
            let bobj = This.tds[blank[i][0]][blank[i][1]];
            let bsquare = This.squares[blank[i][0]][blank[i][1]];
            bobj.classList.add(numCss[0]);
            let shan = setTimeout(fn, 100, bobj);
            function fn(bobj) {
              bobj.classList.remove(numCss[0]);
            }
          }
        }
      }
    } else if (squareInfo.type == "mine") {
      this.gameOver(obj);
    }
  }
  //用户点击右键
  if (e.which == 3) {
    if (this.firstClick) {
      this.init(obj.pos[0], obj.pos[1]);
      this.firstClick = false;
    }

    let squareInfo = this.squares[obj.pos[0]][obj.pos[1]];
    if (!squareInfo.isOpen) {
      obj.className = obj.className == "flag" ? "" : "flag";
      if (obj.className == "flag") {
        this.noMarkDom.innerHTML = --this.noMarkNum;
      } else {
        this.noMarkDom.innerHTML = ++this.noMarkNum;
      }
    } else {
      //右键展开了的数字
      let blank = This.nine(squareInfo.row, squareInfo.col, true); //返回被点击方格周围未展开方格且未标旗方格的位置
      if (squareInfo.flagnum == This.squares[obj.pos[0]][obj.pos[1]].value) {
        for (let i = 0; i < blank.length; i++) {
          let bobj = This.tds[blank[i][0]][blank[i][1]];
          let bsquare = This.squares[blank[i][0]][blank[i][1]];
          if (!bsquare.isOpen) {
            if (bsquare.type == "number") {
              bobj.innerHTML = bsquare.value;
              bobj.classList.add(numCss[bsquare.value]);
              bsquare.isOpen = true;
              this.open += 1;
              //如果用户的数字是0
              if (bsquare.value == 0) {
                bobj.innerHTML = "";
                getAllZero(bsquare);
              }
            } else {
              this.gameOver(bobj);
            }
          }
        }
      } else {
        for (let i = 0; i < blank.length; i++) {
          let bobj = This.tds[blank[i][0]][blank[i][1]];
          let bsquare = This.squares[blank[i][0]][blank[i][1]];
          bobj.classList.add(numCss[0]);
          let shan = setTimeout(fn, 100, bobj);
          function fn(bobj) {
            bobj.classList.remove(numCss[0]);
          }

          // clearTimeout(shan);
        }
      }
    }
  }
  console.log(this.open);
  if (!this.noMarkNum && this.open == this.row * this.col - this.mineNumTotal) {
    this.end();
  }
};
Mine.prototype.end = function () {
  for (let i = 0; i < this.row; i++) {
    for (let j = 0; j < this.col; j++) {
      this.tds[i][j].onmousedown = null;
    }
  }
};
Mine.prototype.gameOver = function (obj) {
  let flags = document.querySelectorAll(".flag");

  for (let i = 0; i < flags.length; i++) {
    let square = this.squares[flags[i].pos[0]][flags[i].pos[1]];
    console.log(square);
    if (square.type == "number") {
      let shan = setInterval(fn2, 300, flags[i], square);
      function fn2(obj, ssquare) {
        if (obj.className == "flag") {
          obj.classList.remove("flag");
          if (ssquare.value) {
            obj.innerHTML = ssquare.value;
          }
          obj.classList.add(numCss[ssquare.value]);
        } else {
          obj.innerHTML = "";
          obj.classList.remove(numCss[ssquare.value]);
          obj.classList.add("flag");
        }
      }
    }
    // flags[i].classList.remove('flag');
  }

  for (let i = 0; i < this.mineaddr.length; i++) {
    this.tds[this.mineaddr[i][0]][this.mineaddr[i][1]].classList.add("mine");
  }
  obj.style.backgroundColor = "#ff0000";
  this.end();
};

let btns = document.getElementsByTagName("button");
let numCss = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eigth",
];
let arr = [
  [9, 9, 10],
  [16, 16, 40],
  [30, 16, 99],
  [55, 27, 317],
];
let mine = null;
let state = 0;
for (let i = 0; i < btns.length - 1; i++) {
  btns[i].addEventListener("click", function () {
    btns[state].className = "";
    this.className = "active";
    state = i;
    mine = new Mine(...arr[i]);
    mine.createDom();
  });
}

let res = document.getElementsByClassName("restart")[0];
res.addEventListener("mousedown", function () {
  res.classList.add("active");
});
res.addEventListener("mouseup", function () {
  res.classList.remove("active");
});

mine = new Mine(...arr[0]);
mine.createDom();

btns[4].addEventListener("click", function () {
  mine = new Mine(...arr[state]);
  mine.createDom();
  mine.firstClick = true;
  mine.noMarkNum = mine.mineNumTotal;
  mine.open = 0;

  //     localStorage.setItem("state",state);

  //     location.reload();
  //     console.log(localStorage.getItem("state"))
  //     let get= parseInt(localStorage.getItem("state"));
  //     console.log(get);

  //     // setTimeout
  // let fun = () => console.log('time out');
  // let sleep = function(fun,time){
  //   setTimeout(()=>{
  //     fun();
  //   },time);
  // }

  // sleep(fun,2000);

  //     btns[get].click();
});
