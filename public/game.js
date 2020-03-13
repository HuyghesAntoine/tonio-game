const ctx = canvas.getContext('2d');
const socket = io();
socket.on('')

let players = [];
function drawPlayers() {
  players.forEach(function ({ x, y, size, c, life, score, damage }) {
    ctx.beginPath();
    ctx.rect(x, y, size, size);
    ctx.fillStyle = c;
    ctx.fill();
  });
}

let bots = [];
function drawBots() {
  bots.forEach(function ({ x, y, size, c, life }) {
    ctx.beginPath();
    ctx.rect(x, y, size, size);
    ctx.fillStyle = c;
    ctx.fill();
  });
}

let bonus = [];
function drawBonus(){
  bonus.forEach(function({x,y,size,c, speed}) {
    ctx.beginPath();
    ctx.rect(x,y,size,size);
    ctx.fillStyle = c; 
    ctx.fill();
  });
}

let walls = [];
function drawWall() {
  walls.forEach(function ({ x, y, size, c, life, speed }) {
    ctx.beginPath();
    ctx.rect(x, y, size, size * 10);
    ctx.fillStyle = c;
    ctx.fill();
  });
}

let boss = [];
function drawBoss() {
  boss.forEach(function ({ x, y, size, c, life }) {
    ctx.beginPath();
    ctx.rect(x, y, size, size);
    ctx.fillStyle = c;
    ctx.fill();
  });
}

let shoots = [];
function drawFire() {
  shoots.forEach(function ({ x, y, size, c }) {
    ctx.beginPath();
    ctx.rect(x, y, size, size);
    ctx.fillStyle = c;
    ctx.fill();
  });
}

function drawStatus() {
  Object.values(players).forEach(function (player) {
    ctx.font = "15px Georgia";
    ctx.fillStyle = "black";
    ctx.fillText("Damage :", 150, 15)
    ctx.fillText(`${player.damage}`, 220, 15);
    ctx.fillStyle = player.c;
    ctx.fillText(`${player.life}`, player.x, player.y);
    ctx.fillText("Score :", 50, 15);
    ctx.fillText(`${player.score}`, 100, 15);
  });
}


function drawgameover() {
  Object.values(players).forEach(function (player) {
    if (player.life <= 00) {
      ctx.font = "50px Georgia";
      ctx.fillStyle = "black";
      ctx.fillText("PRESS R TO RESTART THE GAME", 150, 250);
      
    }
  });
}

// first call
requestAnimationFrame(update);

const keyboard = {};

window.onkeydown = function (e) {
  keyboard[e.keyCode] = true;
};

window.onkeyup = function (e) {
  delete keyboard[e.keyCode];
};

function upgrade() {
  if (keyboard[85]) {
    Object.values(players).forEach(function (player) {
      socket.emit('upgrade');
    });
  }
}

// function pseudo(){
//   socket.emit('pseudo');
// }

function restart(){
   if (keyboard[82])
      socket.emit('restart');
 }

function fire() {
  if (keyboard[32])
    socket.emit('fire');
}

var BoumBot = new Audio('../sounds/boumbot.mp3');


    socket.on('botDead', function(){
      BoumBot.play();
    });


function movePlayer() {
  if (keyboard[37]) socket.emit('move left');
  if (keyboard[38]) socket.emit('move up');
  if (keyboard[39]) socket.emit('move right');
  if (keyboard[40]) socket.emit('move down');
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  movePlayer();
  fire();
  upgrade();
  restart();
  drawPlayers();
  drawWall();
  drawBoss();
  drawStatus();
  drawBots();
  drawBonus();
  drawFire();
  drawgameover();
  requestAnimationFrame(update);
}

socket.on('update', function (data) {
  bonus = data.bonus;
  bots = data.bots;
  walls = data.walls;
  players = data.players;
  shoots = data.shoots;
  boss = data.boss;
});
