/* INCLUDED HERE:
    - All the functions that in some way draw something on screen
      * Grid drawing (createGrid method)
      * Wave plotting (draw method)
      * Render canvas methods
      * Render axes method
      * Point drawing method
*/

// Time variable
var t = 0;
var referenceComplexAmplitude;
var drawTimeStamp;
var prevNFingers = 0;
var randomInitialVolumes = [];

// This function creates the grid for the waves canvas
function createGrid(ctx, canvas) {
  let canvasRect = canvas.getBoundingClientRect();
  let canvasHeight = canvasRect.height;
  let canvasWidth = canvasRect.width;

  // We clear whatever is in scope and we create the grid again
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Mid point of the scope canvas (used to create the grid)
  let midPoint = {
    x: canvasWidth / 2,
    y: canvasHeight / 2
  };

  // Draw the two gray axes
  ctx.beginPath();
  setStyleWidthOpacity(ctx, "rgb(124, 124, 124)", '5', 1);
  ctx.moveTo(0, midPoint.y);
  ctx.lineTo(canvasWidth, midPoint.y);
  ctx.moveTo(midPoint.x, 0);
  ctx.lineTo(midPoint.x, canvasHeight);
  ctx.globalCompositeOperation = 'source-over';
  ctx.stroke();
  ctx.closePath();

  // Draw the white lines
  ctx.beginPath();
  setStyleWidthOpacity(ctx, "rgb(255, 255, 255)", '5', 1);
  // Dash Space determines the distance between white lines
  let dashSpace = 50;
  // Dash size determines the size of the white lines
  let dashSize = 15;
  let greatDashSize = 26;
  let linesDrawn = 1;
  // Draw the dashes of the left half of x axis
  let dashesX = midPoint.x - dashSpace;
  while (dashesX >= 0) {
    if (linesDrawn % 4 === 0) {
      ctx.moveTo(dashesX, midPoint.y - greatDashSize);
      ctx.lineTo(dashesX, midPoint.y + greatDashSize);
    } else {
      ctx.moveTo(dashesX, midPoint.y - dashSize);
      ctx.lineTo(dashesX, midPoint.y + dashSize);
    }
    dashesX -= dashSpace;
    linesDrawn++;
  }
  linesDrawn = 0;
  // Draw the dashes of the right half of x axis
  dashesX = midPoint.x;
  while (dashesX <= canvasWidth) {
    if (linesDrawn % 4 === 0) {
      ctx.moveTo(dashesX, midPoint.y - greatDashSize);
      ctx.lineTo(dashesX, midPoint.y + greatDashSize);
    } else {
      ctx.moveTo(dashesX, midPoint.y - dashSize);
      ctx.lineTo(dashesX, midPoint.y + dashSize);
    }
    dashesX += dashSpace;
    linesDrawn++;
  }

  linesDrawn = 1;
  // Draw the dashes of the top half of y axis
  let dashesY = midPoint.y - dashSpace;
  while (dashesY >= 0) {
    if (linesDrawn % 4 === 0) {
      ctx.moveTo(midPoint.x - greatDashSize, dashesY);
      ctx.lineTo(midPoint.x + greatDashSize, dashesY);
    } else {
      ctx.moveTo(midPoint.x - dashSize, dashesY);
      ctx.lineTo(midPoint.x + dashSize, dashesY);
    }
    dashesY -= dashSpace;
    linesDrawn++;
  }

  linesDrawn = 0;
  // Draw the dashes of the bottom half of y axis
  dashesY = midPoint.y;
  while (dashesY <= canvasHeight) {
    if (linesDrawn % 4 === 0) {
      ctx.moveTo(midPoint.x - greatDashSize, dashesY);
      ctx.lineTo(midPoint.x + greatDashSize, dashesY);
    } else {
      ctx.moveTo(midPoint.x - dashSize, dashesY);
      ctx.lineTo(midPoint.x + dashSize, dashesY);
    }
    dashesY += dashSpace;
    linesDrawn++;
  }

  ctx.stroke();
  ctx.closePath();

  // Draw the scale for the canvas
  drawScaleInfo(ctx, midPoint, canvasHeight, dashSpace);
}

