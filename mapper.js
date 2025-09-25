// wrapper for our game "classes", "methods" and "objects"
window.Game = {};

// wrapper for "class" Rectangle
(function() {
  function Rectangle(left, top, width, height) {
    this.left = left || 0;
    this.top = top || 0;
    this.width = width || 0;
    this.height = height || 0;
    this.right = this.left + this.width;
    this.bottom = this.top + this.height;
  }

  Rectangle.prototype.set = function(left, top, /*optional*/ width, /*optional*/ height) {
    this.left = left;
    this.top = top;
    this.width = width || this.width;
    this.height = height || this.height
    this.right = (this.left + this.width);
    this.bottom = (this.top + this.height);
  }

  Rectangle.prototype.within = function(r) {
    return (r.left <= this.left &&
      r.right >= this.right &&
      r.top <= this.top &&
      r.bottom >= this.bottom);
  }

  Rectangle.prototype.overlaps = function(r) {
    return (this.left < r.right &&
      r.left < this.right &&
      this.top < r.bottom &&
      r.top < this.bottom);
  }

  Rectangle.prototype.containsPoint = function(p) {
    return p.x >= this.left &&
      p.x <= this.right &&
      p.y >= this.top &&
      p.y <= this.bottom;
  }

  // add "class" Rectangle to our Game object
  Game.Rectangle = Rectangle;
})();

// wrapper for "class" Camera (avoid global objects)
(function() {

  // possibles axis to move the camera
  var AXIS = {
    NONE: 1,
    HORIZONTAL: 2,
    VERTICAL: 3,
    BOTH: 4
  };

  // Camera constructor
  function Camera(xView, yView, viewportWidth, viewportHeight, worldWidth, worldHeight) {
    // position of camera (left-top coordinate)
    this.xView = xView || 0;
    this.yView = yView || 0;
    
    this.speed = 200;

    // distance from followed object to border before camera starts move
    this.xDeadZone = 0; // min distance to horizontal borders
    this.yDeadZone = 0; // min distance to vertical borders

    // viewport dimensions
    this.wView = viewportWidth;
    this.hView = viewportHeight;

    // allow camera to move in vertical and horizontal axis
    this.axis = AXIS.BOTH;

    // rectangle that represents the viewport
    this.viewportRect = new Game.Rectangle(this.xView, this.yView, this.wView, this.hView);

    // rectangle that represents the world's boundary (room's boundary)
    this.worldRect = new Game.Rectangle(0, 0, worldWidth, worldHeight);

  }

  Camera.prototype.cursorPosition = function(e) {
    var getMousePos = function(canvas, evt) {
      var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

      return {
        x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
        y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
      }
    };

    var canvas = document.getElementById("gameCanvas");
    var ctx = canvas.getContext("2d");
    const rawPos = getMousePos(canvas, e);          // get adjusted coordinates as above
    return {
      x: rawPos.x + this.xView,
      y: rawPos.y + this.yView
    };
  }

  Camera.prototype.update = function(step, worldWidth, worldHeight) {
    // check controls and move the player accordingly
    if (Game.controls.left)
      this.xView -= this.speed * step;
    if (Game.controls.up)
      this.yView -= this.speed * step;
    if (Game.controls.right)
      this.xView += this.speed * step;
    if (Game.controls.down)
      this.yView += this.speed * step;

    // update viewportRect
    this.viewportRect.set(this.xView, this.yView);

    // don't let camera leaves the world's boundary
    // if (!this.viewportRect.within(this.worldRect)) {
    //   if (this.viewportRect.left < this.worldRect.left)
    //     this.xView = this.worldRect.left;
    //   if (this.viewportRect.top < this.worldRect.top)
    //     this.yView = this.worldRect.top;
    //   if (this.viewportRect.right > this.worldRect.right)
    //     this.xView = this.worldRect.right - this.wView;
    //   if (this.viewportRect.bottom > this.worldRect.bottom)
    //     this.yView = this.worldRect.bottom - this.hView;
    // }

  }

  // add "class" Camera to our Game object
  Game.Camera = Camera;

})();

