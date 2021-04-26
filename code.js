let programs = [];
let currentProgram = 0;
let squareRotation = 0.0;
const canvas = document.querySelector("#glcanvas");
const gl = canvas.getContext("webgl");
const vsSource = () => {
  // Vertex shader program
  return `
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
};
const fsSource = () => {
  // Fragment shader program
  return `
        precision mediump float;
        uniform vec4 ourColor; // we set this variable in the OpenGL code.
        
        void main()
        {
          gl_FragColor = ourColor;
        }   
        `;
};

const square = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
const triangule = [0.0, -0.5, 0.0, 0.9, -0.5, 0.0, 0.45, 0.5, 0.0];

main();

function main() {
  if (!gl) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }

  canvasListener(canvas);
  console.log(programs);

  var then = 0;

  function render(now) {
    now *= 0.001;
    const deltaTime = now - then;
    then = now;

    drawScene(gl, deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

function drawScene(gl, deltaTime) {
  //PLANO DE FUNDO
  let red = document.getElementById("red").value;
  let green = document.getElementById("green").value;
  let blue = document.getElementById("blue").value;
  gl.clearColor(red, green, blue, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //CAMERA
  let cameraDistance = document.getElementById("camera").value;
  const fieldOfView = (cameraDistance * Math.PI) / 180; // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  currentProgram = parseInt(document.getElementById("indexObjects").value);

  //TRANSFORMAÇÕES
  if (programs.length > 0) {
    //DESENHAR OBJETOS
    for (let i = 0; i < programs.length; i++) {
      let actualProgram = programs[i];
      drawObject(gl, actualProgram, projectionMatrix, cameraDistance);
    }

    squareRotation += deltaTime;
  }
}

function drawObject(gl, object, projectionMatrix, cameraDistance) {
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, object.buffer.position);
    gl.vertexAttribPointer(
      object.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(object.attribLocations.vertexPosition);
  }

  gl.useProgram(object.program);

  gl.uniformMatrix4fv(
    object.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );

  //TRANSLAÇÃO
  const modelViewMatrix = mat4.create();
  let translation = vec3.create();

  if (object.id === currentProgram) {
    if (document.getElementById("chkTranslate").checked === true) {
      let xAxis = parseFloat(document.getElementById("xAxis").value);
      let yAxis = parseFloat(document.getElementById("yAxis").value);
      object.objectTranslate.x = xAxis;
      object.objectTranslate.y = yAxis;
    }

    vec3.set(
      translation,
      object.objectTranslate.x * (cameraDistance / 15),
      object.objectTranslate.y * (cameraDistance / 15),
      -3.0
    );
  } else {
    vec3.set(
      translation,
      object.objectTranslate.x * (cameraDistance / 15),
      object.objectTranslate.y * (cameraDistance / 15),
      -3.0
    );
  }

  mat4.translate(modelViewMatrix, modelViewMatrix, translation);

  //ESCALA
  if (object.id === currentProgram) {
    let xAxisScale;
    let yAxisScale;
    if (document.getElementById("chkScale").checked === true) {
      if (document.getElementById("chkProportional").checked === true) {
        xAxisScale = document.getElementById("xAxisScale").value;
        yAxisScale = document.getElementById("xAxisScale").value;
        document.getElementById("yAxisScale").value = yAxisScale;
      } else {
        xAxisScale = document.getElementById("xAxisScale").value;
        yAxisScale = document.getElementById("yAxisScale").value;
      }
      object.objectScale.x = xAxisScale;
      object.objectScale.y = yAxisScale;
    }
  }
  mat4.scale(modelViewMatrix, modelViewMatrix, [
    object.objectScale.x * (cameraDistance / 15),
    object.objectScale.y * (cameraDistance / 15),
    1,
  ]);

  gl.uniformMatrix4fv(
    object.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  //EDITAR COR
  if (object.id === currentProgram) {
    if (document.getElementById("chkColor").checked) {
      object.objectColor.red = document.getElementById("redObject").value;
      object.objectColor.green = document.getElementById("greenObject").value;
      object.objectColor.blue = document.getElementById("blueObject").value;
    }
  }

  //ATUALIZAR COR
  gl.uniform4f(
    object.color,
    object.objectColor.red,
    object.objectColor.green,
    object.objectColor.blue,
    object.objectColor.alpha
  );

  //DESENHAR OBJETO NA TELA
  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}

function addProgram(gl, vsSrc, fsSrc, positions) {
  const shaderProgram = initShaderProgram(gl, vsSrc, fsSrc);
  return {
    id: programs.length,
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
    buffer: initBuffers(gl, positions),
    objectColor: {
      red: 1.0,
      green: 0.0,
      blue: 0.0,
      alpha: 1.0,
    },
    objectTranslate: {
      x: 0.0,
      y: 0.0,
    },
    objectScale: {
      x: 0.1,
      y: 0.1,
    },
  };
}

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(shaderProgram)
    );
    return null;
  }

  return shaderProgram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function initBuffers(gl, positions) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
  };
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

function createObject() {
  programs.push(addProgram(gl, vsSource(), fsSource(), square));
  console.log(programs);
  document.getElementById("indexObjects").value = programs.length - 1;
  // if (programs.length === 1) {
  //   document.getElementById("indexObjects").value = 1;
  // } else {
  //   document.getElementById("indexObjects").value = programs.length - 1;
  // }
}

function deleteProgram() {
  let lastProgram = programs[programs.length - 1];

  if (lastProgram !== undefined) {
    console.log(lastProgram.id);
    gl.deleteProgram(lastProgram.program);
    programs.pop();
    if (programs.length === 0) {
      document.getElementById("indexObjects").value = 0;
    } else {
      document.getElementById("indexObjects").value = programs.length - 1;
    }
    for (let i = 0; i < programs.length; i++) {
      let program = programs[i];
      program.id = i;
    }
  }

  console.log(programs);
}
