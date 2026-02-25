;(() => {
  const originClear = WebGL2RenderingContext.prototype.clear

  WebGL2RenderingContext.prototype.clear = function (...args) {
    let result = originClear.call(this, ...args)
    hookWebGL(this)
    return result
  }
  const originGetContext = HTMLCanvasElement.prototype.getContext

  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    const gl = originGetContext.call(this, type, attrs)
    if (!gl) return gl

    if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
      hookWebGL(gl)
    }

    return gl
  }

  const vertexShaderSource = `
    attribute vec4 xxa_positionxx;
    void main() {
      gl_Position = xxa_positionxx;
    }`
  const fragmentShaderSource = `
    precision mediump float;
    void main() {
      gl_FragColor = vec4(1, 0, 0.5, 1); 
    }`

  function hookWebGL(gl) {
    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.BLEND)

    var vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    // Create a buffer and put three 2d clip space points in it
    var positionBuffer = gl.createBuffer()

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    var positions = [0, 0, 0, 0.5, 0.7, 0]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    // Clear the canvas
    // gl.clearColor(0, 0, 0, 0)
    // gl.clear(gl.COLOR_BUFFER_BIT)
    // originClear.call(gl, gl.COLOR_BUFFER_BIT)

    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

    // Link the two shaders into a program
    var program = createProgram(gl, vertexShader, fragmentShader)

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program)
    // look up where the vertex data needs to go.
    var positionAttributeLocation = gl.getAttribLocation(program, 'xxa_positionxx')
    gl.bindVertexArray(vao)

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2 // 2 components per iteration
    var type = gl.FLOAT // the data is 32bit floats
    var normalize = false // don't normalize the data
    var stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0 // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)
    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation)

    // draw
    var primitiveType = gl.TRIANGLES
    var offset = 0
    var count = 3
    gl.drawArrays(primitiveType, offset, count)
    // originClear.call(gl, gl.COLOR_BUFFER_BIT)
  }
})()
function createShader(gl, type, source) {
  var shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }
  console.log(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)
}
function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  var success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) {
    return program
  }
  console.log(gl.getProgramInfoLog(program))
  gl.deleteProgram(program)
}
