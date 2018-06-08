/* INCLUDED HERE:
    - Every function related handling a mouse event.
*/

var setUpFunction = function (e) {
  e.preventDefault();
  if (!firstTapInThePage) {
    setUp();
    document.removeEventListener("mousedown", setUpFunction, false);
    document.removeEventListener("touchstart", setUpFunction, false);
  }
}

document.addEventListener("mousedown", setUpFunction, false);

function setMouseListeners (){

  // when the mouse is clicked, we will create a wave dependent on the mouse position
  controlsCanvas.addEventListener("mousedown", function(e) {
    //gain.gain.cancelScheduledValues(0);
    e.preventDefault();
    mouseDown = true;
    mouseMove = false;
    if (!isToneJSSetUp){
      setUpToneJS();
    }
    if (nFingers === 0){
      mousePos[0] = getMousePos(controlsCanvas, e);
      renderCanvas();

    } else {
      mousePos[finger] = getMousePos(controlsCanvas, e);
    }
  }, false);

  // When the mouse moves, we keep track of its position.
  document.addEventListener("mousemove", function(e) {
    e.preventDefault();
    if (mouseDown){
      mouseMove = true;
      if (nFingers === 0){
        mousePos[0] = getMousePos(controlsCanvas, e);
        renderCanvas();
      } else {
        mousePos[finger] = getMousePos(controlsCanvas, e);
      }
    }
  }, false);

}


// Alternative to jQuery ready function. Supported everywhere but IE 8 (too old, it should not be a problem)
document.addEventListener('DOMContentLoaded', function() {
  // Alternative to jQuery mouseup function
  document.onmouseup = function(){
      if (firstTapInThePage){
        setToZero();
        releaseSynths();
      }
  }
});
