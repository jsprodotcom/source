// Generated by CoffeeScript 1.4.0
var Snowflake;

Snowflake = (function() {
  var BRANCH_ANGLE, BRANCH_FACTOR, LINETO, MOVETO, SHRINK_FACTOR, rotateX, rotateY, snowflakeBranch, toRadians;

  Snowflake.MAX_RADIUS = 30;

  Snowflake.MIN_RADIUS = 3;

  function Snowflake(ctx, radius, strokeStyle, x, y, msInterval) {
    var angle, branch, radiusDiff, _i;
    this.ctx = ctx;
    this.radius = radius;
    this.strokeStyle = strokeStyle;
    this.x = x;
    this.y = y;
    this.msInterval = msInterval;
    this.startX = this.x;
    this.startY = this.y;
    this.path = [];
    for (branch = _i = 0; _i <= 5; branch = ++_i) {
      angle = toRadians(branch * 60.0 + 30.0);
      snowflakeBranch(this, 0.0, 0.0, rotateX(this.radius, 0.0, angle), rotateY(this.radius, 0.0, angle), 0);
    }
    radiusDiff = Snowflake.MAX_RADIUS - this.radius;
    if (radiusDiff === 0) {
      radiusDiff = 1;
    }
    this.incr = this.ctx.canvas.height / radiusDiff / (this.msInterval / 5);
  }

  Snowflake.prototype.draw = function() {
    var element, _i, _len, _ref;
    this.ctx.strokeStyle = this.strokeStyle;
    this.ctx.beginPath();
    _ref = this.path;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      element = _ref[_i];
      if (element.cmd === LINETO) {
        this.ctx.lineTo(this.x + element.x, this.y + element.y);
      } else {
        this.ctx.moveTo(this.x + element.x, this.y + element.y);
      }
    }
    this.ctx.closePath();
    this.ctx.stroke();
    this.y += this.incr;
    if (this.y > this.ctx.canvas.height) {
      this.x = this.startX;
      return this.y = this.startY;
    }
  };

  BRANCH_ANGLE = 30.0 * Math.PI / 180.0;

  BRANCH_FACTOR = 0.33;

  SHRINK_FACTOR = 0.66;

  LINETO = 0;

  MOVETO = 1;

  rotateX = function(x, y, angle) {
    return x * Math.cos(angle) + y * Math.sin(angle);
  };

  rotateY = function(x, y, angle) {
    return -x * Math.sin(angle) + y * Math.cos(angle);
  };

  snowflakeBranch = function(self, startX, startY, endX, endY, depth) {
    var cX, cY, nendX, nendY, rX1, rX2, rY1, rY2;
    if (depth === 4) {
      return;
    }
    self.path.push({
      cmd: MOVETO,
      x: startX,
      y: startY
    });
    self.path.push({
      cmd: LINETO,
      x: endX,
      y: endY
    });
    cX = startX + (endX - startX) * BRANCH_FACTOR;
    cY = startY + (endY - startY) * BRANCH_FACTOR;
    nendX = cX + (endX - startX) * SHRINK_FACTOR;
    nendY = cY + (endY - startY) * SHRINK_FACTOR;
    rX1 = rotateX(nendX - cX, nendY - cY, BRANCH_ANGLE) + cX;
    rY1 = rotateY(nendX - cX, nendY - cY, BRANCH_ANGLE) + cY;
    rX2 = rotateX(nendX - cX, nendY - cY, -BRANCH_ANGLE) + cX;
    rY2 = rotateY(nendX - cX, nendY - cY, -BRANCH_ANGLE) + cY;
    snowflakeBranch(self, cX, cY, rX1, rY1, depth + 1);
    return snowflakeBranch(self, cX, cY, rX2, rY2, depth + 1);
  };

  toRadians = function(degrees) {
    return degrees * Math.PI / 180.0;
  };

  return Snowflake;

})();
