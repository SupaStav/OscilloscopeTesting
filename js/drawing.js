/* INCLUDED HERE:
    - All the functions that in some way draw something on screen
      * Grid drawing (createGrid method)
      * Wave plotting (draw method)
      * Render canvas methods
      * Render axes method
      * Point drawing method
*/

// Time variable
var t=0;
var referenceComplexAmplitude;
var drawTimeStamp;
var prevNFingers = 0;


// This function creates the grid of the canvas inserted as argument (it will be used for scope)
function createGrid(ctx) {
  let wavesCanvasRect = wavesCanvas.getBoundingClientRect();
  let wavesCanvasHeight = wavesCanvasRect.height;
  let wavesCanvasWidth = wavesCanvasRect.width;

  // We clear whatever is in scope and we create the grid again
  ctx.clearRect(0, 0, wavesCanvasWidth, wavesCanvasHeight);

  // Mid point of the scope canvas (used to create the grid)
  let midPoint = {
    x: wavesCanvasWidth / 2,
    y: wavesCanvasHeight / 2
  };

  // Draw the two gray axes
  ctx.beginPath();
  ctx.moveTo(0, midPoint.y);
  ctx.lineTo(wavesCanvasWidth, midPoint.y);
  ctx.moveTo(midPoint.x, 0);
  ctx.lineTo(midPoint.x, wavesCanvasHeight);
  setStyleWidthOpacity(ctx, "rgb(124, 124, 124)", '5', 1);
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
    if (linesDrawn%4 === 0){
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
  while (dashesX <= wavesCanvasWidth) {
    if (linesDrawn%4 === 0){
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
    if (linesDrawn%4 === 0){
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
  while (dashesY <= wavesCanvasHeight) {
    if (linesDrawn%4 === 0){
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

  let lengthScale = dashSpace*4;
  let offsetY = 8;
  let offsetX = 3;
  let lengthLittleLines = 10;
  dashesY = wavesCanvasHeight;
  // Draw yellow scale
  ctx.beginPath();
  setStyleWidthOpacity(ctx, "rgb(255, 233, 0)", '3', 1);
  ctx.moveTo(midPoint.x + offsetX, dashesY-offsetY);
  ctx.lineTo(midPoint.x + lengthScale - offsetX, dashesY-offsetY);

  ctx.moveTo(midPoint.x + offsetX, dashesY-offsetY-lengthLittleLines/2);
  ctx.lineTo(midPoint.x + offsetX, dashesY-offsetY+lengthLittleLines/2);

  ctx.moveTo(midPoint.x + lengthScale - offsetX, dashesY-offsetY-lengthLittleLines/2);
  ctx.lineTo(midPoint.x + lengthScale - offsetX, dashesY-offsetY+lengthLittleLines/2);

  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();

  ctx.globalAlpha = 1;
  ctx.font = '16px Verdana';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';

  ctx.fillText('25 ms', midPoint.x + lengthScale/2 - offsetX/2, dashesY-offsetY-lengthLittleLines/2);

  ctx.stroke();
  ctx.closePath();
}

function setStyleWidthOpacity (ctx, style, width, opacity){
  ctx.strokeStyle = style;
  ctx.lineWidth = width;
  ctx.globalAlpha = opacity;
}

function setLeyendVisibility (status) {
  document.getElementById("pure-tones-text").style.visibility=status;
  document.getElementById("leyend-text").style.visibility=status;
  document.getElementById("line-canvas").style.visibility=status;
}

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

function calculateProportionWave(max){
  let wavesCanvasRect = wavesCanvas.getBoundingClientRect();
  let wavesCanvasHeight = wavesCanvasRect.height;
  if (max<wavesCanvasHeight){
    return 1;
  } else {
    return wavesCanvasHeight/max;
  }
}

// Scope canvas drawing
function drawWavesCanvas() {
    let wavesCanvasRect = wavesCanvas.getBoundingClientRect();
    let wavesCanvasHeight = wavesCanvasRect.height;
    let wavesCanvasWidth = wavesCanvasRect.width;
    let numberPoints;
    let sliceWidth;
    let freqInfoMessage;
    let opacityLevel = 0.65;

    createGrid(wavesCanvasCtx);

    // Make the effect of the graph moving in time (currently deactivated)
    if (AFFECTTIME) {
      t++;
    }

    // PURE MODE
    if (mode==="pure"){
      // In case we are in mouse mode (or nothing is being clicked/touched)
      if (nFingers===0){
        numberPoints = 2048*16;
        // We get the x-distance between each point by dividing the total width by the number of points
        sliceWidth = wavesCanvasWidth / numberPoints;

        let maxHeight = calculateMaximumPureSingleWave(numberPoints, sliceWidth);
        let scaleProportion = calculateProportionWave(maxHeight*2);


        // We draw the blue wave line
        wavesCanvasCtx.beginPath();
        setStyleWidthOpacity(wavesCanvasCtx, WAVECOLORTOTAL, '5', 1);

        // x starts at 0 (first point is at 0)
        let x = 0;
        // For each of the points that we have
        for (let i = 0; i < numberPoints; i++) {
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

          y *= scaleProportion;
          y += wavesCanvasHeight/2;

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
        numberPoints = 2048*16/(nFingers+1);
        sliceWidth = wavesCanvasWidth / numberPoints;

        let maxHeight = calculateMaximumPureMultipleWaves(numberPoints, sliceWidth);
        let scaleProportion = calculateProportionWave(maxHeight*2);

        wavesCanvasCtx.beginPath();
        setStyleWidthOpacity(wavesCanvasCtx, WAVECOLORTOTAL, '5', 1);
        let x = 0;
        for (let i = 0; i < numberPoints; i++) {
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
          y *= scaleProportion;
          y+= wavesCanvasHeight/2;
          if (i === 0) {
            wavesCanvasCtx.moveTo(x, y);
          } else {
            wavesCanvasCtx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        wavesCanvasCtx.stroke();

        // Now, we will draw each of the thinner lines for each finger.
        for (let j=0; j<nFingers; j++){
          let x = 0;
          wavesCanvasCtx.beginPath();
          // If we have only 1 finger, the line will still be thick
          if (nFingers===1){
            wavesCanvasCtx.globalAlpha = 1;
            wavesCanvasCtx.lineWidth = '1.3';
          } else {
            wavesCanvasCtx.globalAlpha = opacityLevel;
            wavesCanvasCtx.lineWidth = '2';
          }

          // In case of the finger number, we will choose one color and write its frequency
          if (j===0){
              wavesCanvasCtx.strokeStyle = WAVECOLOR1;
              freqInfoMessage="<span style='color: "+WAVECOLOR1+"'>"+Math.round(frequency[j])+"</span>";
          } else if (j===1){
              wavesCanvasCtx.strokeStyle = WAVECOLOR2;
              freqInfoMessage+=" <span style='color: "+WAVECOLOR2+"'>"+Math.round(frequency[j])+"</span>";
          } else if (j===2){
              wavesCanvasCtx.strokeStyle = WAVECOLOR3;
              freqInfoMessage+=" <span style='color: "+WAVECOLOR3+"'>"+Math.round(frequency[j])+"</span>";
          } else if (j===3){
              wavesCanvasCtx.strokeStyle = WAVECOLOR4;
              freqInfoMessage+=" <span style='color: "+WAVECOLOR4+"'>"+Math.round(frequency[j])+"</span>";
          } else {
              wavesCanvasCtx.strokeStyle = WAVECOLOR5;
              freqInfoMessage+=" <span style='color: "+WAVECOLOR5+"'>"+Math.round(frequency[j])+"</span>";
          }
          for (let i = 0; i < numberPoints; i++) {
            let y=0;
            let wavelength = 100 * wavesCanvasHeight / frequency[j];
            let v = wavelength/frequency[j];
            let k = 2*Math.PI/wavelength;
            if (amplitude[j]<0){
              y += (0 * 350 * Math.cos(k*(x+v*t)));
            } else {
              y += (amplitude[j]* 350 * Math.cos(k*(x+v*t)));
            }
            y *= scaleProportion;
            y += wavesCanvasHeight/2;
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
        if (frequency[0]===1){
          freqInfoMessage="";
          setLeyendVisibility('hidden');
        } else {
          freqInfoMessage=Math.round(frequency[0])+" Hz (cycles/second)";
          setLeyendVisibility('visible');
        }
      } else {
        freqInfoMessage+=" <span style='color: rgb(255, 255, 255)'>Hz</span>";
        setLeyendVisibility('visible');
      }
    } else if (mode==="complex"){

      // If nothing is being pressed, just draw the blue line
      if (frequency[0]===1){
        freqInfoMessage="";
        numberPoints = 2048*16;
        sliceWidth = wavesCanvasWidth / numberPoints;
        wavesCanvasCtx.beginPath();
        setStyleWidthOpacity(wavesCanvasCtx, WAVECOLORTOTAL, '5', 1);
        let x = 0;
        for (let i = 0; i < numberPoints; i++) {
          let y=0;
          let wavelength = 100 * wavesCanvasHeight / frequency[0];
          let v = wavelength/frequency[0];
          let k = 2*Math.PI/wavelength;
          if (amplitude[0]<0){
            y += (0 * 350 * Math.cos(k*(x+v*t)));
          } else {
            y += (amplitude[0]* 350 * Math.cos(k*(x+v*t)));
          }
          y += wavesCanvasHeight/2;
          if (i === 0) {
            wavesCanvasCtx.moveTo(x, y);
          } else {
            wavesCanvasCtx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        wavesCanvasCtx.stroke();
        setLeyendVisibility('hidden');
      } else {
        // Otherwise:
        // We will draw the thick yellow line and the other thinner lines as if we where in touching mode
        numberPoints = 2048*16/WAVESCOMPLEXMODE;
        sliceWidth = wavesCanvasWidth / numberPoints;

        let maxHeight = calculateMaximumComplexWaves(numberPoints, sliceWidth);
        let scaleProportion = calculateProportionWave(maxHeight*2);

        wavesCanvasCtx.beginPath();
        setStyleWidthOpacity(wavesCanvasCtx, WAVECOLORTOTAL, '5', 1);
        let x = 0;
        for (let i = 0; i < numberPoints; i++) {
          let y=0;

          for (let j=0; j<WAVESCOMPLEXMODE; j++){
            let wavelength = 100 * wavesCanvasHeight / frequency[j];
            let v = wavelength/frequency[j];
            let k = 2*Math.PI/wavelength;
            if (amplitude[j]<0){
              y += (0 * 350 * Math.cos(k*(x+v*t)));
            } else {
              y += (amplitude[j]* 350 * Math.cos(k*(x+v*t)));
            }
          }
          y *= scaleProportion;
          y+= wavesCanvasHeight/2;
          if (i === 0) {
            wavesCanvasCtx.moveTo(x, y);
          } else {
            wavesCanvasCtx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        wavesCanvasCtx.stroke();

        for (let j=0; j<WAVESCOMPLEXMODE; j++){
          let x = 0;
          wavesCanvasCtx.beginPath();
          wavesCanvasCtx.lineWidth = '1';
          wavesCanvasCtx.globalAlpha = opacityLevel;
          if (j===0){
              wavesCanvasCtx.strokeStyle = WAVECOLOR1;
              freqInfoMessage="<span style='color: "+WAVECOLOR1+"'>"+Math.round(frequency[j])+"</span>";
          } else if (j===1){
              wavesCanvasCtx.strokeStyle = WAVECOLOR2;
              freqInfoMessage+=" <span style='color: "+WAVECOLOR2+"'>"+Math.round(frequency[j])+"</span>";
          } else if (j===2){
              wavesCanvasCtx.strokeStyle = WAVECOLOR3;
              freqInfoMessage+=" <span style='color: "+WAVECOLOR3+"'>"+Math.round(frequency[j])+"</span>";
          } else if (j===3){
              wavesCanvasCtx.strokeStyle = WAVECOLOR4;
              freqInfoMessage+=" <span style='color: "+WAVECOLOR4+"'>"+Math.round(frequency[j])+"</span>";
          } else {
              wavesCanvasCtx.strokeStyle = WAVECOLOR5;
              freqInfoMessage+=" <span style='color: "+WAVECOLOR5+"'>"+Math.round(frequency[j])+"</span>";
          }
          for (let i = 0; i < numberPoints; i++) {
            let y=0;
            let wavelength = 100 * wavesCanvasHeight / frequency[j];
            let v = wavelength/frequency[j];
            let k = 2*Math.PI/wavelength;
            if (amplitude[j]<0){
              y += (0 * 350 * Math.cos(k*(x+v*t)));
            } else {
              y += (amplitude[j]* 350 * Math.cos(k*(x+v*t)));
            }
            y *= scaleProportion;
            y+= wavesCanvasHeight/2;
            if (i === 0) {
              wavesCanvasCtx.moveTo(x, y);
            } else {
              wavesCanvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
          }
          wavesCanvasCtx.stroke();
        }
        freqInfoMessage+=" <span style='color: rgb(255, 255, 255)'>Hz</span>";
        setLeyendVisibility ('visible');
      }
    }
    document.getElementById("freq-info").innerHTML=freqInfoMessage;
    drawTimeStamp = Date.now();
};

// Draw blue point where finger is, sets corresponding volume and frequency
function renderCanvas() {
  let controlsCanvasRect = controlsCanvas.getBoundingClientRect();
  if (mouseDown) {
    let setF = setFrequency(((mousePos[0].y / controlsCanvasRect.height) - 1) * -1, 0);
    let setV = setVolume(mousePos[0].x / controlsCanvasRect.width, 0);
    if (mode==="complex"){
      if (firstComplexRender){
        calculateRandomVolumes();
        referenceComplexAmplitude = amplitude[0];
        firstComplexRender = false;
      }

      if(amplitude[0] <= 0){
        proportion = referenceComplexAmplitude/0.00001;
      } else {
        proportion = referenceComplexAmplitude/amplitude[0];
      }
      calculateFrequencyMultiplier(frequency[0], 2, 1);
      calculateFrequencyMultiplier(frequency[0], 3, 2);
      calculateFrequencyMultiplier(frequency[0], 4, 3);
      calculateFrequencyMultiplier(frequency[0], 5, 4);
      for (let w=1; w<WAVESCOMPLEXMODE; w++) {
        calculateNewVolume(proportion, w);
        calculateMousePos(controlsCanvas, w);
      }
    } else if (mode==="pure"){
      for (let w=1; w<nFingers; w++){
        // We set the volume and the frequency
        let setVw = setVolume(mousePos[w].x / controlsCanvasRect.width, w);
        let setFw = setFrequency(((mousePos[w].y / controlsCanvasRect.height) - 1) * -1, w);
        setV = setV || setVw;
        setF = setF || setFw;
      }
    }
    if(((setV | setF) && Date.now()-drawTimeStamp>40) || (prevNFingers !== nFingers)){
      drawWavesCanvas();
      prevNFingers = nFingers;
    }

    // We redraw the axes and the point
    renderAxesLabelsControlsCanvas(controlsCanvas, controlsCanvasCtx);
    if (nFingers==0){
      if (mode==="pure"){
        drawPoint(controlsCanvasCtx, 0, 10);
      } else if (mode==="complex"){
        for (let w=0; w<WAVESCOMPLEXMODE; w++) {
          drawPoint(controlsCanvasCtx, w, 10);
        }
      }
    } else {
      if (mode==="pure"){
        for (let w=0; w<nFingers; w++){
          drawPoint(controlsCanvasCtx, w, 40);
        }
      } else if (mode==="complex"){
        drawPoint(controlsCanvasCtx, 0, 40);
        for (let w=1; w<WAVESCOMPLEXMODE; w++) {
          drawPoint(controlsCanvasCtx, w, 27);
        }
      }

    }
    // What is this for?
    requestAnimationFrame(renderCanvas);
  }
}


// Function that draws of the axes labels in the left canvas
function renderAxesLabelsControlsCanvas(canvas, ctx) {
  let rect = canvas.getBoundingClientRect();
  // We clear the canvas to make sure we don't leave anything painted
  ctx.clearRect(0, 0, rect.width, rect.height);

  let ticks = 4;
  let yLabelOffset = 13;
  let x = rect.width;
  // Render the vertical frequency axis.
  for (let i = 0; i <= ticks; i++) {
    let freq = ((i) / (ticks))
    let tickFreq = Math.round(logspace(MINFREQ, MAXFREQ, freq, 2));
    let switchAmp = ((freq / ticks - 1) * -1);
    let tickAmp = Math.round(logspace(0.001, 0.5, switchAmp, 2) * 100) / 10 * 2;
    let percent = i / (ticks);
    let y = (1 - percent) * rect.height;
    // Get the value for the current y coordinate.

    let ampX = (1 - percent) * rect.width;
    let ampY = rect.height - 0;
    ctx.beginPath();
    ctx.font = '16px Verdana ';
    // Draw the value.
    ctx.textAlign = 'right';
    ctx.fillStyle = 'black';

    //y-axis
    ctx.fillText(tickFreq + ' Hz', parseInt(x)-29, parseInt(y + yLabelOffset));
    ctx.fillRect(parseInt(x)-19, parseInt(y), 24, 8);

    //x-axis
    ctx.fillText(tickAmp, parseInt(ampX)+45, parseInt(ampY)-10);
    ctx.fillRect(parseInt(ampX)+8, parseInt(ampY) -20, 7, 24);
  }
  // 0 mark

  ctx.fillText(MINFREQ + ' Hz', parseInt(x) - 7, parseInt(rect.height)-28);
  ctx.fillRect(parseInt(x) + - 19, parseInt(rect.height)-8, 24, 8);
}


function drawPoint(ctx, index, radius) {
  let myRadius = radius;
  let startingAngle = 0;
  let endingAngle = 2 * Math.PI;
  ctx.beginPath();
  ctx.arc(mousePos[index].x, mousePos[index].y, myRadius, startingAngle, endingAngle);
  if (index===0){
      if (nFingers===0 && mode==="pure") ctx.fillStyle = WAVECOLORTOTAL;
      else ctx.fillStyle = WAVECOLOR1;
  } else if (index===1){
      ctx.fillStyle = WAVECOLOR2;
  } else if (index===2){
      ctx.fillStyle = WAVECOLOR3;
  } else if (index===3){
      ctx.fillStyle = WAVECOLOR4;
  } else {
      ctx.fillStyle = WAVECOLOR5;
  }
  ctx.fill();
  ctx.stroke();
}


// Resize function to resize the canvas correctly (not working)
// window.addEventListener("resize", setUp);
