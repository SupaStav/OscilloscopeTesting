/* INCLUDED HERE:
    - All the functions that in some way draw something on screen
      * Grid drawing (createGrid method)
      * Wave plotting (draw method)
      * Render canvas methods
      * Render axes method
      * Point drawing method
*/

// This function creates the grid of the canvas inserted as argument (it will be used for scope)
function createGrid(ctx) {
  // Mid point of the scope canvas (used to create the grid)
  let midPoint = {
    x: WIDTH / 2,
    y: HEIGHT / 2
  };

  // Draw the two gray axes
  ctx.beginPath();
  ctx.moveTo(0, midPoint.y);
  ctx.lineTo(WIDTH, midPoint.y);
  ctx.moveTo(midPoint.x, 0);
  ctx.lineTo(midPoint.x, HEIGHT);
  ctx.strokeStyle = "rgb(124, 124, 124)";
  ctx.lineWidth = '5';
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.stroke();
  ctx.closePath();

  // Draw the white lines
  ctx.beginPath();
  ctx.strokeStyle = "rgb(255, 255, 255)";
  ctx.lineWidth = '5';
  ctx.globalAlpha = 1;

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
  while (dashesX <= WIDTH) {
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
  while (dashesY <= HEIGHT) {
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
  dashesY = HEIGHT;
  // Draw yellow scale
  ctx.beginPath();
  ctx.strokeStyle = "rgb(255,233,0)";
  ctx.lineWidth = '3';
  ctx.globalAlpha = 1;

  ctx.moveTo(midPoint.x + offsetX, dashesY-offsetY);
  ctx.lineTo(midPoint.x + lengthScale - offsetX, dashesY-offsetY);

  ctx.moveTo(midPoint.x + offsetX, dashesY-offsetY-lengthLittleLines/2);
  ctx.lineTo(midPoint.x + offsetX, dashesY-offsetY+lengthLittleLines/2);

  ctx.moveTo(midPoint.x + lengthScale - offsetX, dashesY-offsetY-lengthLittleLines/2);
  ctx.lineTo(midPoint.x + lengthScale - offsetX, dashesY-offsetY+lengthLittleLines/2);

  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.strokeStyle = "rgb(255,255,255)";
  ctx.globalAlpha = 1;

  ctx.font = '16px Verdana';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';

  ctx.fillText('25 ms', midPoint.x + lengthScale/2 - offsetX/2, dashesY-offsetY-lengthLittleLines/2);

  ctx.stroke();
  ctx.closePath();
}

// Scope canvas drawing
function draw() {
    let freqInfoMessage;
    let opacityLevel = 0.65;
    // We clear whatever is in scope and we create the grid again
    scopeCtx.clearRect(0, 0, WIDTH, HEIGHT);
    createGrid(scopeCtx);

    // Make the effect of the graph moving in time (currently deactivated)
    if (affectTime) {
      t++;
    }

    // PURE MODE
    if (mode==="pure"){
      // In case we are in mouse mode (or nothing is being clicked/touched)
      if (nFingers===0){
        numberPoints = 2048*16;
        // We get the x-distance between each point by dividing the total width by the number of points
        sliceWidth = WIDTH / numberPoints;

        // let maxHeight = calculateMaximumPureSingleWave(sliceWidth);
        // let scaleProportion = calculateProportionWave(maxHeight*1.2);
        // console.log(scaleProportion);


        // We draw the blue wave line
        scopeCtx.beginPath();
        scopeCtx.strokeStyle = WAVECOLORTOTAL;
        scopeCtx.lineWidth = '5';
        scopeCtx.globalAlpha = 1;

        // x starts at 0 (first point is at 0)
        let x = 0;
        // For each of the points that we have
        for (let i = 0; i < numberPoints; i++) {
          let y=0;
          // Calculate the location of the point using the equation of the wave.
          let wavelength = 100 * HEIGHT / frequency[0];
          let v = wavelength/frequency[0];
          let k = 2*Math.PI/wavelength;
          if (amplitude[0]<0){
            y += (0 * 350 * Math.cos(k*(x+v*t)));
          } else {
            y += (amplitude[0]* 350 * Math.cos(k*(x+v*t)));
          }

          y += HEIGHT/2;


          // if (y<(HEIGHT/2)){
          //   let opposite = HEIGHT - y;
          //   y += opposite-(opposite*scaleProportion);
          // } else {
          //   y *= scaleProportion;
          // }

          // We draw the point in the canvas
          if (i === 0) {
            scopeCtx.moveTo(x, y);
          } else {
            scopeCtx.lineTo(x, y);

            // scopeCtx.fillStyle = WAVECOLORTOTAL;
            // scopeCtx.fillRect(x,y,1,1);
          }
          // x moves the x-distance to the right
          x += sliceWidth;
        }
        scopeCtx.stroke();
      } else {
        // In case we are in touch mode
        /* If there is more than 1 finger pressed, we will draw a thick yellow line
        which will be the result of adding all the other waves */
        numberPoints = 2048*16/(nFingers+1);
        sliceWidth = WIDTH / numberPoints;

        scopeCtx.beginPath();
        scopeCtx.lineWidth = '5';
        scopeCtx.globalAlpha = 1;
        scopeCtx.strokeStyle = WAVECOLORTOTAL;
        let x = 0;
        for (let i = 0; i < numberPoints; i++) {
          let y=0;
          // Add the result of each of the waves in position x
          for (let j=0; j<nFingers; j++){
            let wavelength = 100 * HEIGHT / frequency[j];
            let v = wavelength/frequency[j];
            let k = 2*Math.PI/wavelength;
            if (amplitude[j]<0){
              y += (0* 350 * Math.cos(k*(x+v*t)));
            } else {
              y += (amplitude[j]* 350 * Math.cos(k*(x+v*t)));
            }
          }
          y+= HEIGHT/2;
          if (i === 0) {
            scopeCtx.moveTo(x, y);
          } else {
            scopeCtx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        scopeCtx.stroke();

        // Now, we will draw each of the thinner lines for each finger.
        for (let j=0; j<nFingers; j++){
          let x = 0;
          scopeCtx.beginPath();
          // If we have only 1 finger, the line will still be thick
          if (nFingers===1){
            scopeCtx.globalAlpha = 1;
            scopeCtx.lineWidth = '1.3';
          } else {
            scopeCtx.globalAlpha = opacityLevel;
            scopeCtx.lineWidth = '2';
          }

          // In case of the finger number, we will choose one color and write its frequency
          if (j===0){
              scopeCtx.strokeStyle = WAVECOLOR1;
              freqInfoMessage="<span style='color: "+WAVECOLOR1+"'>"+Math.round(frequency[j])+"</span>";
          } else if (j===1){
              scopeCtx.strokeStyle = WAVECOLOR2;
              freqInfoMessage+=" <span style='color: "+WAVECOLOR2+"'>"+Math.round(frequency[j])+"</span>";
          } else if (j===2){
              scopeCtx.strokeStyle = WAVECOLOR3;
              freqInfoMessage+=" <span style='color: "+WAVECOLOR3+"'>"+Math.round(frequency[j])+"</span>";
          } else if (j===3){
              scopeCtx.strokeStyle = WAVECOLOR4;
              freqInfoMessage+=" <span style='color: "+WAVECOLOR4+"'>"+Math.round(frequency[j])+"</span>";
          } else {
              scopeCtx.strokeStyle = WAVECOLOR5;
              freqInfoMessage+=" <span style='color: "+WAVECOLOR5+"'>"+Math.round(frequency[j])+"</span>";
          }
          for (let i = 0; i < numberPoints; i++) {
            let y=0;
            let wavelength = 100 * HEIGHT / frequency[j];
            let v = wavelength/frequency[j];
            let k = 2*Math.PI/wavelength;
            if (amplitude[j]<0){
              y += (0 * 350 * Math.cos(k*(x+v*t)));
            } else {
              y += (amplitude[j]* 350 * Math.cos(k*(x+v*t)));
            }

            y += HEIGHT/2;
            if (i === 0) {
              scopeCtx.moveTo(x, y);
            } else {
              scopeCtx.lineTo(x, y);
            }
            x += sliceWidth;
          }
          scopeCtx.stroke();
        }
      }
      // Write the message in case of the number of fingers we have
      if (nFingers < 1) {
        if (frequency[0]===1){
          freqInfoMessage="";
          document.getElementById("pure-tones-text").style.visibility='hidden';
          document.getElementById("leyend-text").style.visibility='hidden';
          document.getElementById("line-canvas").style.visibility='hidden';
        } else {
          freqInfoMessage=Math.round(frequency[0])+" Hz (cycles/second)";
          document.getElementById("pure-tones-text").style.visibility='visible';
          document.getElementById("leyend-text").style.visibility='visible';
          document.getElementById("line-canvas").style.visibility='visible';
        }
      } else {
        freqInfoMessage+=" <span style='color: rgb(255, 255, 255)'>Hz</span>";
        document.getElementById("pure-tones-text").style.visibility='visible';
        document.getElementById("leyend-text").style.visibility='visible';
        document.getElementById("line-canvas").style.visibility='visible';
      }
    } else {
      // COMPLEX MODE

      // If nothing is being pressed, just draw the blue line
      if (frequency[0]===1){
        freqInfoMessage="";
        numberPoints = 2048*16;
        sliceWidth = WIDTH / numberPoints;
        scopeCtx.beginPath();
        scopeCtx.strokeStyle = WAVECOLORTOTAL;
        scopeCtx.lineWidth = '5';
        scopeCtx.globalAlpha = 1;
        let x = 0;
        for (let i = 0; i < numberPoints; i++) {
          let y=0;
          let wavelength = 100 * HEIGHT / frequency[0];
          let v = wavelength/frequency[0];
          let k = 2*Math.PI/wavelength;
          if (amplitude[0]<0){
            y += (0 * 350 * Math.cos(k*(x+v*t)));
          } else {
            y += (amplitude[0]* 350 * Math.cos(k*(x+v*t)));
          }
          y += HEIGHT/2;
          if (i === 0) {
            scopeCtx.moveTo(x, y);
          } else {
            scopeCtx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        scopeCtx.stroke();
        document.getElementById("pure-tones-text").style.visibility='hidden';
        document.getElementById("leyend-text").style.visibility='hidden';
        document.getElementById("line-canvas").style.visibility='hidden';
      } else {
        // Otherwise:
        // We will draw the thick yellow line and the other thinner lines as if we where in touching mode
        numberPoints = 2048*16/WAVESCOMPLEXMODE;
        sliceWidth = WIDTH / numberPoints;
        scopeCtx.beginPath();
        scopeCtx.lineWidth = '5';
        scopeCtx.globalAlpha = 1;
        scopeCtx.strokeStyle = WAVECOLORTOTAL;
        let x = 0;
        for (let i = 0; i < numberPoints; i++) {
          let y=0;

          for (let j=0; j<WAVESCOMPLEXMODE; j++){
            let wavelength = 100 * HEIGHT / frequency[j];
            let v = wavelength/frequency[j];
            let k = 2*Math.PI/wavelength;
            if (amplitude[j]<0){
              y += (0 * 350 * Math.cos(k*(x+v*t)));
            } else {
              y += (amplitude[j]* 350 * Math.cos(k*(x+v*t)));
            }
          }
          y+= HEIGHT/2;
          if (i === 0) {
            scopeCtx.moveTo(x, y);
          } else {
            scopeCtx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        scopeCtx.stroke();

        for (let j=0; j<WAVESCOMPLEXMODE; j++){
          let x = 0;
          scopeCtx.beginPath();
          scopeCtx.lineWidth = '1';
          scopeCtx.globalAlpha = opacityLevel;
          if (j===0){
              scopeCtx.strokeStyle = WAVECOLOR1;
              freqInfoMessage="<span style='color: "+WAVECOLOR1+"'>"+Math.round(frequency[j])+"</span>";
          } else if (j===1){
              scopeCtx.strokeStyle = WAVECOLOR2;
              freqInfoMessage+=" <span style='color: "+WAVECOLOR2+"'>"+Math.round(frequency[j])+"</span>";
          } else if (j===2){
              scopeCtx.strokeStyle = WAVECOLOR3;
              freqInfoMessage+=" <span style='color: "+WAVECOLOR3+"'>"+Math.round(frequency[j])+"</span>";
          } else if (j===3){
              scopeCtx.strokeStyle = WAVECOLOR4;
              freqInfoMessage+=" <span style='color: "+WAVECOLOR4+"'>"+Math.round(frequency[j])+"</span>";
          } else {
              scopeCtx.strokeStyle = WAVECOLOR5;
              freqInfoMessage+=" <span style='color: "+WAVECOLOR5+"'>"+Math.round(frequency[j])+"</span>";
          }
          for (let i = 0; i < numberPoints; i++) {
            let y=0;
            let wavelength = 100 * HEIGHT / frequency[j];
            let v = wavelength/frequency[j];
            let k = 2*Math.PI/wavelength;
            if (amplitude[j]<0){
              y += (0 * 350 * Math.cos(k*(x+v*t)));
            } else {
              y += (amplitude[j]* 350 * Math.cos(k*(x+v*t)));
            }
            y+= HEIGHT/2;
            if (i === 0) {
              scopeCtx.moveTo(x, y);
            } else {
              scopeCtx.lineTo(x, y);
            }
            x += sliceWidth;
          }
          scopeCtx.stroke();
        }
        freqInfoMessage+=" <span style='color: rgb(255, 255, 255)'>Hz</span>";
        document.getElementById("pure-tones-text").style.visibility='visible';
        document.getElementById("leyend-text").style.visibility='visible';
        document.getElementById("line-canvas").style.visibility='visible';
      }
    }
    document.getElementById("freq-info").innerHTML=freqInfoMessage;
    drawTimeStamp = Date.now();
};


// Draw blue point where finger is, sets corresponding volume and frequency
function renderCanvas() {
  if (mouseDown) {
    if (firstDown) {
      startFrequency (((mousePos[0].y / DRAWHEIGHT) - 1) * -1, 0);
      for (let w=1; w<nFingers; w++){
        startFrequency (((mousePos[w].y / DRAWHEIGHT) - 1) * -1, w);
      }
    }
    let setF = setFrequency(((mousePos[0].y / DRAWHEIGHT) - 1) * -1, 0);
    let setV = setVolume(mousePos[0].x / DRAWWIDTH, 0);
    if (firstComplex){
      calculateRandomVolumes();
      originalComplexAmplitude = amplitude[0];
      firstComplex = false;
    }
    if (mode==="complex"){
      if(amplitude[0] <= 0){
        proportion = originalComplexAmplitude/0.00001;
      } else {
        proportion = originalComplexAmplitude/amplitude[0];
      }
      if (firstDown) {
        pureOn = true;
      }
      calculateFrequencyMultiplier(frequency[0], 2, 1);
      calculateFrequencyMultiplier(frequency[0], 3, 2);
      calculateFrequencyMultiplier(frequency[0], 4, 3);
      calculateFrequencyMultiplier(frequency[0], 5, 4);
      for (let w=1; w<WAVESCOMPLEXMODE; w++) {
        calculateNewVolume(proportion, w);
        calculateMousePos(w);
      }
    } else {
      for (let w=1; w<nFingers; w++){
        // We set the volume and the frequency
        let setVw = setVolume(mousePos[w].x / DRAWWIDTH, w);
        let setFw = setFrequency(((mousePos[w].y / DRAWHEIGHT) - 1) * -1, w);
        setV = setV || setVw;
        setF = setF || setFw;
      }
    }
    if((setV | setF) && Date.now()-drawTimeStamp>40){
      draw();
    }

    // We clear the canvas to make sure we don't leave anything painted
    drawCanvasCtx.clearRect(0, 0, DRAWWIDTH, DRAWHEIGHT);
    // We redraw the axes and the point
    renderAxesLabels();
    if (nFingers==0){
      if (mode==="pure"){
        drawPoint(0, 10);
      } else {
        for (let w=0; w<WAVESCOMPLEXMODE; w++) {
          drawPoint(w, 10);
        }
      }
    } else {
      if (mode==="pure"){
        for (let w=0; w<nFingers; w++){
          drawPoint(w, 40);
        }
      } else {
        drawPoint(0, 40);
        for (let w=1; w<WAVESCOMPLEXMODE; w++) {
          drawPoint(w, 27);
        }
      }

    }
    // What is this for?
    requestAnimationFrame(renderCanvas);
  }
}


// Function that draws of the axes labels in the left canvas
function renderAxesLabels() {
  let ticks = 4;
  let yLabelOffset = 13;
  let x = DRAWWIDTH;
  // Render the vertical frequency axis.
  for (let i = 0; i <= ticks; i++) {
    let freq = ((i) / (ticks))
    let tickFreq = Math.round(logspace(minFreq, maxFreq, freq, 2));
    let switchAmp = ((freq / ticks - 1) * -1);
    let tickAmp = Math.round(logspace(0.001, 0.5, switchAmp, 2) * 100) / 10 * 2;
    let percent = i / (ticks);
    let y = (1 - percent) * DRAWHEIGHT;
    // Get the value for the current y coordinate.

    let ampX = (1 - percent) * DRAWWIDTH;
    let ampY = DRAWHEIGHT - 0;
    drawCanvasCtx.beginPath();
    drawCanvasCtx.font = '16px Verdana ';
    // Draw the value.
    drawCanvasCtx.textAlign = 'right';
    drawCanvasCtx.fillStyle = 'black';

    //y-axis
    drawCanvasCtx.fillText(tickFreq + ' Hz', parseInt(x)-29, parseInt(y + yLabelOffset));
    drawCanvasCtx.fillRect(parseInt(x)-19, parseInt(y), 24, 8);

    //x-axis
    drawCanvasCtx.fillText(tickAmp, parseInt(ampX)+45, parseInt(ampY)-10);
    drawCanvasCtx.fillRect(parseInt(ampX)+8, parseInt(ampY) -20, 7, 24);
  }
  // 0 mark

  drawCanvasCtx.fillText(minFreq + ' Hz', parseInt(x) - 7, parseInt(DRAWHEIGHT)-28);
  drawCanvasCtx.fillRect(parseInt(x) + - 19, parseInt(DRAWHEIGHT)-8, 24, 8);
}


function drawPoint(index, radius) {
  let myRadius = radius;
  drawCanvasCtx.beginPath();
  drawCanvasCtx.arc(mousePos[index].x, mousePos[index].y, myRadius, 0, 2 * Math.PI);
  if (index===0){
      if (nFingers===0 && mode==="pure") drawCanvasCtx.fillStyle = WAVECOLORTOTAL;
      else drawCanvasCtx.fillStyle = WAVECOLOR1;
  } else if (index===1){
      drawCanvasCtx.fillStyle = WAVECOLOR2;
  } else if (index===2){
      drawCanvasCtx.fillStyle = WAVECOLOR3;
  } else if (index===3){
      drawCanvasCtx.fillStyle = WAVECOLOR4;
  } else {
      drawCanvasCtx.fillStyle = WAVECOLOR5;
  }
  drawCanvasCtx.fill();
  drawCanvasCtx.stroke();
}


// Resize function to resize the canvas correctly (not working)
// window.addEventListener("resize", setUp);
