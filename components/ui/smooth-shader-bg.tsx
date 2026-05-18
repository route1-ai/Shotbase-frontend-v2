"use client"

import { useEffect, useRef } from "react"

/**
 * Smooth flowing gradient background shader — inspired by the organic
 * pastel-gradient hero backgrounds. Uses a lightweight WebGL shader with
 * soft colour blobs that drift and morph over time, adapted for a dark theme.
 */
export function SmoothShaderBg({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false })
    if (!gl) return

    /* — Shaders — */
    const vs = `
      attribute vec2 a_position;
      void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
    `

    const fs = `
      precision highp float;
      uniform float u_time;
      uniform vec2  u_resolution;

      // Smooth noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                                + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                                 dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x_ = 2.0*fract(p * C.www) - 1.0;
        vec3 h  = abs(x_) - 0.5;
        vec3 ox = floor(x_ + 0.5);
        vec3 a0 = x_ - ox;
        m *= 1.79284291400159 - 0.85373472095314*(a0*a0 + h*h);
        vec3 g;
        g.x = a0.x*x0.x  + h.x*x0.y;
        g.yz = a0.yz*x12.xz + h.yz*x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time * 0.12;

        // Large, slow-moving noise layers for organic flowing blobs
        float n1 = snoise(uv * 1.2 + vec2(t * 0.5, t * 0.3));
        float n2 = snoise(uv * 1.8 + vec2(-t * 0.3, t * 0.6));
        float n3 = snoise(uv * 0.8 + vec2(t * 0.2, -t * 0.4));
        float n4 = snoise(uv * 2.5 + vec2(t * 0.4, t * 0.2));

        // Soft colour palette — brand-aligned
        vec3 c1 = vec3(0.0, 0.91, 0.48);   // #00e87b — brand green
        vec3 c2 = vec3(0.2, 0.85, 0.7);    // Teal / seafoam
        vec3 c3 = vec3(0.35, 0.25, 0.75);  // Deep purple
        vec3 c4 = vec3(0.1, 0.5, 0.55);    // Dark teal
        vec3 c5 = vec3(0.0, 0.6, 0.4);     // Emerald

        // Blend colours based on noise
        float blend1 = smoothstep(-0.6, 0.6, n1);
        float blend2 = smoothstep(-0.4, 0.5, n2);
        float blend3 = smoothstep(-0.5, 0.5, n3);
        float blend4 = smoothstep(-0.3, 0.6, n4);

        vec3 color = mix(c1, c2, blend1);
        color = mix(color, c3, blend2 * 0.4);
        color = mix(color, c4, blend3 * 0.5);
        color = mix(color, c5, blend4 * 0.3);

        // Soft vignette — gentle, not tight
        float vignette = 1.0 - length((uv - 0.5) * 1.0);
        vignette = smoothstep(-0.1, 0.8, vignette);

        // Make the blobs clearly visible
        float blobShape = 0.5 + 0.5 * sin(n1 * 3.14159);
        float alpha = 0.65 * vignette * blobShape;
        // Additional glow from secondary noise
        alpha += 0.15 * smoothstep(-0.2, 0.5, n2) * vignette;
        alpha = clamp(alpha, 0.0, 0.85);

        gl_FragColor = vec4(color, alpha);
      }
    `

    /* — Compile helpers — */
    function createShader(type: number, src: string) {
      const s = gl!.createShader(type)!
      gl!.shaderSource(s, src)
      gl!.compileShader(s)
      return s
    }

    const prog = gl.createProgram()!
    gl.attachShader(prog, createShader(gl.VERTEX_SHADER, vs))
    gl.attachShader(prog, createShader(gl.FRAGMENT_SHADER, fs))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    /* — Geometry: full-screen quad — */
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1,  -1, 1,
       1, -1,  1,  1,  -1, 1,
    ]), gl.STATIC_DRAW)

    const aPos = gl.getAttribLocation(prog, "a_position")
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, "u_time")
    const uRes  = gl.getUniformLocation(prog, "u_resolution")

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    /* — Resize — */
    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas!.width  = canvas!.clientWidth  * dpr
      canvas!.height = canvas!.clientHeight * dpr
      gl!.viewport(0, 0, canvas!.width, canvas!.height)
    }
    resize()
    window.addEventListener("resize", resize)

    /* — Render loop — */
    let raf = 0
    const t0 = performance.now()
    function frame() {
      const t = (performance.now() - t0) / 1000
      gl!.clearColor(0, 0, 0, 0)
      gl!.clear(gl!.COLOR_BUFFER_BIT)
      gl!.uniform1f(uTime, t)
      gl!.uniform2f(uRes, canvas!.width, canvas!.height)
      gl!.drawArrays(gl!.TRIANGLES, 0, 6)
      raf = requestAnimationFrame(frame)
    }
    frame()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      gl.deleteProgram(prog)
      gl.deleteBuffer(buf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: "none" }}
    />
  )
}
