import { onMount, onCleanup } from "solid-js"

export default () => {
    let cleanup: (() => void) | undefined

    onMount(() => {
        cleanup = setup()
    })

    onCleanup(() => cleanup?.())

    return <canvas id="canvas-shader" class="w-full h-full block bg-black" />
}

const VERTEX_SRC = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPosition;
void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const FRAGMENT_SRC = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uBrightness;

out vec4 fragColor;

// ---------- Hash / gradients ----------

vec2 hashGrad(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

// ---------- Bruit de Perlin 2D ----------
float perlin(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0); // interpolation quintique

    float a = dot(hashGrad(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));
    float b = dot(hashGrad(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
    float c = dot(hashGrad(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
    float d = dot(hashGrad(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// fractal brownian motion : superposition d'octaves pour des formes organiques
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
        value += amplitude * perlin(p);
        p *= 2.02;
        amplitude *= 0.5;
    }
    return value;
}

// distance a un segment -> sert a tracer les traits des glyphes
float segment(vec2 p, vec2 a, vec2 b, float thickness) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return smoothstep(thickness, thickness * 0.4, length(pa - ba * h));
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Rampe ascii procedurale : espace . : + * # @
// p est en espace local de la cellule, centre sur (0,0), taille ~[-0.5, 0.5]
float glyph(int index, vec2 p) {
    float d = 0.0;
    float t = 0.09;

    if (index == 1) {
        // '.'
        d = smoothstep(0.10, 0.0, length(p - vec2(0.0, -0.18)));
    } else if (index == 2) {
        // ':'
        d = smoothstep(0.09, 0.0, length(p - vec2(0.0, 0.16)));
        d += smoothstep(0.09, 0.0, length(p - vec2(0.0, -0.16)));
    } else if (index == 3) {
        // '+'
        d += segment(p, vec2(-0.28, 0.0), vec2(0.28, 0.0), t);
        d += segment(p, vec2(0.0, -0.28), vec2(0.0, 0.28), t);
    } else if (index == 4) {
        // '*'
        d += segment(p, vec2(-0.26, 0.0), vec2(0.26, 0.0), t);
        d += segment(p, vec2(0.0, -0.26), vec2(0.0, 0.26), t);
        d += segment(p, vec2(-0.18, -0.18), vec2(0.18, 0.18), t);
        d += segment(p, vec2(-0.18, 0.18), vec2(0.18, -0.18), t);
    } else if (index == 5) {
        // '#'
        d += segment(p, vec2(-0.3, -0.15), vec2(0.3, -0.15), t);
        d += segment(p, vec2(-0.3, 0.15), vec2(0.3, 0.15), t);
        d += segment(p, vec2(-0.15, -0.3), vec2(-0.15, 0.3), t);
        d += segment(p, vec2(0.15, -0.3), vec2(0.15, 0.3), t);
    } else if (index == 6) {
        // '@' -> anneau + point central
        float ring = abs(length(p) - 0.26);
        d += smoothstep(t, t * 0.3, ring);
        d += smoothstep(0.07, 0.0, length(p));
    }

    return clamp(d, 0.0, 1.0);
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;

    float cellSize = 22.0; // taille d'une cellule en pixels
    vec2 gridPos = fragCoord / cellSize;
    vec2 cellId = floor(gridPos);
    vec2 localUv = fract(gridPos) - 0.5;

    // le champ de bruit s'ecoule dans le temps -> genere des formes vivantes
    vec2 flow = vec2(uTime * 0.10, -uTime * 0.06);
    float n = fbm(cellId * 0.045 + flow);
    n = n * 0.5 + 0.5; // normalisation approximative vers [0, 1]

    // seconde couche, plus fine, pour texturer l'interieur des formes
    float detail = fbm(cellId * 0.12 - flow * 1.5) * 0.5 + 0.5;

    // les zones ou le bruit depasse un seuil deviennent des formes pleines,
    // avec des bords doux plutot qu'un simple pochoir binaire
    float brightness = smoothstep(0.32, 0.78, n) * mix(0.6, 1.0, detail);

    // rampe ascii : plus une forme est "dense", plus le glyph est charge
    int index = 0;
    if (brightness > 0.85) index = 6;
    else if (brightness > 0.68) index = 5;
    else if (brightness > 0.52) index = 4;
    else if (brightness > 0.36) index = 3;
    else if (brightness > 0.20) index = 2;
    else if (brightness > 0.08) index = 1;

    float g = glyph(index, localUv);

    // degrade de couleurs vives : la teinte glisse avec le bruit, le temps
    // et la position, pour un arc-en-ciel qui coule a travers les formes
    float hue = fract(n * 0.8 + uTime * 0.04 + cellId.x * 0.0025 + cellId.y * 0.002);
    vec3 color = hsv2rgb(vec3(hue, 0.85, 1.0));

    vec3 finalColor = color * g * (0.55 + brightness * 0.75) * uBrightness;

    fragColor = vec4(finalColor, 1.0);
}
`

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader)
        gl.deleteShader(shader)
        throw new Error("Erreur de compilation du shader: " + info)
    }
    return shader
}

function createProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string) {
    const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource)
    const program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program)
        throw new Error("Erreur de link du programme: " + info)
    }
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    return program
}

// Luminosité globale du rendu (0 = noir, 1 = luminosité normale, >1 = surexposé)
let brightness = 0.15

export function setBrightness(value: number) {
    brightness = value
}

function setup() {
    const canvas = document.getElementById('canvas-shader') as HTMLCanvasElement
    const gl = canvas.getContext('webgl2')
    if (!gl) {
        console.error("WebGL2 non supporté")
        return
    }

    const program = createProgram(gl, VERTEX_SRC, FRAGMENT_SRC)
    gl.useProgram(program)

    // Quad plein écran (2 triangles)
    const vertices = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
    ])

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

    const uResolution = gl.getUniformLocation(program, "uResolution")
    const uTime = gl.getUniformLocation(program, "uTime")
    const uBrightness = gl.getUniformLocation(program, "uBrightness")

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const width = Math.max(1, Math.floor(canvas.clientWidth * dpr))
        const height = Math.max(1, Math.floor(canvas.clientHeight * dpr))
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width
            canvas.height = height
            gl!.viewport(0, 0, width, height)
        }
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    resize()

    const start = performance.now()
    let rafId = 0

    function frame() {
        resize()
        const time = (performance.now() - start) / 1000

        gl!.uniform2f(uResolution, canvas.width, canvas.height)
        gl!.uniform1f(uTime, time)
        gl!.uniform1f(uBrightness, brightness)

        gl!.clearColor(0.0, 0.0, 0.02, 1.0)
        gl!.clear(gl!.COLOR_BUFFER_BIT)

        gl!.bindVertexArray(vao)
        gl!.drawArrays(gl!.TRIANGLES, 0, 6)

        rafId = requestAnimationFrame(frame)
    }

    rafId = requestAnimationFrame(frame)

    return () => {
        cancelAnimationFrame(rafId)
        resizeObserver.disconnect()
        gl!.deleteProgram(program)
        gl!.deleteBuffer(buffer)
        gl!.deleteVertexArray(vao)
    }
}