class Snowflake
   @MAX_RADIUS: 30
   @MIN_RADIUS: 3

   constructor: (@ctx, @radius, @strokeStyle, @x, @y, @msInterval) ->
      @startX = @x
      @startY = @y
      @path = []
      for branch in [0..5]
         angle = toRadians branch*60.0+30.0
         snowflakeBranch this, 0.0, 0.0, rotateX(@radius, 0.0, angle),
                         rotateY(@radius, 0.0, angle), 0
      radiusDiff = Snowflake.MAX_RADIUS-@radius
      if (radiusDiff == 0)
         radiusDiff = 1 # prevent division by zero
      @incr = @ctx.canvas.height/radiusDiff/(@msInterval/5)

   draw: ->
      @ctx.strokeStyle = @strokeStyle
      @ctx.beginPath()
      for element in @path
         if element.cmd == LINETO
            @ctx.lineTo @x+element.x, @y+element.y
         else
            @ctx.moveTo @x+element.x, @y+element.y
      @ctx.closePath()
      @ctx.stroke()
      @y += @incr
      if @y > @ctx.canvas.height
         @x = @startX
         @y = @startY

   # ===============================================================
   # NOTE: The rest of the properties in this namespace are private.
   # ===============================================================

   BRANCH_ANGLE = 30.0*Math.PI/180.0
   BRANCH_FACTOR = 0.33
   SHRINK_FACTOR = 0.66

   LINETO = 0
   MOVETO = 1

   rotateX = (x, y, angle) ->
      x*Math.cos(angle)+y*Math.sin(angle)

   rotateY = (x, y, angle) ->
      -x*Math.sin(angle)+y*Math.cos(angle)

   snowflakeBranch = (self, startX, startY, endX, endY, depth) ->
      return if depth == 4
      self.path.push { cmd: MOVETO, x: startX, y: startY }
      self.path.push { cmd: LINETO, x: endX, y: endY }
      cX = startX+(endX-startX)*BRANCH_FACTOR
      cY = startY+(endY-startY)*BRANCH_FACTOR
      nendX = cX+(endX-startX)*SHRINK_FACTOR
      nendY = cY+(endY-startY)*SHRINK_FACTOR
      rX1 = rotateX(nendX-cX, nendY-cY, BRANCH_ANGLE)+cX
      rY1 = rotateY(nendX-cX, nendY-cY, BRANCH_ANGLE)+cY
      rX2 = rotateX(nendX-cX, nendY-cY, -BRANCH_ANGLE)+cX
      rY2 = rotateY(nendX-cX, nendY-cY, -BRANCH_ANGLE)+cY
      snowflakeBranch self, cX, cY, rX1, rY1, depth+1
      snowflakeBranch self, cX, cY, rX2, rY2, depth+1

   toRadians = (degrees) ->
      degrees*Math.PI/180.0
