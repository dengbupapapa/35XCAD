;(() => {
  /**************************************
   * 1. hook getContext
   **************************************/
  const originGetContext = HTMLCanvasElement.prototype.getContext

  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    const gl = originGetContext.call(this, type, attrs)
    if (!gl) return gl

    if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
      hookWebGL(gl)
    }

    return gl
  }

  /**************************************
   * 2. hook WebGL
   **************************************/
  function hookWebGL(gl) {
    if (gl.__wm_hooked) return
    gl.__wm_hooked = true

    // 保存原始方法
    gl.__wm_drawArrays = gl.drawArrays
    gl.__wm_drawElements = gl.drawElements
    gl.__wm_clear = gl.clear

    gl.__wm_frameDrawn = false

    // hook clear：一帧开始
    gl.clear = function (mask) {
      gl.__wm_frameDrawn = false
      gl.__wm_clear.call(this, mask)
    }

    // hook drawArrays
    gl.drawArrays = function (...args) {
      gl.__wm_drawArrays.apply(this, args)
      tryDrawWatermark(gl)
    }

    // hook drawElements
    gl.drawElements = function (...args) {
      gl.__wm_drawElements.apply(this, args)
      tryDrawWatermark(gl)
    }
  }

  /**************************************
   * 3. 只画一次水印
   **************************************/
  function tryDrawWatermark(gl) {
    if (gl.__wm_frameDrawn) return
    gl.__wm_frameDrawn = true
    drawWatermark(gl)
  }

  /**************************************
   * 4. draw watermark
   **************************************/
  function drawWatermark(gl) {
    if (gl.__wm_drawing) return
    gl.__wm_drawing = true

    if (!gl.__wm_program) {
      gl.__wm_program = createWatermarkProgram(gl)
    }

    const wm = gl.__wm_program

    // === 保存 WebGL 状态（最小集）===
    const lastProgram = gl.getParameter(gl.CURRENT_PROGRAM)
    const lastArrayBuffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING)
    const lastBlend = gl.isEnabled(gl.BLEND)

    gl.useProgram(wm.program)

    gl.bindBuffer(gl.ARRAY_BUFFER, wm.buffer)
    gl.enableVertexAttribArray(wm.positionLoc)
    gl.vertexAttribPointer(wm.positionLoc, 2, gl.FLOAT, false, 0, 0)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    // ⚠️ 使用原始 drawArrays（避免递归）
    gl.__wm_drawArrays.call(gl, gl.TRIANGLE_STRIP, 0, 4)

    // === 恢复状态 ===
    gl.disableVertexAttribArray(wm.positionLoc)
    gl.bindBuffer(gl.ARRAY_BUFFER, lastArrayBuffer)
    gl.useProgram(lastProgram)
    if (!lastBlend) gl.disable(gl.BLEND)

    gl.__wm_drawing = false
  }

  /**************************************
   * 5. watermark program
   **************************************/
  function createWatermarkProgram(gl) {
    const vertexSrc = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `

    const fragmentSrc = `
      precision mediump float;
      varying vec2 vUv;

      float pattern(vec2 uv) {
        uv *= 10.0;
        vec2 f = fract(uv);
        return step(0.95, f.x) * step(0.95, f.y);
      }

      void main() {
        float a = pattern(vUv) * 0.15;
        gl_FragColor = vec4(1.0, 1.0, 1.0, a);
      }
    `

    const vs = compileShader(gl, gl.VERTEX_SHADER, vertexSrc)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc)
    const program = linkProgram(gl, vs, fs)

    const positionLoc = gl.getAttribLocation(program, 'position')

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    return {
      program,
      buffer,
      positionLoc,
    }
  }

  /**************************************
   * 6. shader utils
   **************************************/
  function compileShader(gl, type, src) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, src)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      throw new Error('shader compile failed')
    }
    return shader
  }

  function linkProgram(gl, vs, fs) {
    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      throw new Error('program link failed')
    }
    return program
  }
})()
