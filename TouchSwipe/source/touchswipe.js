/*global $, jQuery*/
(function ($) {
  'use strict';

  var Swiper = function (el, callbacks) {
    var tis = this;
    this.el = el;
    this.cbs = callbacks;
    this.points = [0, 0];

    //perform binding
    this.el.addEventListener('touchstart', function (evt) {
      tis.start(evt);
    });
    this.el.addEventListener('touchmove', function (evt) {
      evt.preventDefault();
      tis.move(evt);
    });
  };

  Swiper.prototype.start = function (evt) {
    if (evt.targetTouches && evt.targetTouches.length === 1) {
      if (evt.targetTouches[0].offsetX) {
        this.points[0] = evt.targetTouches[0].offsetX;
      } else if (evt.targetTouches[0].layerX) {
        this.points[0] = evt.targetTouches[0].layerX;
      } else {
        this.points[0] = evt.targetTouches[0].pageX;
      }
      //make initial contact with 0 difference
      this.points[1] = this.points[0];
    }
  };

  Swiper.prototype.diff = function () {
    return this.points[1] - this.points[0];
  };

  Swiper.prototype.move = function (evt) {
    if (evt.targetTouches && evt.targetTouches.length === 1) {
      if (evt.targetTouches[0].offsetX) {
        this.points[1] = evt.targetTouches[0].offsetX;
      } else if (evt.targetTouches[0].layerX) {
        this.points[1] = evt.targetTouches[0].layerX;
      } else {
        this.points[1] = evt.targetTouches[0].pageX;
      }
      this.cbs.swiping(this.diff());
      this.points[0] = this.points[1];
    }
  };

  $.fn.swiper = function (callbacks) {
    //extend the defaults
    if (typeof callbacks.swiping !== 'function') {
      throw '"swiping" callback must be defined.';
    }

    this.each(function () {
      var tis = $(this),
        swiper = tis.data('swiper');

      if (!swiper) { //i.e. plugin not invoked on the element yet
        tis.data('swiper', (swiper = new Swiper(this, callbacks)));
      }
    });
  };
}(jQuery));

