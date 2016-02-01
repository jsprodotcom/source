class HHFCS
   @init: (ms) ->
      canvas = document.createElement "canvas"
      canvas.setAttribute "width", 800
      canvas.setAttribute "height", 528
      document.getElementsByTagName("body")[0].appendChild canvas
      HHFCS.ctx = canvas.getContext "2d"

      HHFCS.ctx.font = "30px Arial"
      HHFCS.ctx.textAlign = "center"

      HHFCS.width = canvas.width
      HHFCS.height = canvas.height

      HHFCS.imgMessage = new Image
      HHFCS.imgMessage.src = "images/message.png"

      HHFCS.imgScene = new Image
      HHFCS.imgScene.src = "images/scene.png"

      HHFCS.imgWreath = new Array
      for i in [0..2]
         image = new Image
         image.src = "images/wreath"+i+".png"
         HHFCS.imgWreath.push image

      HHFCS.curWreath = 0
      HHFCS.wreathSlowDownCounter = 0

      HHFCS.flakes = []
      for i in [0..NFLAKES-1]
         radius = rnd Snowflake.MAX_RADIUS # range [0, MAX_RADIUS)
         if (radius < Snowflake.MIN_RADIUS)
            radius = Snowflake.MIN_RADIUS
         HHFCS.flakes[i] =  new Snowflake HHFCS.ctx, radius, "#fff", 
                                          rnd(HHFCS.width),
                                          -2*radius-rnd(1000), ms

      HHFCS.audJBLoaded = false
      HHFCS.audJB = document.createElement "audio"
      HHFCS.audJB.onloadeddata = new (e) ->
         HHFCS.audJBLoaded = true

      if navigator.userAgent.indexOf("Firefox") != -1 ||
          navigator.userAgent.indexOf("Opera") != -1
         HHFCS.audJB.src = "audio/jb.ogg"
      else
         HHFCS.audJB.src = "audio/jb.mp3"
      HHFCS.audJBPlaying = false

      HHFCS.startTime = new Date().getTime();

   @draw: ->
      if not allResourcesLoaded()
         HHFCS.ctx.fillStyle = "#000" # black
         HHFCS.ctx.fillRect 0, 0, HHFCS.width, HHFCS.height
         HHFCS.ctx.fillStyle = "#fff" # white
         HHFCS.ctx.fillText "Initializing...", HHFCS.width/2, 
                            HHFCS.height/2
         return

      HHFCS.ctx.drawImage HHFCS.imgScene, 0, 0

      for i in [0..NFLAKES-1]
         HHFCS.flakes[i].draw HHFCS.ctx

      HHFCS.ctx.drawImage HHFCS.imgWreath[HHFCS.curWreath], 10, 395
      HHFCS.ctx.drawImage HHFCS.imgWreath[HHFCS.curWreath], 
                          HHFCS.width-HHFCS.imgWreath[0].width-10, 395

      if ++HHFCS.wreathSlowDownCounter == 5
         HHFCS.curWreath = (HHFCS.curWreath+1)%HHFCS.imgWreath.length
         HHFCS.wreathSlowDownCounter = 0

      HHFCS.ctx.globalAlpha = (new Date().getTime()-HHFCS.startTime)/DURATION
      HHFCS.ctx.drawImage HHFCS.imgMessage, (HHFCS.width-HHFCS.imgMessage.width)/2, 
                          (HHFCS.height-HHFCS.imgMessage.height)/2
      HHFCS.ctx.globalAlpha = 1.0

      if not HHFCS.audJBPlaying
         HHFCS.audJB.play()
         HHFCS.audJBPlaying = true

   # ===============================================================
   # NOTE: The rest of the properties in this namespace are private.
   # ===============================================================

   NFLAKES = 200 # maximum number of snowflakes

   DURATION = 30000 # milliseconds

   allResourcesLoaded = ->
      status = HHFCS.imgMessage.complete && HHFCS.imgScene.complete
      for i in [0..HHFCS.imgWreath.length-1]
         status = status && HHFCS.imgWreath[i].complete
      status = status && HHFCS.audJBLoaded

   rnd = (limit) ->
      (Math.random()*limit)|0 # |0 converts to integer
