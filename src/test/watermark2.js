import img from './35XCAD.png'
;(() => {
  function createShader(gl, type, source) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }
    return shader
  }

  function createProgram(gl, vs, fs) {
    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      return null
    }
    return program
  }

  /* ================= overlay renderer ================= */
  function sameValueZero(a, b) {
    return a === b || (a !== a && b !== b) // NaN
  }
  function SimpleMap() {
    this._keys = []
    this._values = []
  }

  SimpleMap.prototype._indexOf = function (key) {
    for (var i = 0; i < this._keys.length; i++) {
      if (sameValueZero(this._keys[i], key)) {
        return i
      }
    }
    return -1
  }

  SimpleMap.prototype.has = function (key) {
    return this._indexOf(key) !== -1
  }

  SimpleMap.prototype.get = function (key) {
    var i = this._indexOf(key)
    return i === -1 ? undefined : this._values[i]
  }

  SimpleMap.prototype.set = function (key, value) {
    var i = this._indexOf(key)
    if (i === -1) {
      this._keys.push(key)
      this._values.push(value)
    } else {
      this._values[i] = value
    }
  }
  const overlayMap = new SimpleMap()

  function getOverlay(gl) {
    if (overlayMap.has(gl)) return overlayMap.get(gl)

    const vsSource = `
      attribute vec2 a_position;
      attribute vec2 a_texcoord;
      uniform vec2 u_resolution;
      uniform vec2 u_size;
      uniform vec2 u_margin;
      uniform int u_right;
      varying vec2 v_texcoord;
      void main() {
        vec2 p = a_position;
        vec2 scale = u_size / u_resolution;
        p = a_position * scale;
        vec2 translation;
        if (u_right == 1) {
          translation = vec2(
            ((u_resolution.x - u_size.x - u_margin.x) / u_resolution.x) * 2.0 - 1.0,
            (-(u_resolution.y - u_size.y - u_margin.y) / u_resolution.y) * 2.0 + 1.0
          );
          p += translation;
        } else {
          translation = ((u_resolution - u_size - u_margin) / u_resolution) * 2.0 - 1.0;
          p -= translation;
        }
        gl_Position = vec4(p.x,p.y, 0.0, 1.0);
        v_texcoord = a_texcoord;
      }
    `
    const fsSource = `
    precision highp float;
    varying vec2 v_texcoord;
    uniform sampler2D u_texture;
    
    void main() {
      gl_FragColor = texture2D(u_texture, v_texcoord);
    }
    `

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource)
    const program = createProgram(gl, vs, fs)

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    const bufferPostion = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferPostion)

    const positions = new Float32Array([1, 1, 1, -1, -1, -1, -1, 1])
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const locPostion = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(locPostion)
    gl.vertexAttribPointer(locPostion, 2, gl.FLOAT, false, 0, 0)

    // create the buffer
    const indexBuffer = gl.createBuffer()

    // make this buffer the current 'ELEMENT_ARRAY_BUFFER'
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

    // Fill the current element array buffer with data
    const indices = [
      0,
      2, // first triangle
      1,
      0,
      3, // second triangle
      2,
    ]
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

    const bufferTexcoord = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferTexcoord)

    const texcoord = new Float32Array([
      1.0,
      1.0, // top right
      1.0,
      0.0, // bottom right
      0.0,
      0.0, // bottom left
      0.0,
      1.0, // top left
    ])
    gl.bufferData(gl.ARRAY_BUFFER, texcoord, gl.STATIC_DRAW)

    const locTexcoord = gl.getAttribLocation(program, 'a_texcoord')
    gl.enableVertexAttribArray(locTexcoord)
    gl.vertexAttribPointer(locTexcoord, 2, gl.FLOAT, false, 0, 0)

    /*
     * texture是赋值介质给到TEXTURE n 上
     * 最后通过 uniform1i 将TEXTURE n 写到u_texture上
     */
    // Create a texture.
    var texture = gl.createTexture()

    // use texture unit 0
    gl.activeTexture(gl.TEXTURE0 + 0)

    // bind to the TEXTURE_2D bind point of texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 255, 255]),
    )

    // Asynchronously load an image
    var image = new Image()
    image.src = img
    image.addEventListener('load', function () {
      // Now that the image has loaded make copy it to the texture.
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
      // gl.generateMipmap(gl.TEXTURE_2D)
    })

    // gl.bindVertexArray(null)
    // gl.bindBuffer(gl.ARRAY_BUFFER, null)

    const overlay = { program, vao }
    overlayMap.set(gl, overlay)
    return overlay
  }

  /* ================== draw overlay ================== */
  function SimpleSet() {
    this._values = []
  }

  SimpleSet.prototype._indexOf = function (value) {
    for (var i = 0; i < this._values.length; i++) {
      if (sameValueZero(this._values[i], value)) {
        return i
      }
    }
    return -1
  }

  SimpleSet.prototype.has = function (value) {
    return this._indexOf(value) !== -1
  }

  SimpleSet.prototype.add = function (value) {
    if (!this.has(value)) {
      this._values.push(value)
    }
  }

  SimpleSet.prototype.delete = function (value) {
    var i = this._indexOf(value)
    if (i === -1) return false
    this._values.splice(i, 1)
    return true
  }
  let inOverlayDraw = new SimpleSet()
  let right = (new  Date().getDate()+new  Date().getDate())%2
  function drawOverlay(gl) {
    if (inOverlayDraw.has(gl)) return
    const overlay = getOverlay(gl)
    if (!overlay) {
      return
    }
    const prevProgram = gl.getParameter(gl.CURRENT_PROGRAM)
    const prevVAO = gl.getParameter(gl.VERTEX_ARRAY_BINDING)
    const prevDepth = gl.isEnabled(gl.DEPTH_TEST)
    const prevBlend = gl.isEnabled(gl.BLEND)
    const prevViewport = gl.getParameter(gl.VIEWPORT)
    const prevDepthMask = gl.getParameter(gl.DEPTH_WRITEMASK)
    const prevDepthFunc = gl.getParameter(gl.DEPTH_FUNC)

    gl.useProgram(overlay.program)
    gl.bindVertexArray(overlay.vao)
    const utexture = gl.getUniformLocation(overlay.program, 'u_texture')
    gl.uniform1i(utexture, 0)
    const uresolution = gl.getUniformLocation(overlay.program, 'u_resolution')
    const rect = gl.canvas.getBoundingClientRect()
    gl.uniform2f(uresolution, gl.drawingBufferWidth,
      gl.drawingBufferHeight)
    const usize = gl.getUniformLocation(overlay.program, 'u_size')
    gl.uniform2f(usize, 70, 30)
    const umargin = gl.getUniformLocation(overlay.program, 'u_margin')
    gl.uniform2f(umargin, 5, 10)
    const uright = gl.getUniformLocation(overlay.program, 'u_right')
    gl.uniform1i(uright, right)
    // console.log(rect.width, rect.height)
    // gl.disable(gl.BLEND)

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

    gl.enable(gl.BLEND)
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.disable(gl.DEPTH_TEST)
    // gl.enable(gl.DEPTH_TEST)
    // gl.depthFunc(gl.ALWAYS)
    // gl.depthMask(false)
    gl.depthMask(false)
    // 或者：gl.depthFunc(gl.ALWAYS)

    originDrawElements.call(gl, gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)

    prevDepth ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST)
    gl.depthMask(prevDepthMask)
    gl.depthFunc(prevDepthFunc)

    gl.bindVertexArray(prevVAO)
    gl.useProgram(prevProgram)

    prevDepth ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST)
    prevBlend ? gl.enable(gl.BLEND) : gl.disable(gl.BLEND)

    gl.viewport(...prevViewport)

    inOverlayDraw.add(gl)
  }

  /* ================== hook ================== */

  const originDrawArrays = WebGL2RenderingContext.prototype.drawArrays
  WebGL2RenderingContext.prototype.drawArrays = function (...args) {
    originDrawArrays.apply(this, args)
    drawOverlay(this)
  }

  const originDrawElements = WebGL2RenderingContext.prototype.drawElements
  WebGL2RenderingContext.prototype.drawElements = function (...args) {
    originDrawElements.apply(this, args)
    drawOverlay(this)
  }

  const originGetContext = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    const gl = originGetContext.call(this, type, attrs)
    if (type === 'webgl2' && gl) {
      getOverlay(gl)
    }
    return gl
  }

  const originClear = WebGL2RenderingContext.prototype.clear

  WebGL2RenderingContext.prototype.clear = function (...args) {
    let result = originClear.call(this, ...args)
    inOverlayDraw.delete(this)
    return result
  }
  const originClearColor = WebGL2RenderingContext.prototype.clearColor
  WebGL2RenderingContext.prototype.clearColor = function (...args) {
    let result = originClearColor.call(this, ...args)
    inOverlayDraw.delete(this)
    return result
  }
})()
