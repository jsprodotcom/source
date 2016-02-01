if(  //API check
  document.querySelectorAll && 
  document.createElement("b").getBoundingClientRect
) (function(doc) {
"use strict";

init();

function init() {
  if(window.addEventListener) {
    addEventListener("scroll", onScroll, false);
  } else {
    attachEvent("onscroll", onScroll);
  }

  //inject all our inherited CSS styles here
  var css = doc.createElement("div");
  css.innerHTML = ".<style>" + 
    "[x-sticky] {margin:0}" +
    "[x-sticky-placeholder] {padding:0; margin:0; border:0}" +
    "[x-sticky-placeholder] > [x-sticky] {position:relative; margin:0!important}" +
    "[x-sticky-placeholder] > [x-sticky-active] {position:fixed}<\/style>";

  var s = doc.querySelector("script");
  s.parentNode.insertBefore(css.childNodes[1], s);
}

function onScroll() {
  var list = doc.querySelectorAll("[x-sticky]");

  for(var i=0, item; (item = list[i]); i++) {

    var bound = getBoundary(item);

    //edge is where the current sticky should not persist beyond
    var edge = bound.getBoundingClientRect().bottom;

    //if we have a next item, then use it's top position as our edge
    var nextItem = findNextInBoundary(list, i, bound);
    if(nextItem) {
      //a placeholder will exist iff the item has been re-positioned
      //so we really want the position of that placeholder instead
      if(nextItem.parentNode.hasAttribute("x-sticky-placeholder")) {
        nextItem = nextItem.parentNode;
      }
      edge = nextItem.getBoundingClientRect().top;
    }

    //Each sticky, when scrolled beyond it's natural position, is moved
    //into a placeholder and the placeholder takes the place of the 
    //sticky in the DOM so we know where to move it back when we're done.
    var hasHolder = item.parentNode.hasAttribute("x-sticky-placeholder");

    var rect = item.getBoundingClientRect();
    var height = rect.bottom - rect.top;
    var width = rect.right - rect.left;

    //top is the natural position of the sticky
    var top = hasHolder ? item.parentNode.getBoundingClientRect().top : rect.top;

    if(top < 0) {
      if(edge > height) {
        //if sticky is in the middle, make its position "fixed"
        if(!item.hasAttribute("x-sticky-active")) {
          item.setAttribute("x-sticky-active", "");
        }
        item.style.top = "0px";

      } else {
        //if sticky is at the edge, make its position "relative"
        if(item.hasAttribute("x-sticky-active")) {
          item.removeAttribute("x-sticky-active");
        }
        item.style.top = -((top - edge) + height) + "px";
      }

      if(!hasHolder) {
        //create a placeholder for the sticky's initial position 
        //before we re-position the sticky elsewhere. The sticky 
        //becomes a child of the placeholder, but it's position is 
        //changed to "fixed" or "relative".
        var d = doc.createElement("div");
        d.setAttribute("x-sticky-placeholder", "");
        d.style.height = height + "px";
        d.style.width = width + "px";
        copyLayoutStyles(d, item);
        item.parentNode.insertBefore(d, item);
        d.appendChild(item);
      }

    } else {
      if(item.hasAttribute("x-sticky-active")) {
        item.removeAttribute("x-sticky-active");
      }
      item.style.top = "auto";

      if(hasHolder) {
        item = item.parentNode;
        item.parentNode.insertBefore(item.firstChild, item);
        item.parentNode.removeChild(item);
      }
    }
  }
}

function findNextInBoundary(arr, i, boundary) {
  i++;
  for(var item; item = arr[i]; i++) {
    if(getBoundary(item) == boundary) return item;
  }
}

function getBoundary(n) {
  while(n = n.parentNode) {
    if(n.hasAttribute("x-sticky-boundary")) return n;
  }
  return doc.body || doc.documentElement;
}

function copyLayoutStyles(to, from) {
  var props = {marginTop:1, marginRight:1, marginBottom:1, marginLeft:1};

  if(from.currentStyle) {
    props.styleFloat = 1;
    for(var s in props) to.style[s] = from.currentStyle[s];
  } else {
    props.cssFloat = 1;
    for(var s in props) to.style[s] = getComputedStyle(from, null)[s];
  }
}

})(document);