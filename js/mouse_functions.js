/* INCLUDED HERE:
    - Every function related handling a mouse event.
*/

// The first time we tap anywhere in the page, we will call setUp() and remove this listener.
document.addEventListener("mousedown", setUpCallback, false);

function setMouseListeners() {

  // Gets mouse position and calls to render canvas
  controlsCanvas.addEventListener("mousedown", function (e) {
    e.preventDefault();
    mouseDown = true;
    processMouseAction(e, "mousedown");
  }, false);

  // Gets mouse position and calls to render canvas
  document.addEventListener("mousemove", function (e) {
    e.preventDefault();
    mouseMove = true;
    if (mouseDown) {
      processMouseAction(e, "mousemove");
    }
  }, false);

  function processMouseAction(e, callFrom) {
    if (nFingers === 0) {
      mousePos[0] = getMousePos(controlsCanvas, e);
      
      mostRecent.pure.mousePos[0] = mousePos[0];          // Store in the most recent mouse position
      mostRecent.complex.mousePos[0] = mousePos[0];       // Complex mode. Save the values for pure/complex separately
      
      if (mode === "pure") {
        renderPureWavesCanvas(callFrom);
      } else if (mode === "complex") {
        if (isSustained) {
          mousePos[0] = mostRecent.pure.mousePos[0];
        }
        renderComplexWavesCanvas(callFrom);
      }
    }
  }

  // We reset everything to their initial values
  controlsCanvas.addEventListener('mouseup', function () {
    // Log in the most recent frequency and amplitude
    console.log('Latest val: ', mostRecent);
    setToZero();
    releaseSynths();

    if (isSustained) {
      if (mode == "pure") {
        // Call in drawPureCanvas method with the most recent frequency and amplitude
        mousePos[0] = mostRecent.pure.mousePos[0];
        renderPureWavesCanvas("mousedown");
      } else if(mode == "complex") {
        // Call in the renderComplexCanvas method with the most recent frequency and amplitude
        mousePos[0] = mostRecent.complex.mousePos[0];
        renderComplexWavesCanvas("mousedown");
      }

      // Log which mode it is currently
      console.log('Current Mode: ', mode);
    }
  });
}
