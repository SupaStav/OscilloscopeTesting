/* INCLUDED HERE:
    - Every function related handling a mouse event.
*/

document.addEventListener("mousedown", function(e) {
  //gain.gain.cancelScheduledValues(0);
  e.preventDefault();
  if (!firstTouchEver) {
    setUp();
    firstTouchEver = true;
  }
}, false);

function updateMousePos (){
  if (timeSinceLastCall+80-timeSinceLastMove>60 && mouseDown && mouseMove){
    console.log('Enter');
    mousePos[0] = updatePositionValue(0);
    renderCanvas();
  }
  timeSinceLastCall = Date.now();
}

// Get the position of the mouse relative to the canvas
function updatePositionValue(index) {
    let prevX = previouseMousePos[index].x;
    let prevY = previouseMousePos[index].y;

    let currentX = realMousePos[index].x;
    let currentY = realMousePos[index].y;

    if (Math.sqrt(Math.pow(currentX-prevX,2)+Math.pow(currentY-prevY,2))<1.9){
      mouseMove=false;
    }

    let toReturnX = 0.87*(prevX-currentX)+currentX;
    let toReturnY = 0.87*(prevY-currentY)+currentY;

    previouseMousePos[index].x = toReturnX;
    previouseMousePos[index].y = toReturnY;

    let rect = drawCanvas.getBoundingClientRect();
    if (toReturnX < 0){
      toReturnX = 0;
    } else if (toReturnX > rect.width){
      toReturnX = rect.width;
    }
    if (toReturnY < 0){
      toReturnY = 0;
    } else if (toReturnY > rect.height){
      toReturnY = rect.height;
    }

    return {
      x: toReturnX, // scale mouse coordinates after they have
      y: toReturnY // been adjusted to be relative to element
    }
}

function setMouseListeners (){

  // Whem the mouse is clicked, we will create a wave dependent on the mouse position
  drawCanvas.addEventListener("mousedown", function(e) {
    //gain.gain.cancelScheduledValues(0);
    e.preventDefault();
    mouseDown = true;
    mouseMove = false;
    firstDown = true;
    if (!isStarted){
      isStarted = true;
      start();
    }
    if (nFingers === 0){
      mousePos[0] = getMousePos(drawCanvas, e, 0);
      // mousePos[finger] = getMousePos(drawCanvas, e);
      renderCanvas();

      firstDown = false;
      timeSinceLastMove = Date.now();
      timeSinceLastCall = Date.now();
      setIntervalId = window.setInterval(updateMousePos, 80);
    } else {
      mousePos[finger] = getMousePos(drawCanvas, e, finger);
      // mousePos[finger] = getMousePos(drawCanvas, e);
    }
  }, false);

  // When the mouse moves, we keep track of its position.
  document.addEventListener("mousemove", function(e) {
    e.preventDefault();
    if (mouseDown){
      mouseMove = true;
      timeSinceLastMove = Date.now();
      if (nFingers === 0){
        mousePos[0] = getMousePos(drawCanvas, e, 0);
        // mousePos[finger] = getMousePos(drawCanvas, e);
        renderCanvas();
      } else {
        mousePos[finger] = getMousePos(drawCanvas, e, finger);
        // mousePos[finger] = getMousePos(drawCanvas, e);
      }
    }
  }, false);

}


// Alternative to jQuery ready function. Supported everywhere but IE 8 (too old, it should not be a problem)
document.addEventListener('DOMContentLoaded', function() {
  // Alternative to jQuery mouseup function
  document.onmouseup = function(){
      if ((pureOn || mode==="pure") && firstTouchEver){
        clearInterval(setIntervalId);
        setToZero();
        releaseSynths();
      }
  }
});
