const socketio = require('socket.io');


module.exports = function (server) {
  // io server
  const io = socketio(server);
  // game state (players list / bots object / shoots object / boss object)
  
  // var boumbot =new  Audio('boumbot.mp3');



  var gameover = Boolean(false);
  let players  = {};
  let shoots = [];
  let bots = [];
  let boss= []; 
  let walls= []; 
  let bonus= []; 
  
  function reset() {  
        Object.values(players).forEach(function(el){
          el.x =  0;
          el.y = 30;
          el.size= 30;
          el.speed =  10;
         el.c =  "#" + ((1 << 24) * Math.random() | 0).toString(16);
          el.life=  100;
          el.score =  0;
          el.damage= 1000;

        }); // joueurs 
        bots = []; // bots
        shoots = []; // tir 
        boss = []; // boss
        walls = []; // Mur 
        bonus = []; // bonusÒ
        gameover = false;
  }

  io.on('connection', function (socket) {

    // register new player
    players[socket.id] = {
      x: 0,
      y: 30,
      size: 30,
      speed: 10,
      c: "#" + ((1 << 24) * Math.random() | 0).toString(16),
      life: 100,
      score: 0,
      damage: 10
    };
    // delete disconnected player
    socket.on('disconnect', function () {
      delete players[socket.id];
    });
  });
  // CREATION DE BOT 
  function spwnbot() {
    bots.push({
      x: 400 + Math.random() * (1000 - 400),
      y: 30 + Math.random() * (445),
      size: 35,
      speed: 1 + Math.random() * (4 - 1),
      c: "#998877", //+ ((1 << 24) * Math.random() | 0).toString(16),
      life: 70
    });
  }
  //CREATION DE "MUR"
  function spwnWall() {
    walls.push({
      x: 70,
      y: 30 + Math.random() * (400),
      size: 10,
      c: "#8f8f8f",
      life: 200,
      speed: 1
    });
  }
  //CREATION DE BOSS 
  function spwnBoss() {
    boss.push({
      x: 900,
      y: 30 + Math.random() * 370,
      size: 100,
      speed: 1,
      c: "#125623", //+ ((1 << 24) * Math.random() | 0).toString(16),
      life: 3000
    });
  }

  // CREATION DES BONUS 
  function spwnBonus() {
    bonus.push({
      x: 900,
      y: 30 + Math.random() * 370,
      size: 35,
      c: "#CF0A1D",
      speed: 3
    });
  }

  // var boombot = new Audio(boumbot.mp3);


  function deadBot(){
    bots.forEach(function(bot){
        if(bot.life <= 00)
          socket.emit('botDead');
    });
  }

  function update() {
    if (gameover) {
      bots.splice(bots.indexOf(bots), 1);
    }
    else {
      Object.values(players).forEach(function (player) {
        shoots.forEach(function (shoot) {

          shoot.x += shoot.speed; // déplacement du projectil 
          bots.forEach(function (bot) { // perte de HP du bot quand le projectile le touche et supprimer le projectile
            if ((shoot.x >= bot.x && shoot.x <= (bot.x + bot.size)) && (shoot.y >= bot.y && shoot.y <= (bot.y + bot.size))) {
              bot.life -= player.damage;
              shoots.splice(shoots.indexOf(shoot), 1);
            }
            if (bot.life <= 00) { // Supprimer un bot quand vie 0 
              bots.splice(bots.indexOf(bot), 1);
              player.score += 10;
              deadBot();
            }
          });
          boss.forEach(function (bos) { // Enlever de la vie au boss
            if ((shoot.x >= bos.x && shoot.x <= (bos.x + bos.size)) && (shoot.y >= bos.y && shoot.y <= (bos.y + bos.size))) {
              bos.life -= player.damage;
              shoots.splice(shoots.indexOf(shoot), 1); // supprimer les tirs 
            }
            if (bos.life <= 00) { // Supprimer un boss quand vie 0 
              boss.splice(boss.indexOf(bos), 1);
              player.score += 50;
            }
          });
          walls.forEach(function (wall) { // Obstacle même principe que pour les bots, mais sans déplacement
            if ((shoot.x >= wall.x && shoot.x <= (wall.x + wall.size)) && (shoot.y >= wall.y && shoot.y <= (wall.y + wall.size * 10))) {
              wall.life -= player.damage;
              shoots.splice(shoots.indexOf(shoot), 1);
            }
            if (wall.life <= 00)
              walls.splice(walls.indexOf(wall), 1);

          });
          if (shoot.x >= 900) // supprimer le projectile quand il dépasse le canvas
            shoots.splice(shoots.indexOf(shoot), 1);
        });
      });

      boss.forEach(function (bos) {
        bos.x -= bos.speed;
        Object.values(players).forEach(function (player) {
          if (bos.x <= 0) {
            player.life -= 50;
            boss.splice(boss.indexOf(bos), 1);
          }
          if ((player.x >= bos.x && player.x <= (bos.x + bos.size)) && (player.y >= bos.y && player.y <= (bos.y + bos.size))) {
            player.life -= 50;
            boss.splice(boss.indexOf(bos), 1);
          }
        });
      });

      bots.forEach(function (bot) {
        bot.x -= bot.speed;
        Object.values(players).forEach(function (player) {
          if (bot.x <= 0) {
            player.life -= 10;
            bots.splice(bots.indexOf(bot), 1);
          }
          if ((player.x >= bot.x && player.x <= (bot.x + bot.size)) && (player.y >= bot.y && player.y <= (bot.y + bot.size))) {
            player.life -= 5;
            bots.splice(bots.indexOf(bot), 1);
          }

        });
      });

      bonus.forEach(function (bonu) {
        bonu.x -= bonu.speed;
        Object.values(players).forEach(function (player) {
          if (bonu.x <= 0)
            bonus.splice(bonus.indexOf(bonu), 1);
          if ((player.x >= bonu.x && player.x <= (bonu.x + bonu.size)) && (player.y >= bonu.y && player.y <= (bonu.y + bonu.size))) {
            player.life += 20;
            bonus.splice(bonus.indexOf(bonu), 1);
          }
        });
      });

      Object.values(players).forEach(function (player) {
        shoots.forEach(function (shoot) {
          if (player.damage > 0 && player.damage <= 100)
            shoot.c = "#013AB4";
          if (player.damage > 100 && player.damage <= 500)
            shoot.c = "#3CB371";
          if (player.damage > 500 && player.damage <= 1000)
            shoot.c = "#DC143C";
          if (player.damage > 1000)
            shoot.c = "#" + ((1 << 12) * Math.random() | 0).toString(16);
        });
      });

      walls.forEach(function (wall) {
        // if(wall.y < 400 && wall.y > 30)
        //   wall.y -= wall.speed;
        // if(wall.y == 30)
        //   wall.y += wall.speed;
      });

      Object.values(players).forEach(function (player) {
        if (player.life <= 00)
          gameover = true;
      });

      io.volatile.emit('update', { players: Object.values(players), shoots, bots, walls, boss, bonus });
    }
  }

  setInterval(update, 1000 / 60); // interval de raffraichissement 
  setInterval(spwnbot, 1000); // interval de spwn des bots
  setInterval(spwnWall, 6000); // spwn des murs
  setInterval(spwnBoss, 24000); // interval des boss
  setInterval(spwnBonus, 6500); // interval des bonus


  io.on('connection', function (socket) {
    //...
    socket.on('move left', function () {
      if (players[socket.id].x - players[socket.id].speed >= 0) {
        players[socket.id].x -= players[socket.id].speed
      }
    });
    socket.on('move up', function () {
      if (players[socket.id].y - players[socket.id].speed >= 30) {
        players[socket.id].y -= players[socket.id].speed
      }
    });
    socket.on('move right', function () {
      if (players[socket.id].x + players[socket.id].size + players[socket.id].speed <= 30) {
        players[socket.id].x += players[socket.id].speed
      }
    });
    socket.on('move down', function () {
      if (players[socket.id].y + players[socket.id].size + players[socket.id].speed <= 500) {
        players[socket.id].y += players[socket.id].speed
      }
    });
    socket.on('fire', function () {
      shoots.push({
        x: players[socket.id].x + 22,
        y: players[socket.id].y + 14,
        size: 4,
        speed: 8,
        c: "#5F9EA0",
        cooldown: 0
      })

    });
    socket.on('upgrade', function () {
      if (players[socket.id].score >= 100) {
        players[socket.id].score -= 100;
        players[socket.id].damage += 10.5;
      }
    });
    socket.on('restart', function () {
      if(players[socket.id].life <= 00)
          reset();
    });
  });
};








