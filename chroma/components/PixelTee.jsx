'use client'

import { useEffect, useRef } from 'react'

const VS = 'attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,1.-(p.y*.5+.5));gl_Position=vec4(p,0.,1.);}'

// The tee as chunky pixels, with a soft lens around the pointer that resolves into the sharp photo.
const FS = [
  'precision mediump float;',
  'varying vec2 v;',
  'uniform sampler2D t;',
  'uniform vec2 m;',
  'uniform float r,cells,time,asp;',
  'float h(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}',
  'void main(){',
  '  vec2 g=vec2(cells,cells/asp);',
  '  vec2 c=floor(v*g);',
  '  vec4 px=texture2D(t,(c+.5)/g);',
  '  float f=(h(c+floor(time*2.))-.5)*.06;',
  '  vec3 col=px.a>.01?px.rgb/px.a:vec3(1.);',
  '  float a=step(.45,px.a);',
  '  px=vec4(clamp(col+f,0.,1.)*a,a);',
  '  vec4 sharp=texture2D(t,v);',
  '  float k=1.-smoothstep(r*.5,r,length((v-m)*vec2(asp,1.)));',
  '  gl_FragColor=mix(px,sharp,k);',
  '}',
].join('\n')

export default function PixelTee({ src, alt }) {
  const img = useRef(null)
  const cv = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = cv.current
    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false })
    if (!gl) return

    const sh = (type, src2) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src2)
      gl.compileShader(s)
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
    }
    const vs = sh(gl.VERTEX_SHADER, VS)
    const fs = sh(gl.FRAGMENT_SHADER, FS)
    if (!vs || !fs) return
    const prog = gl.createProgram()
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const U = (n) => gl.getUniformLocation(prog, n)
    const uM = U('m'), uR = U('r'), uC = U('cells'), uT = U('time'), uA = U('asp')

    let raf = 0
    let alive = true
    let visible = true
    let down = false
    let lastMove = -1e9
    let tx = 0.5, ty = 0.5, mx = 0.5, my = 0.5, r = 0.2
    let asp = 1

    const el = new Image()
    el.onload = () => {
      if (!alive) return
      asp = el.naturalWidth / el.naturalHeight
      const tex = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, el)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      size()
      if (img.current) img.current.style.visibility = 'hidden'
      raf = requestAnimationFrame(frame)
    }
    el.src = src

    const size = () => {
      const w = canvas.clientWidth
      if (!w) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(Math.min(w * dpr, 1400))
      canvas.height = Math.round(canvas.width / asp)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    const ro = new ResizeObserver(size)
    ro.observe(canvas)

    const move = (e) => {
      const b = canvas.getBoundingClientRect()
      if (!b.width) return
      tx = Math.max(-0.25, Math.min(1.25, (e.clientX - b.left) / b.width))
      ty = Math.max(-0.25, Math.min(1.25, (e.clientY - b.top) / b.height))
      lastMove = performance.now()
    }
    const dn = () => { down = true }
    const up = () => { down = false }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', dn, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    window.addEventListener('pointercancel', up, { passive: true })

    const io = new IntersectionObserver((es) => {
      visible = es[0].isIntersecting
    })
    io.observe(canvas)

    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      if (!visible) return
      const t = now / 1000
      const idle = now - lastMove > 3500
      if (idle) {
        // nobody is pointing: the lens wanders across the shirt on its own
        tx = 0.5 + Math.sin(t * 0.55) * 0.3
        ty = 0.46 + Math.sin(t * 0.8 + 1.3) * 0.22
      }
      const goal = down ? 0.5 : idle ? 0.2 : 0.27
      mx += (tx - mx) * 0.1
      my += (ty - my) * 0.1
      r += (goal - r) * 0.08
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform2f(uM, mx, my)
      gl.uniform1f(uR, r)
      gl.uniform1f(uC, 46 + Math.sin(t * 0.6) * 2)
      gl.uniform1f(uT, t)
      gl.uniform1f(uA, asp)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', dn)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      if (img.current) img.current.style.visibility = ''
    }
  }, [src])

  return (
    <div className="pxt">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={img} src={src} alt={alt} />
      <canvas ref={cv} aria-hidden="true" />
    </div>
  )
}
