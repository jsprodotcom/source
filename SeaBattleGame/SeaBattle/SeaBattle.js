// SeaBattle.js

var SeaBattle =
{
   // ==========================================================================
   // Initialize the game.
   // 
   // Parameters:
   // 
   // width  - desired canvas width (in pixels)
   // height - desired canvas height (in pixels)
   //
   // Return value:
   //
   // none
   // ==========================================================================

   init: function(width, height)
         {
            var canvas = $("<canvas width='"+width+"' height='"+height+
                           "'></canvas>");
            canvas.appendTo("body");
            SeaBattle.ctx = canvas.get(0).getContext("2d");
   /*
            var canvas = document.createElement("canvas");
            canvas.setAttribute("width", width);
            canvas.setAttribute("height", height);
            document.getElementsByTagName("body")[0].appendChild(canvas);
            SeaBattle.ctx = canvas.getContext("2d");
   */
            SeaBattle.ctx.font = "30px Arial";
            SeaBattle.ctx.textAlign = "center";

            var seed = 5*height/6;
            SeaBattle.hillTops = new Array();
            for (var i = 0; i < width; i++)
            {
               SeaBattle.hillTops.push(seed);
               var x = SeaBattle.rnd(seed);
               if (x < seed/4)
               {
                  if (--seed < 2*height/3)
                     seed = 2*height/3;
               }
               else
               if (x > 3*seed/4)
               {
                  if (++seed > height-1)
                     seed = height-1;
               }
            }

            SeaBattle.width = width;
            SeaBattle.height = height;

            SeaBattle.dc = new Array(SeaBattle.MAX_DC);
            SeaBattle.torp = new Array(SeaBattle.MAX_TORP);
            SeaBattle.explosion = null;
            SeaBattle.msg = "";
            SeaBattle.score = 0;
            SeaBattle.hiScore = 0;
            if (SeaBattle.supports_html5_storage())
            {
               var temp = localStorage.getItem("hiScore");
               if (temp != undefined)
                  SeaBattle.hiScore = temp;
            }
            SeaBattle.lives = 4;

            window.keydown = {};
            function keyName(event) 
            {
               return jQuery.hotkeys.specialKeys[event.which] ||
                      String.fromCharCode(event.which).toLowerCase();
            }
            $(document).bind("keydown", function(event) 
                                        {
                                           keydown[keyName(event)] = true;
                                        });
            $(document).bind("keyup", function(event) 
                                      {
                                         keydown[keyName(event)] = false;
                                      });

            SeaBattle.imgTitle = new Image();
            SeaBattle.imgTitle.src = "images/title.png";

            SeaBattle.imgSky = new Image();
            SeaBattle.imgSky.src = "images/sky.png";

            SeaBattle.imgMoon = new Image();
            SeaBattle.imgMoon.src = "images/moon.png";

            SeaBattle.imgShipLeft = new Image();
            SeaBattle.imgShipLeft.src = "images/shipLeft.png";

            SeaBattle.imgShipRight = new Image();
            SeaBattle.imgShipRight.src = "images/shipRight.png";

            SeaBattle.imgSubLeft = new Image();
            SeaBattle.imgSubLeft.src = "images/subLeft.png";

            SeaBattle.imgSubRight = new Image();
            SeaBattle.imgSubRight.src = "images/subRight.png";

            SeaBattle.imgExplosion = new Array();
            for (var i = 0; i < 17; i++)
            {
               var image = new Image();
               image.src = "images/ex"+i+".png";
               SeaBattle.imgExplosion.push(image);
            }

            SeaBattle.imgTorpedo = new Image();
            SeaBattle.imgTorpedo.src = "images/torpedo.png";

            SeaBattle.imgDC = new Image();
            SeaBattle.imgDC.src = "images/dc.png";

            SeaBattle.audBombLoaded = false;
            SeaBattle.audBomb = document.createElement("audio");
            SeaBattle.audBomb.onloadeddata = 
               new function()
               {
                  SeaBattle.audBombLoaded = true;
               };
            SeaBattle.audBomb.src = (navigator.userAgent.indexOf("MSIE") == -1) 
                                    ? "audio/bomb.wav" : "audio/bomb.mp3";

            SeaBattle.state = SeaBattle.STATE_INIT;
         },

   // ==========================================================================
   // Update game play for next animation frame.
   // 
   // Parameters:
   // 
   // none
   //
   // Return value:
   //
   // none
   // ==========================================================================

   update: function()
           {
              if (SeaBattle.state == SeaBattle.STATE_INIT)
                 return;

              if ((SeaBattle.state == SeaBattle.STATE_TITLE ||
                  SeaBattle.state == SeaBattle.STATE_WINLOSE ||
                  SeaBattle.state == SeaBattle.STATE_RESTART) && keydown.return)
              {
                 if (SeaBattle.state == SeaBattle.STATE_RESTART)
                 {
                    SeaBattle.score = 0;
                    SeaBattle.lives = 4;
                 }
                 SeaBattle.ship = 
                    new SeaBattle.makeShip(SeaBattle.width/2,
                                           SeaBattle.height/3,
                                           0, SeaBattle.width-1);
                 SeaBattle.sub = 
                    new SeaBattle.makeSub(SeaBattle.rnd(2) == 0 
                                          ? -50+SeaBattle.rnd(30)
                                          : SeaBattle.width+SeaBattle.rnd(100),
                                          2*SeaBattle.height/3-
                                          SeaBattle.rnd(SeaBattle.height/6),
                                          -100, SeaBattle.width+100);
                 SeaBattle.state = SeaBattle.STATE_PLAY;
              }
  
              if (SeaBattle.state != SeaBattle.STATE_PLAY)
                 return;

              if (SeaBattle.explosion != null)
              {
                 if (SeaBattle.explosion.isShip)
                    SeaBattle.sub.move();

                 for (var i = 0; i < SeaBattle.MAX_DC; i++)
                     if (SeaBattle.dc[i] != null)
                        if (!SeaBattle.dc[i].move())
                           SeaBattle.dc[i] = null;

                 for (var i = 0; i < SeaBattle.MAX_TORP; i++)
                     if (SeaBattle.torp[i] != null)
                        if (!SeaBattle.torp[i].move())
                           SeaBattle.torp[i] = null;

                 if (!SeaBattle.explosion.advance())
                 {
                    SeaBattle.ship = null;
                    SeaBattle.sub = null;
                    for (var i = 0; i < SeaBattle.MAX_DC; i++)
                        SeaBattle.dc[i] = null;
                    for (var i = 0; i < SeaBattle.MAX_TORP; i++)
                        SeaBattle.torp[i] = null;
                    SeaBattle.state = SeaBattle.STATE_WINLOSE;
                    if (SeaBattle.explosion.isShip)
                    {
                       SeaBattle.lives--;
                       if (SeaBattle.lives == 0)
                       {
                          SeaBattle.state = SeaBattle.STATE_RESTART;
                          SeaBattle.msg = "Game Over! Press RETURN to play "+
                                          "again!";
                       }
                    }
                    else
                    {
                       SeaBattle.score += 100;
                       if (SeaBattle.score > SeaBattle.hiScore)
                       {
                          SeaBattle.hiScore = SeaBattle.score;
                          if (SeaBattle.supports_html5_storage())
                             localStorage.setItem("hiScore", SeaBattle.hiScore);
                       }
                    }
                    SeaBattle.explosion = null;
                 }

                 return;
              }
            
              if (keydown.left)
                 SeaBattle.ship.moveLeft();

              if (keydown.right)
                 SeaBattle.ship.moveRight();

              if (keydown.space)
              {
                 for (var i = 0; i < SeaBattle.MAX_DC; i++)
                    if (SeaBattle.dc[i] == null)
                    {
                       var bound = SeaBattle.hillTops[SeaBattle.ship.x];
                       SeaBattle.dc[i] = new SeaBattle.makeDepthCharge(bound);
                       SeaBattle.dc[i].setLocation(SeaBattle.ship.x, 
                                                   SeaBattle.ship.y);
                       break;
                    }
                 keydown.space = false;
              }

              SeaBattle.sub.move();
              if (SeaBattle.sub.x > 0 && SeaBattle.sub.x < SeaBattle.width && 
                  SeaBattle.rnd(15) == 1)
                 for (var i = 0; i < SeaBattle.MAX_TORP; i++)
                    if (SeaBattle.torp[i] == null)
                    {
                       SeaBattle.torp[i] = 
                         new SeaBattle.makeTorpedo(SeaBattle.height/3);
                       SeaBattle.torp[i].setLocation(SeaBattle.sub.x, 
                                                     SeaBattle.sub.y-
                                                     SeaBattle.imgTorpedo.height);
                       break;
                    }

              for (var i = 0; i < SeaBattle.MAX_DC; i++)
                 if (SeaBattle.dc[i] != null)
                    if (!SeaBattle.dc[i].move())
                       SeaBattle.dc[i] = null;
                    else
                    {
                       if (SeaBattle.intersects(SeaBattle.dc[i].getBBox(), 
                                                SeaBattle.sub.getBBox()))
                       {
                          SeaBattle.explosion = 
                            new SeaBattle.makeExplosion(false);
                          SeaBattle.explosion.setLocation(SeaBattle.dc[i].x, 
                                                          SeaBattle.dc[i].y);
                          SeaBattle.msg = "You win! Press RETURN to keep "+
                                          "playing!";
                          SeaBattle.dc[i] = null;
                          return;
                       }
                    }

              for (var i = 0; i < SeaBattle.MAX_TORP; i++)
                 if (SeaBattle.torp[i] != null)
                    if (!SeaBattle.torp[i].move())
                       SeaBattle.torp[i] = null;
                    else
                    {
                       if (SeaBattle.intersects(SeaBattle.torp[i].getBBox(),
                                                SeaBattle.ship.getBBox()))
                       {
                          SeaBattle.explosion = 
                            new SeaBattle.makeExplosion(true);
                          SeaBattle.explosion.setLocation(SeaBattle.torp[i].x, 
                                                          SeaBattle.torp[i].y);
                          SeaBattle.msg = "You lose! Press RETURN to keep "+
                                          "playing!";
                          SeaBattle.torp[i] = null;
                          return;
                       }
                    }
           },

   // ==========================================================================
   // Draw next animation frame.
   // 
   // Parameters:
   // 
   // none
   //
   // Return value:
   //
   // none
   // ==========================================================================

   draw: function()
         {
            if (SeaBattle.state == SeaBattle.STATE_INIT)
               if (!SeaBattle.allResourcesLoaded())
               {
                  SeaBattle.ctx.fillStyle = "#000"; // black
                  SeaBattle.ctx.fillRect(0, 0, SeaBattle.width, SeaBattle.height);
                  SeaBattle.ctx.fillStyle = "#fff"; // white
                  SeaBattle.ctx.fillText("Initializing...",
                                         SeaBattle.width/2, SeaBattle.height/2);
                  return;
               }
               else
                  SeaBattle.state = SeaBattle.STATE_TITLE;

            if (SeaBattle.state == SeaBattle.STATE_TITLE)
            {
               SeaBattle.ctx.drawImage(SeaBattle.imgTitle, 0, 0);
               return;
            }
             
            // Draw the sky.

            SeaBattle.ctx.drawImage(SeaBattle.imgSky, 0, 0);

            // Clear water area.

            SeaBattle.ctx.fillStyle = "#404040" // dark gray
            SeaBattle.ctx.fillRect(0, SeaBattle.height/3, 
                                   SeaBattle.width, 
                                   2*SeaBattle.height/3);

            // Draw the moon.

            SeaBattle.ctx.drawImage(SeaBattle.imgMoon, 
                                    SeaBattle.width-65, 25);

            // Draw the undersea terrain.

            SeaBattle.ctx.strokeStyle = "rgb(255, 102, 0)"; // orange
            for (var i = 0; i < SeaBattle.width; i++)
            {
               SeaBattle.ctx.beginPath();
               SeaBattle.ctx.moveTo(i, SeaBattle.hillTops[i]);
               SeaBattle.ctx.lineTo(i, SeaBattle.height);
               SeaBattle.ctx.stroke();
            }

            // Draw the active participants in the scene.

            for (var i = 0; i < SeaBattle.MAX_DC; i++)
               if (SeaBattle.dc[i] != null)
                  SeaBattle.dc[i].draw();

            for (var i = 0; i < SeaBattle.MAX_TORP; i++)
               if (SeaBattle.torp[i] != null)
                  SeaBattle.torp[i].draw();

            if ((SeaBattle.ship != null && SeaBattle.explosion == null) || 
                (SeaBattle.explosion != null && !SeaBattle.ship.exploded))
               SeaBattle.ship.draw();

            if ((SeaBattle.sub != null && SeaBattle.explosion == null) || 
                (SeaBattle.explosion != null && !SeaBattle.sub.exploded))
               SeaBattle.sub.draw();

            if (SeaBattle.explosion != null)
               SeaBattle.explosion.draw();

            // Draw the water translucent to give water a bluish
            // color and undersea terrain a brownish color.

            SeaBattle.ctx.fillStyle = "rgba(0, 0, 255, 0.1)";
            SeaBattle.ctx.fillRect(0, SeaBattle.height/3, 
                                   SeaBattle.width, SeaBattle.height);

            // Draw score.

            SeaBattle.ctx.fillStyle = "#fff"; // white
            var align = SeaBattle.ctx.textAlign;
            SeaBattle.ctx.textAlign = "left";
            SeaBattle.ctx.fillText("Score: "+SeaBattle.score+
                                   "("+SeaBattle.hiScore+")", 10, 45);
            SeaBattle.ctx.textAlign = align;

            // Draw lives left.

            for (var i = 0; i < SeaBattle.lives-1; i++)
            {
               var x = SeaBattle.width-(i+1)*(SeaBattle.imgShipLeft.width+10);
               var y = SeaBattle.height-SeaBattle.imgShipLeft.height;
               SeaBattle.ctx.drawImage(SeaBattle.imgShipLeft, x, y);
            }

            if (SeaBattle.state == SeaBattle.STATE_WINLOSE ||
                SeaBattle.state == SeaBattle.STATE_RESTART)
            {
               SeaBattle.ctx.fillStyle = "#fff"; // white
               SeaBattle.ctx.fillText(SeaBattle.msg, SeaBattle.width/2, 
                                      SeaBattle.height/2);
            }
         },

   // ==========================================================================
   // NOTE: Consider the rest of the properties in this namespace to be private.
   // ==========================================================================

   MAX_DC: 2,
   MAX_TORP: 15,
   STATE_INIT: 0,
   STATE_TITLE: 1,
   STATE_PLAY: 2,
   STATE_WINLOSE: 3,
   STATE_RESTART: 4,

   allResourcesLoaded: function()
                       {
                          var status = SeaBattle.imgTitle.complete &&
                                       SeaBattle.imgSky.complete &&
                                       SeaBattle.imgMoon.complete &&
                                       SeaBattle.imgShipLeft.complete &&
                                       SeaBattle.imgShipRight.complete &&
                                       SeaBattle.imgSubLeft.complete &&
                                       SeaBattle.imgSubRight.complete;
                          for (var i = 0; i < SeaBattle.imgExplosion.length; i++)
                             status = status && 
                                      SeaBattle.imgExplosion[i].complete;
                          status = status && SeaBattle.audBombLoaded;
                          return status;
                       },

   intersects: function(r1, r2)
               {
                  return !(r2.left > r1.right || 
                         r2.right < r1.left || 
                         r2.top > r1.bottom ||
                         r2.bottom < r1.top);
               },

   makeDepthCharge: function(bound)
                    {
                       this.bound = bound;

                       this.bbox = { left: 0, top: 0, right: 0, bottom: 0 };
                       this.height = SeaBattle.imgDC.width;
                       this.width = SeaBattle.imgDC.height;

                       this.draw = function()
                                   {
                                      SeaBattle.ctx.drawImage(SeaBattle.imgDC,
                                                              this.x-this.width/2,
                                                              this.y-this.height/2);
                                   }

                       this.getBBox = function()
                                      {
                                         this.bbox.left = this.x-this.width/2;
                                         this.bbox.top = this.y-this.height/2;
                                         this.bbox.right = this.x+this.width/2;
                                         this.bbox.bottom = this.y+this.height/2;
                                         return this.bbox;
                                      }

                       this.move = function move()
                                   {
                                      this.y++;
                                      if (this.y+this.height/2 > this.bound)
                                         return false;
                                      return true;
                                   }

                       this.setLocation = function(x, y)
                                          {
                                             this.x = x;
                                             this.y = y;
                                          }
                    },

   makeExplosion: function(isShip)
                  {
                     this.isShip = isShip;

                     this.counter = 0;
                     this.height = SeaBattle.imgExplosion[0].height;
                     this.imageIndex = 0;
                     this.width = SeaBattle.imgExplosion[0].width;

                     this.advance = function()
                                    {
                                       if (++this.counter < 4)
                                          return true;
                                       this.counter = 0;

                                       if (++this.imageIndex == 8)
                                       {
                                          if (this.isShip)
                                             SeaBattle.ship.exploded = true;
                                          else
                                             SeaBattle.sub.exploded = true;
                                       }
                                       else
                                       if (this.imageIndex > 16)
                                       {
                                          this.imageIndex = 0;
                                          return false;
                                       }

                                       return true;
                                    }

                     this.draw = function()
                                 {
                                    SeaBattle.ctx.drawImage(SeaBattle.
                                                            imgExplosion
                                                            [this.imageIndex],
                                                            this.x-this.width/2, 
                                                            this.y-this.height/2);
                                 }

                     this.setLocation = function(x, y)
                                        {
                                           this.x = x;
                                           this.y = y;
                                           try
                                           {
                                              SeaBattle.audBomb.play();
                                           }
                                           catch (e)
                                           {
                                              // Safari without QuickTime 
                                              // results in an exception, which
                                              // is caught so that it can be 
                                              // ignored.
                                           }
                                        }
                  },

   makeShip: function(x, y, bound1, bound2)
             {
                this.x = x;
                this.y = y;
                this.bound1 = bound1;
                this.bound2 = bound2;

                this.bbox = { left: 0, top: 0, right: 0, bottom: 0 };
                this.LEFT = 0;
                this.RIGHT = 1;
                this.dir = this.LEFT,
                this.exploded = false;
                this.height = SeaBattle.imgShipLeft.height;
                this.vx = 2;
                this.width = SeaBattle.imgShipLeft.width;

                this.draw = function()
                            {
                               SeaBattle.ctx.drawImage((this.dir == this.LEFT)?
                                                       SeaBattle.imgShipLeft : 
                                                       SeaBattle.imgShipRight, 
                                                       this.x-this.width/2,
                                                       this.y-this.height/2);
                               return;
                            }
   
                this.getBBox = function()
                               {
                                  this.bbox.left = this.x-this.width/2;
                                  this.bbox.top = this.y-this.height/2;
                                  this.bbox.right = this.x+this.width/2;
                                  this.bbox.bottom = this.y+2;
                                  return this.bbox;
                               }

                this.moveLeft = function()
                                {
                                   this.dir = this.LEFT;
                                   this.x -= this.vx;
                                   if (this.x-this.width/2 < this.bound1)
                                   {    
                                      this.x += this.vx;
                                      this.vx = SeaBattle.rnd(4)+1;
                                   }
                                }

                this.moveRight = function()
                                 {
                                    this.dir = this.RIGHT;
                                    this.x += this.vx;
                                    if (this.x+this.width/2 > this.bound2)
                                    {
                                       this.x -= this.vx;
                                       this.vx = SeaBattle.rnd(4)+1;
                                    }
                                 }
             },

   makeSub: function(x, y, bound1, bound2)
            {
               this.x = x;
               this.y = y;
               this.bound1 = bound1;
               this.bound2 = bound2;

               this.bbox = { left: 0, top: 0, right: 0, bottom: 0 };
               this.LEFT = 0;
               this.RIGHT = 1;
               this.dir = (x >= SeaBattle.width) ? this.LEFT : this.RIGHT;
               this.exploded = false;
               this.height = SeaBattle.imgSubLeft.height;
               this.vx = SeaBattle.rnd(5)+2;
               this.width = SeaBattle.imgSubLeft.width;

               this.draw = function()
                           {
                              SeaBattle.ctx.drawImage((this.dir == this.LEFT)?
                                                      SeaBattle.imgSubLeft : 
                                                      SeaBattle.imgSubRight, 
                                                      this.x-this.width/2,
                                                      this.y-this.height/2);
                           }

               this.getBBox = function()
                              {
                                 this.bbox.left = this.x-this.width/2;
                                 this.bbox.top = this.y-this.height/2;
                                 this.bbox.right = this.x+this.width/2;
                                 this.bbox.bottom = this.y+this.height/2;
                                 return this.bbox;
                              }

               this.move = function()
                           {
                              if (this.dir == this.LEFT)
                              {
                                 this.x -= this.vx;
                                 if (this.x-this.width/2 < this.bound1)
                                 {
                                    this.x += this.vx;
                                    this.vx = SeaBattle.rnd(3)+1;
                                    this.dir = this.RIGHT;
                                 }
                              }
                              else
                              {
                                 this.x += this.vx;
                                 if (this.x+this.width/2 > this.bound2)
                                 {
                                    this.x -= this.vx;
                                    this.vx = SeaBattle.rnd(3)+1;
                                    this.dir = this.LEFT;
                                 }
                              }
                           }
            },

   makeTorpedo: function(bound)
                {
                   this.bound = bound;

                   this.bbox = { left: 0, top: 0, right: 0, bottom: 0 };
                   this.height = SeaBattle.imgTorpedo.height;
                   this.width = SeaBattle.imgTorpedo.width;

                   this.draw = function()
                               {
                                  SeaBattle.ctx.drawImage(SeaBattle.imgTorpedo,
                                                          this.x-this.width/2,
                                                          this.y);
                               }

                   this.getBBox = function()
                                  {
                                     this.bbox.left = this.x-this.width/2;
                                     this.bbox.top = this.y;
                                     this.bbox.right = this.x+this.width/2;
                                     this.bbox.bottom = this.y+this.height;
                                     return this.bbox;
                                  }

                   this.move = function move()
                               {
                                  this.y--;
                                  if (this.y < this.bound)
                                     return false;
                                  return true;
                               }

                   this.setLocation = function(x, y)
                                      {
                                         this.x = x;
                                         this.y = y;
                                      }
                },

   rnd: function(limit)
        {
           return (Math.random()*limit)|0; // |0 converts to integer
        },

   supports_html5_storage: function() 
                           {
                              try 
                              {
                                 return 'localStorage' in window && 
                                        window['localStorage'] !== null &&
                                        window['localStorage'] !== undefined;
                              } 
                              catch (e) 
                              {
                                 return false;
                              }
                           }
}