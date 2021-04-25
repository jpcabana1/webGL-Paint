var squareRotation = 0.0;

main();

//
// Start here
//
function main() {
  const canvas = document.querySelector("#glcanvas");
  const gl = canvas.getContext("webgl");

  // If we don't have a GL context, give up now

  if (!gl) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }
  canvasListener(canvas); //Listener para o mouse

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  // Fragment shader program

  const fsSource = `
    precision mediump float;
    uniform vec4 ourColor; // we set this variable in the OpenGL code.

    void main()
    {
      gl_FragColor = ourColor;
    }   
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(
        shaderProgram,
        "uProjectionMatrix"
      ),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
    },
    color: gl.getUniformLocation(shaderProgram, "ourColor"),
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl);

  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001; // convert to seconds
    const deltaTime = now - then;
    then = now;

    drawScene(gl, programInfo, buffers, deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(shaderProgram)
    );
    return null;
  }

  return shaderProgram;
}

function initBuffers(gl) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
  };
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers, deltaTime) {
  let red = document.getElementById("red").value;
  let green = document.getElementById("green").value;
  let blue = document.getElementById("blue").value;
  gl.clearColor(red, green, blue, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let cameraDistance = document.getElementById("camera").value;

  const fieldOfView = (cameraDistance * Math.PI) / 180; // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  const modelViewMatrix = mat4.create();

  var xAxis = parseFloat(document.getElementById("xAxis").value);
  var yAxis = parseFloat(document.getElementById("yAxis").value);

  var translation = vec3.create();
  vec3.set(
    translation,
    xAxis * (cameraDistance / 10),
    yAxis * (cameraDistance / 10),
    -6.0
  );

  mat4.translate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    translation
  ); // amount to translate

  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    squareRotation, // amount to rotate in radians
    [0, 0, 0]
  ); // axis to rotate around

  var xAxisScale;
  var yAxisScale;

  if (document.getElementById("chkProportional").checked === true) {
    xAxisScale = document.getElementById("xAxisScale").value;
    yAxisScale = document.getElementById("xAxisScale").value;
    document.getElementById("yAxisScale").value = yAxisScale;
  } else {
    xAxisScale = document.getElementById("xAxisScale").value;
    yAxisScale = document.getElementById("yAxisScale").value;
  }

  console.log(document.getElementById("camera").value);
  mat4.scale(modelViewMatrix, modelViewMatrix, [
    xAxisScale * (cameraDistance / 15),
    yAxisScale * (cameraDistance / 15),
    1,
  ]);

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  }
  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  //COLOR
  redObject = document.getElementById("redObject").value;
  greenObject = document.getElementById("greenObject").value;
  blueObject = document.getElementById("blueObject").value;
  gl.uniform4f(programInfo.color, redObject, greenObject, blueObject, 1.0);

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }

  // Update the rotation for the next draw

  squareRotation += deltaTime;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function canvasListener(canvas) {
  let mousedown = false;
  canvas.addEventListener("mousedown", () => {
    mousedown = true;
  });
  canvas.addEventListener("mouseup", () => {
    mousedown = false;
    // document.getElementById("mouseAxisX").value = 0.0;
    // document.getElementById("mouseAxisY").value = 0.0;
  });
  canvas.addEventListener("mousemove", (e) => {
    if (mousedown) {
      let transX = parseFloat(document.getElementById("xAxis").value);
      let xAxis = (e.clientX / canvas.clientWidth) * 2 - 1;

      document.getElementById("xAxis").value = xAxis;

      let yAxis = (e.clientY / canvas.clientHeight) * 2 - 1;
      document.getElementById("yAxis").value = -1 * yAxis;
      // document.getElementById("mouseAxisY").value =
      //   (e.clientY / canvas.clientHeight) * 2 - 1;
      // document.getElementById("mouseAxisY").value =
      //   e.clientY / canvas.clientHeight;
      // document.getElementById("xAxis").value = e.clientX / canvas.clientWidth;
      // document.getElementById("yAxis").value = e.clientY / canvas.clientHeight;
    }
  });
}
