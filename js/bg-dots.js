/* ============================================================
   Glistening Circuitry  -  background dot matrix
   A direct vanilla port of the 21st "dot grid" WebGL shader:
   dots light up in a wave from the center, then keep shimmering.
   Phosphor-green tint to match the terminal theme.
   Pure WebGL2  -  no dependencies.
   ============================================================ */

(function () {
  "use strict";

  var canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  var gl = canvas.getContext("webgl2");
  if (!gl) return;

  var reduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function compile(type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      if (window.console) console.warn("bg-dots shader:", gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  var VERT = "#version 300 es\n" +
    "precision mediump float;\n" +
    "layout(location = 0) in vec2 aPos;\n" +
    "uniform vec2 u_resolution;\n" +
    "out vec2 fragCoord;\n" +
    "void main() {\n" +
    "  gl_Position = vec4(aPos, 0.0, 1.0);\n" +
    "  fragCoord = (aPos + 1.0) * 0.5 * u_resolution;\n" +
    "  fragCoord.y = u_resolution.y - fragCoord.y;\n" +
    "}\n";

  var FRAG = "#version 300 es\n" +
    "precision mediump float;\n" +
    "in vec2 fragCoord;\n" +
    "uniform float u_time;\n" +
    "uniform float u_opacities[10];\n" +
    "uniform vec3 u_colors[6];\n" +
    "uniform float u_total_size;\n" +
    "uniform float u_dot_size;\n" +
    "uniform vec2 u_resolution;\n" +
    "out vec4 fragColor;\n" +
    "\n" +
    "float PHI = 1.61803398874989484820459;\n" +
    "float random(vec2 xy) {\n" +
    "  return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);\n" +
    "}\n" +
    "\n" +
    "void main() {\n" +
    "  vec2 st = fragCoord.xy;\n" +
    "  st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));\n" +
    "  st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));\n" +
    "\n" +
    "  float opacity = step(0.0, st.x) * step(0.0, st.y);\n" +
    "\n" +
    "  vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));\n" +
    "\n" +
    "  float frequency = 5.0;\n" +
    "  float show_offset = random(st2);\n" +
    "  float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));\n" +
    "  opacity *= u_opacities[int(rand * 10.0)];\n" +
    "  opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));\n" +
    "  opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));\n" +
    "\n" +
    "  vec3 color = u_colors[int(show_offset * 6.0)];\n" +
    "\n" +
    "  float animation_speed_factor = 3.0;\n" +
    "  vec2 center_grid = u_resolution / 2.0 / u_total_size;\n" +
    "  float dist_from_center = distance(center_grid, st2);\n" +
    "\n" +
    "  float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);\n" +
    "\n" +
    "  float current_timing_offset = timing_offset_intro;\n" +
    "  opacity *= step(current_timing_offset, u_time * animation_speed_factor);\n" +
    "  opacity *= clamp((1.0 - step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);\n" +
    "\n" +
    "  fragColor = vec4(color, opacity);\n" +
    "  fragColor.rgb *= fragColor.a;\n" +
    "}\n";

  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    if (window.console) console.warn("bg-dots link:", gl.getProgramInfoLog(prog));
    return;
  }
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  var aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  gl.uniform1fv(gl.getUniformLocation(prog, "u_opacities"),
    new Float32Array([0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1.0]));
  /* phosphor-green palette (matches site accents) */
  gl.uniform3fv(gl.getUniformLocation(prog, "u_colors"),
    new Float32Array([
      0.20, 1.00, 0.40,  // #33ff66
      0.49, 1.00, 0.63,  // #7dffa0
      0.72, 1.00, 0.24,  // #b8ff3d
      0.22, 0.64, 0.37,  // #37a35f
      0.86, 1.00, 0.90,  // #dcffe5
      0.10, 0.48, 0.23   // #1a7a3a
    ]));
  gl.uniform1f(gl.getUniformLocation(prog, "u_total_size"), 20.0);
  gl.uniform1f(gl.getUniformLocation(prog, "u_dot_size"), 6.0);

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.clearColor(0, 0, 0, 0);

  function resize() {
    var w = canvas.clientWidth || 1;
    var h = canvas.clientHeight || 1;
    var dpr = window.devicePixelRatio || 1;
    var bw = Math.max(1, Math.round(w * dpr));
    var bh = Math.max(1, Math.round(h * dpr));
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    gl.viewport(0, 0, bw, bh);
    gl.uniform2f(gl.getUniformLocation(prog, "u_resolution"), w * 2, h * 2);
  }
  window.addEventListener("resize", resize);
  resize();

  var t0 = performance.now();
  function frame() {
    gl.uniform1f(gl.getUniformLocation(prog, "u_time"),
      (performance.now() - t0) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  }

  if (reduced) {
    /* static frame  -  wave already propagated */
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(gl.getUniformLocation(prog, "u_time"), 20.0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  } else {
    frame();
  }
})();