// Draws the scale information for the waves canvas
function drawScaleInfo(ctx, midPoint, canvasHeight, dashSpace) {
  let lengthScale = dashSpace * 4;
  let offsetY = 15;
  let offsetX = 3;
  let lengthLittleLines = 10;

  // Draw yellow scale
  ctx.beginPath();
  setStyleWidthOpacity(ctx, "rgb(255, 233, 0)", '3', 1);
  ctx.moveTo(midPoint.x + offsetX, canvasHeight - offsetY);
  ctx.lineTo(midPoint.x + lengthScale - offsetX, canvasHeight - offsetY);

  ctx.moveTo(midPoint.x + offsetX, canvasHeight - offsetY - lengthLittleLines / 2);
  ctx.lineTo(midPoint.x + offsetX, canvasHeight - offsetY + lengthLittleLines / 2);

  ctx.moveTo(midPoint.x + lengthScale - offsetX, canvasHeight - offsetY - lengthLittleLines / 2);
  ctx.lineTo(midPoint.x + lengthScale - offsetX, canvasHeight - offsetY + lengthLittleLines / 2);

  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();

  ctx.globalAlpha = 1;
  ctx.font = '16px Verdana';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';

  ctx.fillText('25 ms', midPoint.x + lengthScale / 2 - offsetX / 2, canvasHeight - offsetY - lengthLittleLines / 2);

  ctx.stroke();
  ctx.closePath();
}

function setStyleWidthOpacity(ctx, style, width, opacity) {
  ctx.strokeStyle = style;
  ctx.lineWidth = width;
  ctx.globalAlpha = opacity;
}

function setLeyendVisibility(status) {
  document.getElementById("pure-tones-text").style.visibility = status;
  document.getElementById("leyend-text").style.visibility = status;
  document.getElementById("line-canvas").style.visibility = status;
}

/* FUNCTIONALITY FOR THE BOUNDING GRAPHS FEATURE
Functions to calculate the maximum point in a pure single wave, in a pure multi wave, and in a complex wave
There are three functions just to make it easier, but they share many characteristics so they probably could be merged in one.
These are used to later calculate the proportion to apply to the wave in order to bound it.

function calculateMaximumPureSingleWave(myNumberPoints, mySliceWidth){
  let wavesCanvasRect = wavesCanvas.getBoundingClientRect();
  let wavesCanvasHeight = wavesCanvasRect.height;
  let wavesCanvasWidth = wavesCanvasRect.width;
  let max=0;
  let x=0;
  // For each of the points that we have
  for (let i = 0; i < myNumberPoints; i++) {
    let y=0;
    // Calculate the location of the point using the equation of the wave.
    let wavelength = 100 * wavesCanvasHeight / frequency[0];
    let v = wavelength/frequency[0];
    let k = 2*Math.PI/wavelength;
    if (amplitude[0]<0){
      y += (0 * 350 * Math.cos(k*(x+v*t)));
    } else {
      y += (amplitude[0]* 350 * Math.cos(k*(x+v*t)));
    }

    if (max<y) max=y;

    // x moves the x-distance to the right
    x += mySliceWidth;
  }
  return max;
}

function calculateMaximumPureMultipleWaves(myNumberPoints, mySliceWidth){
  let wavesCanvasRect = wavesCanvas.getBoundingClientRect();
  let wavesCanvasHeight = wavesCanvasRect.height;
  let wavesCanvasWidth = wavesCanvasRect.width;
  let max=0;
  let x = 0;
  for (let i = 0; i < myNumberPoints; i++) {
    let y=0;
    // Add the result of each of the waves in position x
    for (let j=0; j<nFingers; j++){
      let wavelength = 100 * wavesCanvasHeight / frequency[j];
      let v = wavelength/frequency[j];
      let k = 2*Math.PI/wavelength;
      if (amplitude[j]<0){
        y += (0* 350 * Math.cos(k*(x+v*t)));
      } else {
        y += (amplitude[j]* 350 * Math.cos(k*(x+v*t)));
      }
    }

    if (max<y) max=y;

    // x moves the x-distance to the right
    x += mySliceWidth;
  }
  return max;
}

function calculateMaximumComplexWaves(myNumberPoints, mySliceWidth){
  let wavesCanvasRect = wavesCanvas.getBoundingClientRect();
  let wavesCanvasHeight = wavesCanvasRect.height;
  let wavesCanvasWidth = wavesCanvasRect.width;
  let max=0;
  let x = 0;
  for (let i = 0; i < myNumberPoints; i++) {
    let y=0;
    // Add the result of each of the waves in position x
    for (let j=0; j<WAVESCOMPLEXMODE; j++){
      let wavelength = 100 * wavesCanvasHeight / frequency[j];
      let v = wavelength/frequency[j];
      let k = 2*Math.PI/wavelength;
      if (amplitude[j]<0){
        y += (0* 350 * Math.cos(k*(x+v*t)));
      } else {
        y += (amplitude[j]* 350 * Math.cos(k*(x+v*t)));
      }
    }

    if (max<y) max=y;

    // x moves the x-distance to the right
    x += mySliceWidth;
  }
  return max;
}
*/

