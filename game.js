//Create a new scene named "Game"
let gameScene = new Phaser.Scene('Game');

gameScene.init = function(){
  this.playerSpeed = 5;
  this.enemyMaxY = 420;
  this.enemyMinY = 110;
}

//load assests files
gameScene.preload = function(){
  //load image
  this.load.image('background','images/bg.jpg');
  this.load.image('player','images/princess.png');
  this.load.image('dragon','images/dragon.png');
  this.load.image('treasure','images/cat.png');
  this.load.audio('wow','wow.mp3');
  this.load.audio('explode','explode.mp3');
  this.load.audio('bgm','bgm.mp3');
};

//execute once after loading
gameScene.create = function(){
  //background
  let bg = this.add.sprite(0,0,'background');
  bg.setOrigin(0,0);
  bg.displayWidth = this.sys.canvas.width;
  bg.displayHeight = this.sys.canvas.height;

  soundEffect1 = this.sound.add('wow');
  soundEffect2 = this.sound.add('explode');
  bgm = this.sound.add('bgm');
  bgm.play();

  //player
  this.player = this.add.sprite(40, this.sys.game.config.height/1.5,'player');

  //treasure
  this.treasure = this.add.sprite(this.sys.game.config.width - 80,this.sys.game.config.height/1.5,'treasure' );

  //group of dragon
  this.enemies = this.add.group({
    key:'dragon',
    repeat:8,
    setXY:{
      x: 110,
      y:100,
      stepX:80,
      stepY:20
    }
  });
  //scale down 
  this.player.setScale(0.17);
  this.treasure.setScale(0.15);

  //scale enemies
  Phaser.Actions.ScaleXY(this.enemies.getChildren(),-0.5,-0.5);

  //set speed of dragons
  Phaser.Actions.Call(this.enemies.getChildren(),function(enemy){
    enemy.speed = Math.random()*2 +1;
  },this);

  //player is alive
  this.isPlayerAlive = true;

  //reset camera effect
  this.cameras.main.resetFX();
};

gameScene.update = function(){

  //only if the player is alive
  if(!this.isPlayerAlive){
    return;
  }
  //check for active input
  if(this.input.activePointer.isDown){
    //player walk
    this.player.x += this.playerSpeed;
  }

  //treasure collision
  if(Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(),this.treasure.getBounds())){
    soundEffect1.play();
    this.gameOver();
  } 

  //enemy movement
  let enemies = this.enemies.getChildren();
  let numEnemies = enemies.length;

  for (let i=0; i <numEnemies ;i++){
    //move enemies
    enemies[i].y += enemies[i].speed;

    //reverse movement if reach the edge
    if(enemies[i].y >= this.enemyMaxY && enemies[i].speed>0){
      enemies[i].speed *= -1;
    }
    else if (enemies[i].y <= this.enemyMinY && enemies[i].speed<0){
      enemies[i].speed *= -1;
    }

    //enemy collsion
    if(Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(),enemies[i].getBounds())){
      soundEffect2.play();
      this.gameOver();
      break;
    }
  }

};

gameScene.gameOver = function(){
  bgm.stop();
  //flag to set player is dead
  this.isPlayerAlive = false;

  //shake the camera
  this.cameras.main.shake(500);

  //fade out
  this.time.delayedCall(250,function(){
    this.cameras.main.fade(250);
  },[],this);

  //restart the game
  this.time.delayedCall(500,function(){
    this.scene.restart();
  },[],this);
  
;}


//Game's configuration
let config = {
  type: Phaser.AUTO,  //Phaser will decide how to render our game (WebGL or Canvas)
  width: 960, //Game width 
  height: 540, //Game height
  scene: gameScene //The newly created scene
};

//Create game and pass configuration
let game = new Phaser.Game(config);