// wrapper for "class" Map
(function() {
  function Map(width, height) {
    // map dimensions
    this.width = width;
    this.height = height;

    // map texture
    this.image = null;

    // map data
    this.data = null;

    // rooms
    this.rooms = [];
  }

  // creates a prodedural generated map (you can use an image instead)
  Map.prototype.generate = function(mapData, zLayer) { 
    this.data = mapData;
    var ctx = document.createElement("canvas").getContext("2d");
    ctx.canvas.width = this.width;
    ctx.canvas.height = this.height;
    
    ctx.save();
    for (let room of mapData.rooms) {
      // if (room.coords[2] != zLayer) continue;
      for (let exit of room.exits) {
        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.moveTo(room.coords[0] * 44 + 15, room.coords[1] * 44 + 15);
        ctx.lineTo(exit[0] * 44 + 15, exit[1] * 44 + 15);
        ctx.stroke();
        ctx.closePath();
      }
    }
    for (let roomData of mapData.rooms) {    
      // if (room.coords[2] != zLayer) continue;    
      let room = new Game.Map.Room(roomData);
      room.render(ctx, false);
      this.rooms.push(room)
    }
    ctx.restore();

    // store the generate map as this image texture
    this.image = new Image();
    this.image.src = ctx.canvas.toDataURL("image/png");

    // clear context
    ctx = null;
  }

  // draw the map adjusted to camera
  Map.prototype.draw = function(context, xView, yView) {
    // easiest way: draw the entire map changing only the destination coordinate in canvas
    // canvas will cull the image by itself (no performance gaps -> in hardware accelerated environments, at least)
    /*context.drawImage(this.image, 0, 0, this.image.width, this.image.height, -xView, -yView, this.image.width, this.image.height);*/

    // didactic way ( "s" is for "source" and "d" is for "destination" in the variable names):

    var sx, sy, dx, dy;
    var sWidth, sHeight, dWidth, dHeight;

    // offset point to crop the image
    sx = xView;
    sy = yView;

    // dimensions of cropped image			
    sWidth = context.canvas.width;
    sHeight = context.canvas.height;

    // if cropped image is smaller than canvas we need to change the source dimensions
    if (this.image.width - sx < sWidth) {
      sWidth = this.image.width - sx;
    }
    if (this.image.height - sy < sHeight) {
      sHeight = this.image.height - sy;
    }

    // location on canvas to draw the croped image
    dx = 0;
    dy = 0;
    // match destination with source to not scale the image
    dWidth = sWidth;
    dHeight = sHeight;

    context.drawImage(this.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  }

  // add "class" Map to our Game object
  Game.Map = Map;

})();

// wrapper for "class" Room
(function() {
  function Room(data) {
    this.data = data;
    this.rect = new Game.Rectangle(this.x() * 44, this.y() * 44, 30, 30);
  }

  Room.prototype.x = function() {
    return this.data.coords[0];
  }

  Room.prototype.y = function() {
    return this.data.coords[1];
  }

  Room.prototype.z = function() {
    return this.data.coords[2];
  }

  Room.prototype.name = function() {
    return this.data.name;
  }

  Room.prototype.render = function(ctx, selected) {
    ctx.beginPath();
    ctx.fillStyle = "#373737";
    ctx.strokeStyle = "#138236";
    ctx.rect(this.rect.left, this.rect.top, this.rect.width, this.rect.height);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }

  Game.Map.Room = Room;
})();

// wrapper for "class" Controller
(function() {
function Controller(map, camera) {
  // map dimensions
  this.map = map;
  this.camera = camera;
}

Controller.prototype.update = function() {
  if (Game.controls.mousePos === undefined) {
    return;
  }

  let foundRoom = false;
  const cursorPosition = this.camera.cursorPosition(Game.controls.mousePos);
  for (let room of this.map.rooms) {        
    if (room.rect.containsPoint(cursorPosition.x, cursorPosition.y)) {
      // We're hovering.
      console.log(room.name());
      document.getElementById("map-room-title").innerHTML = room.name();
      foundroom = true;
    }
  }
  if (!foundRoom) {
    document.getElementById("map-room-title").innerHTML = "";
  }
}
// add "class" Map to our Game object
Game.Controller = Controller;

})();

// Game Script
(function() {
  // prepare our game canvas
  var canvas = document.getElementById("gameCanvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  var context = canvas.getContext("2d");

  // game settings:	
  const FPS = 30;
  const INTERVAL = 1000 / FPS; // milliseconds
  const STEP = INTERVAL / 1000 // seconds

  // setup an object that represents the room
  var room = {
    width: 5000,
    height: 3000,
    map: new Game.Map(5000, 3000)
  };

  // Set the right viewport size for the camera
  var vWidth = Math.min(room.width, canvas.width);
  var vHeight = Math.min(room.height, canvas.height);

  // Setup the camera
  var camera = new Game.Camera(0, 0, vWidth, vHeight, room.width, room.height);

  var controller = new Game.Controller(room.map, camera);

  // Game update function
  var update = function() {
    camera.update(STEP, room.width, room.height);
    controller.update();
  }

  // Game draw function
  var draw = function() {
    // clear the entire canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // redraw all objects
    room.map.draw(context, camera.xView, camera.yView);
  }

  // Game Loop
  var gameLoop = function() {
    update();
    draw();
  }

  Game.initialize = function(mapData) {
    // generate a large image texture for the room
    room.map.generate(mapData, 100);
    document.getElementById("map-area-title").innerHTML = mapData.area;
  }

  // <-- configure play/pause capabilities:

  // Using setInterval instead of requestAnimationFrame for better cross browser support,
  // but it's easy to change to a requestAnimationFrame polyfill.

  var runningId = -1;

  Game.play = function() {
    if (runningId == -1) {
      runningId = setInterval(function() {
        gameLoop();
      }, INTERVAL);
      console.log("play");
    }
  }

  Game.togglePause = function() {
    if (runningId == -1) {
      Game.play();
    } else {
      clearInterval(runningId);
      runningId = -1;
      console.log("paused");
    }
  }

  // -->

})();

// <-- configure Game controls:

Game.controls = {
  left: false,
  up: false,
  right: false,
  down: false,
  mousePos: undefined,
  mouseClick: false
};

window.addEventListener('mousedown', function(e) {
  Game.controls.mouseClick = true;
});

window.addEventListener('mouseup', function(e) {
  Game.controls.mouseClick = false;
});

window.addEventListener('mousemove', function(e) {
  Game.controls.mousePos = e;
});

window.addEventListener("keydown", function(e) {
  switch (e.keyCode) {
    case 37: // left arrow
      Game.controls.left = true;
      break;
    case 38: // up arrow
      Game.controls.up = true;
      break;
    case 39: // right arrow
      Game.controls.right = true;
      break;
    case 40: // down arrow
      Game.controls.down = true;
      break;
  }
}, false);

window.addEventListener("keyup", function(e) {
  switch (e.keyCode) {
    case 37: // left arrow
      Game.controls.left = false;
      break;
    case 38: // up arrow
      Game.controls.up = false;
      break;
    case 39: // right arrow
      Game.controls.right = false;
      break;
    case 40: // down arrow
      Game.controls.down = false;
      break;
    case 80: // key P pauses the game
      Game.togglePause();
      break;
  }
}, false);