/* FUNCTIONALITY FOR THE BOUNDING GRAPHS FEATURE
Calculates the proportion that we should apply in relation to the height of the waves canvas height
function calculateProportionWave(max){
  let wavesCanvasRect = wavesCanvas.getBoundingClientRect();
  let wavesCanvasHeight = wavesCanvasRect.height;
  if (max<wavesCanvasHeight){
    return 1;
  } else {
    return wavesCanvasHeight/max;
  }
}
*/

// Waves canvas drawing (pure waves)
// TO DO: insert the canvas and the context as arguments so that if one changes, we do not have to be changing everything in the function.
function drawPureWavesCanvas() {
  let wavesCanvasRect = wavesCanvas.getBoundingClientRect();
  let wavesCanvasHeight = wavesCanvasRect.height;
  let wavesCanvasWidth = wavesCanvasRect.width;
  let numberPoints;
  let sliceWidth;
  let freqInfoMessage;
  let opacityLevel = 0.65;

  createGrid(wavesCanvasCtx, wavesCanvas);

  // Make the effect of the graph moving in time (currently deactivated)
  if (AFFECTTIME) {
    t++;
  }

  // In case we are in mouse mode (or nothing is being clicked/touched)
  if (nFingers === 0) {
    numberPoints = 2048 * 16;
    // We get the x-distance between each point by dividing the total width by the number of points
    sliceWidth = wavesCanvasWidth / numberPoints;

    /*
    let maxHeight = calculateMaximumPureSingleWave(numberPoints, sliceWidth);
    let scaleProportion = calculateProportionWave(maxHeight*2);
    */

    // We draw the blue wave line
    wavesCanvasCtx.beginPath();
    setStyleWidthOpacity(wavesCanvasCtx, WAVECOLORTOTAL, '5', 1);

    // x starts at 0 (first point is at 0)
    let x = 0;
    // For each of the points that we have
    for (let i = 0; i < numberPoints; i++) {
      let y = 0;
      // Calculate the location of the point using the equation of the wave.
      let wavelength = 100 * wavesCanvasHeight / frequency[0];
      let v = wavelength / frequency[0];
      let k = 2 * Math.PI / wavelength;
      if (amplitude[0] < 0) {
        y += (0 * 350 * Math.cos(k * (x + v * t)));
      } else {
        y += (amplitude[0] * 350 * Math.cos(k * (x + v * t)));
      }

      // y *= scaleProportion;

      y += wavesCanvasHeight / 2;

      // We draw the point in the canvas
      if (i === 0) {
        wavesCanvasCtx.moveTo(x, y);
      } else {
        wavesCanvasCtx.lineTo(x, y);

        // wavesCanvasCtx.fillStyle = WAVECOLORTOTAL;
        // wavesCanvasCtx.fillRect(x,y,1,1);
      }
      // x moves the x-distance to the right
      x += sliceWidth;
    }
    wavesCanvasCtx.stroke();
  } else {
    // In case we are in touch mode
    /* If there is more than 1 finger pressed, we will draw a thick yellow line
    which will be the result of adding all the other waves */
    numberPoints = 2048 * 16 / (nFingers + 1);
    sliceWidth = wavesCanvasWidth / numberPoints;

    /*
    let maxHeight = calculateMaximumPureMultipleWaves(numberPoints, sliceWidth);
    let scaleProportion = calculateProportionWave(maxHeight*2);
    */

    wavesCanvasCtx.beginPath();
    setStyleWidthOpacity(wavesCanvasCtx, WAVECOLORTOTAL, '5', 1);
    let x = 0;
    for (let i = 0; i < numberPoints; i++) {
      let y = 0;
      // Add the result of each of the waves in position x
      for (let j = 0; j < nFingers; j++) {
        let wavelength = 100 * wavesCanvasHeight / frequency[j];
        let v = wavelength / frequency[j];
        let k = 2 * Math.PI / wavelength;
        if (amplitude[j] < 0) {
          y += (0 * 350 * Math.cos(k * (x + v * t)));
        } else {
          y += (amplitude[j] * 350 * Math.cos(k * (x + v * t)));
        }
      }

      // y *= scaleProportion;

      y += wavesCanvasHeight / 2;
      if (i === 0) {
        wavesCanvasCtx.moveTo(x, y);
      } else {
        wavesCanvasCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    wavesCanvasCtx.stroke();

    // Now, we will draw each of the thinner lines for each finger.
    for (let j = 0; j < nFingers; j++) {
      let x = 0;
      wavesCanvasCtx.beginPath();
      // If we have only 1 finger, the line will still be thick
      if (nFingers === 1) {
        wavesCanvasCtx.globalAlpha = 1;
        wavesCanvasCtx.lineWidth = '1.3';
      } else {
        wavesCanvasCtx.globalAlpha = opacityLevel;
        wavesCanvasCtx.lineWidth = '2';
      }

      // In case of the finger number, we will choose one color and write its frequency
      if (j === 0) {
        wavesCanvasCtx.strokeStyle = WAVECOLOR1;
        freqInfoMessage = "<span style='color: " + WAVECOLOR1 + "'>" + Math.round(frequency[j]) + "</span>";
      } else if (j === 1) {
        wavesCanvasCtx.strokeStyle = WAVECOLOR2;
        freqInfoMessage += " <span style='color: " + WAVECOLOR2 + "'>" + Math.round(frequency[j]) + "</span>";
      } else if (j === 2) {
        wavesCanvasCtx.strokeStyle = WAVECOLOR3;
        freqInfoMessage += " <span style='color: " + WAVECOLOR3 + "'>" + Math.round(frequency[j]) + "</span>";
      } else if (j === 3) {
        wavesCanvasCtx.strokeStyle = WAVECOLOR4;
        freqInfoMessage += " <span style='color: " + WAVECOLOR4 + "'>" + Math.round(frequency[j]) + "</span>";
      } else {
        wavesCanvasCtx.strokeStyle = WAVECOLOR5;
        freqInfoMessage += " <span style='color: " + WAVECOLOR5 + "'>" + Math.round(frequency[j]) + "</span>";
      }
      for (let i = 0; i < numberPoints; i++) {
        let y = 0;
        let wavelength = 100 * wavesCanvasHeight / frequency[j];
        let v = wavelength / frequency[j];
        let k = 2 * Math.PI / wavelength;
        if (amplitude[j] < 0) {
          y += (0 * 350 * Math.cos(k * (x + v * t)));
        } else {
          y += (amplitude[j] * 350 * Math.cos(k * (x + v * t)));
        }

        // y *= scaleProportion;

        y += wavesCanvasHeight / 2;
        if (i === 0) {
          wavesCanvasCtx.moveTo(x, y);
        } else {
          wavesCanvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      wavesCanvasCtx.stroke();
    }
  }
  // Write the message in case of the number of fingers we have
  if (nFingers < 1) {
    if (frequency[0] === 1) {
      freqInfoMessage = "";
      setLeyendVisibility('hidden');
    } else {
      freqInfoMessage = Math.round(frequency[0]) + " Hz (cycles/second)";
      setLeyendVisibility('visible');
    }
  } else {
    freqInfoMessage += " <span style='color: rgb(255, 255, 255)'>Hz</span>";
    setLeyendVisibility('visible');
  }
  document.getElementById("freq-info").innerHTML = freqInfoMessage;
  drawTimeStamp = Date.now();
};

// Waves canvas drawing (complex waves)
function drawComplexWavesCanvas() {
  let wavesCanvasRect = wavesCanvas.getBoundingClientRect();
  let wavesCanvasHeight = wavesCanvasRect.height;
  let wavesCanvasWidth = wavesCanvasRect.width;
  let numberPoints = 2048 * 16 / WAVESCOMPLEXMODE;
  let sliceWidth = wavesCanvasWidth / numberPoints;
  let freqInfoMessage;
  let opacityLevel = 0.65;

  createGrid(wavesCanvasCtx, wavesCanvas);

  // Make the effect of the graph moving in time (currently deactivated)
  if (AFFECTTIME) {
    t++;
  }

  /*
    let maxHeight = calculateMaximumComplexWaves(numberPoints, sliceWidth);
    let scaleProportion = calculateProportionWave(maxHeight*2);
  */

  wavesCanvasCtx.beginPath();
  setStyleWidthOpacity(wavesCanvasCtx, WAVECOLORTOTAL, '5', 1);
  let x = 0;
  for (let i = 0; i < numberPoints; i++) {
    let y = 0;

    for (let j = 0; j < WAVESCOMPLEXMODE; j++) {
      let wavelength = 100 * wavesCanvasHeight / frequency[j];
      let v = wavelength / frequency[j];
      let k = 2 * Math.PI / wavelength;
      if (amplitude[j] < 0) {
        y += (0 * 350 * Math.cos(k * (x + v * t)));
      } else {
        y += (amplitude[j] * 350 * Math.cos(k * (x + v * t)));
      }
    }

    // y *= scaleProportion;

    y += wavesCanvasHeight / 2;
    if (i === 0) {
      wavesCanvasCtx.moveTo(x, y);
    } else {
      wavesCanvasCtx.lineTo(x, y);
    }
    x += sliceWidth;
  }
  wavesCanvasCtx.stroke();

  for (let j = 0; j < WAVESCOMPLEXMODE; j++) {
    let x = 0;
    wavesCanvasCtx.beginPath();
    wavesCanvasCtx.lineWidth = '1';
    wavesCanvasCtx.globalAlpha = opacityLevel;
    if (j === 0) {
      wavesCanvasCtx.strokeStyle = WAVECOLOR1;
      freqInfoMessage = "<span style='color: " + WAVECOLOR1 + "'>" + Math.round(frequency[j]) + "</span>";
    } else if (j === 1) {
      wavesCanvasCtx.strokeStyle = WAVECOLOR2;
      freqInfoMessage += " <span style='color: " + WAVECOLOR2 + "'>" + Math.round(frequency[j]) + "</span>";
    } else if (j === 2) {
      wavesCanvasCtx.strokeStyle = WAVECOLOR3;
      freqInfoMessage += " <span style='color: " + WAVECOLOR3 + "'>" + Math.round(frequency[j]) + "</span>";
    } else if (j === 3) {
      wavesCanvasCtx.strokeStyle = WAVECOLOR4;
      freqInfoMessage += " <span style='color: " + WAVECOLOR4 + "'>" + Math.round(frequency[j]) + "</span>";
    } else {
      wavesCanvasCtx.strokeStyle = WAVECOLOR5;
      freqInfoMessage += " <span style='color: " + WAVECOLOR5 + "'>" + Math.round(frequency[j]) + "</span>";
    }
    for (let i = 0; i < numberPoints; i++) {
      let y = 0;
      let wavelength = 100 * wavesCanvasHeight / frequency[j];
      let v = wavelength / frequency[j];
      let k = 2 * Math.PI / wavelength;
      if (amplitude[j] < 0) {
        y += (0 * 350 * Math.cos(k * (x + v * t)));
      } else {
        y += (amplitude[j] * 350 * Math.cos(k * (x + v * t)));
      }

      // y *= scaleProportion;

      y += wavesCanvasHeight / 2;
      if (i === 0) {
        wavesCanvasCtx.moveTo(x, y);
      } else {
        wavesCanvasCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    wavesCanvasCtx.stroke();
  }
  freqInfoMessage += " <span style='color: rgb(255, 255, 255)'>Hz</span>";
  setLeyendVisibility('visible');
  document.getElementById("freq-info").innerHTML = freqInfoMessage;
  drawTimeStamp = Date.now();
};

// Draw blue point where finger is, sets corresponding volume and frequency
function renderPureWavesCanvas(callFrom) {
  let controlsCanvasRect = controlsCanvas.getBoundingClientRect();
  let setF, setV;

  if (mouseDown) {
    // Set volume and frequency for tap 0
    if (callFrom == "mousedown") {
      setF = setFrequency(((mousePos[0].y / controlsCanvasRect.height) - 1) * -1, 0);
      setV = setVolume(mousePos[0].x / controlsCanvasRect.width, 0);

      for (let w = 1; w < nFingers; w++) {
        // We set the volume and the frequency
        let setVw = setVolume(mousePos[w].x / controlsCanvasRect.width, w);
        let setFw = setFrequency(((mousePos[w].y / controlsCanvasRect.height) - 1) * -1, w);
        setV = setV || setVw;
        setF = setF || setFw;
      }
    } else if (callFrom == "mousemove") {
      setF = rampFrequency(((mousePos[0].y / controlsCanvasRect.height) - 1) * -1, 0);
      setV = rampVolume(mousePos[0].x / controlsCanvasRect.width, 0);

      for (let w = 1; w < nFingers; w++) {
        // We set the volume and the frequency
        let setVw = rampVolume(mousePos[w].x / controlsCanvasRect.width, w);
        let setFw = rampFrequency(((mousePos[w].y / controlsCanvasRect.height) - 1) * -1, w);
        setV = setV || setVw;
        setF = setF || setFw;
      }
    }
    /*
      Check if we are eligible to draw in the canvas:
        - If the volume or the frequency has changed enough and it has passed at least 40 milliseconds from last draw.
        OR
        - The number of fingers has changed
    */
    if (((setV | setF) && Date.now() - drawTimeStamp > 40) || (prevNFingers !== nFingers)) {
      drawPureWavesCanvas();
      prevNFingers = nFingers;
    }

    // We redraw the axes and the point
    drawAxesLabelsControlsCanvas(controlsCanvas, controlsCanvasCtx);

    // Draw the points in the control canvas
    if (nFingers === 0) {
      drawPoint(controlsCanvasCtx, 0, 10);
    } else {
      for (let w = 0; w < nFingers; w++) {
        drawPoint(controlsCanvasCtx, w, 40);
      }
    }
  }
}

function renderComplexWavesCanvas() {
  let controlsCanvasRect = controlsCanvas.getBoundingClientRect();
  if (mouseDown) {
    // Set volume and frequency for tap 0
    let setF = setFrequency(((mousePos[0].y / controlsCanvasRect.height) - 1) * -1, 0);
    let setV = setVolume(mousePos[0].x / controlsCanvasRect.width, 0);

    // If it is the first complex render, initialize the random volumes and the reference amplitude (to calculate future proportions)
    if (firstComplexRender) {
      for (let w = 1; w < WAVESCOMPLEXMODE; w++) {
        randomInitialVolumes[w] = Math.random() * amplitude[0];
      }
      referenceComplexAmplitude = amplitude[0];
      firstComplexRender = false;
    }

    // Calculate the proportion to apply for the volumes
    if (amplitude[0] <= 0) {
      proportion = referenceComplexAmplitude / 0.00001;
    } else {
      proportion = referenceComplexAmplitude / amplitude[0];
    }

    // For each of the complex wave, calculate their frequency, volume, and mouse position.
    for (let w = 1; w < WAVESCOMPLEXMODE; w++) {
      calculateFrequencyMultiplier(frequency[0], (w + 1), w);
      calculateComplexVolume(proportion, w, randomInitialVolumes);
      calculateMousePos(controlsCanvas, w);
    }

    /*
      Check if we are eligible to draw in the canvas:
        - If the volume or the frequency has changed enough and it has passed at least 40 milliseconds from last draw.
        OR
        - The number of fingers has changed
    */
    if (((setV | setF) && Date.now() - drawTimeStamp > 40) || (prevNFingers !== nFingers)) {
      drawComplexWavesCanvas();
      prevNFingers = nFingers;
    }

    // We redraw the axes and the point
    drawAxesLabelsControlsCanvas(controlsCanvas, controlsCanvasCtx);

    // Draw the points in the control canvas
    if (nFingers === 0) {
      for (let w = 0; w < WAVESCOMPLEXMODE; w++) {
        drawPoint(controlsCanvasCtx, w, 10);
      }
    } else {
      drawPoint(controlsCanvasCtx, 0, 40);
      for (let w = 1; w < WAVESCOMPLEXMODE; w++) {
        drawPoint(controlsCanvasCtx, w, 27);
      }
    }
  }
}


// Function that draws of the axes labels in the controls canvas
function drawAxesLabelsControlsCanvas(canvas, ctx) {
  let rect = canvas.getBoundingClientRect();
  // We clear the canvas to make sure we don't leave anything painted
  ctx.clearRect(0, 0, rect.width, rect.height);

  let ticks = 4;
  let freqX = rect.width;
  let volY = rect.height;

  let dashSize = { x: 24, y: 7 };

  for (let i = 0; i <= ticks; i++) {
    let freq = ((i) / (ticks))
    let tickFreq = Math.round(logspace(MINFREQ, MAXFREQ, freq, 2));

    let vol = ((freq / ticks - 1) * -1);
    let tickVol = Math.round(logspace(0.001, 0.5, vol, 2) * 100) / 10 * 2;

    let percent = i / (ticks);

    let freqY = (1 - percent) * rect.height;
    let volX = (1 - percent) * rect.width;

    ctx.beginPath();
    ctx.font = '16px Verdana ';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'black';

    // Draw in the frequency y axis
    ctx.fillText(tickFreq + ' Hz', parseInt(freqX) - 29, parseInt(freqY + 13));
    ctx.fillRect(parseInt(freqX) - 19, parseInt(freqY), dashSize.x, dashSize.y);

    // Draw in the volume x axis
    ctx.fillText(tickVol, parseInt(volX) + 45, parseInt(volY) - 11);
    ctx.fillRect(parseInt(volX) + 8, parseInt(volY) - 22, dashSize.y, dashSize.x);
  }

  // 0 mark
  ctx.fillText(MINFREQ + ' Hz', parseInt(freqX) - 7, parseInt(volY) - 28);
  ctx.fillRect(parseInt(freqX) + - 19, parseInt(volY) - 11, dashSize.x, dashSize.y);
}

// Draws a point in relation to the the mouse position of the taps
function drawPoint(ctx, index, radius) {
  let myRadius = radius;
  let startingAngle = 0;
  let endingAngle = 2 * Math.PI;
  ctx.beginPath();
  ctx.arc(mousePos[index].x, mousePos[index].y, myRadius, startingAngle, endingAngle);
  if (index === 0) {
    if (nFingers === 0 && mode === "pure") ctx.fillStyle = WAVECOLORTOTAL;
    else ctx.fillStyle = WAVECOLOR1;
  } else if (index === 1) {
    ctx.fillStyle = WAVECOLOR2;
  } else if (index === 2) {
    ctx.fillStyle = WAVECOLOR3;
  } else if (index === 3) {
    ctx.fillStyle = WAVECOLOR4;
  } else {
    ctx.fillStyle = WAVECOLOR5;
  }
  ctx.fill();
  ctx.stroke();
}


// Resize function to resize the canvas correctly (not working)
// window.addEventListener("resize", setUp);
