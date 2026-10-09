import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

import { crearMercado } from './mercado.js';
import { crearInteracciones } from './interacciones.js';
import { crearSeguridad } from './seguridad.js';

// ============================================================
// SUPERMERCADO 3D
// Escena principal, movimiento, interfaz y vigilancia
// ============================================================

// ------------------------------------------------------------
// ESCENA
// ------------------------------------------------------------

const scene = new THREE.Scene();

const colorDia = 0x9ec9e8;
const colorNoche = 0x101a30;

scene.background = new THREE.Color(colorDia);
scene.fog = new THREE.Fog(colorDia, 75, 230);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    500
);

camera.position.set(0, 1.7, 45);
camera.rotation.order = 'YXZ';

// ------------------------------------------------------------
// RENDERIZADOR
// ------------------------------------------------------------

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
});

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.style.fontFamily = 'Arial, sans-serif';
document.body.style.background = '#101a30';

document.body.appendChild(renderer.domElement);

renderer.domElement.style.display = 'block';
renderer.domElement.style.outline = 'none';

// ------------------------------------------------------------
// CONTROLES EN PRIMERA PERSONA
// ------------------------------------------------------------

const controls = new PointerLockControls(
    camera,
    renderer.domElement
);

const jugador = {
    altura: 1.7,
    velocidad: 7,
    velocidadCorrer: 12
};

camera.position.y = jugador.altura;

// ------------------------------------------------------------
// VARIABLES GENERALES
// ------------------------------------------------------------

let nightMode = false;
let cameraMode = false;
let activeCamera = 0;
let velocidadActual = jugador.velocidad;

const teclas = {};
const reloj = new THREE.Clock();

const vectorMovimiento = new THREE.Vector3();

let posicionJugadorGuardada = new THREE.Vector3();
let quaternionJugadorGuardado = new THREE.Quaternion();
let jugadorGuardado = false;

// ------------------------------------------------------------
// MATERIALES
// ------------------------------------------------------------

const materiales = {
    suelo: new THREE.MeshStandardMaterial({
        color: 0x84917d,
        roughness: 1
    }),

    carretera: new THREE.MeshStandardMaterial({
        color: 0x34383c,
        roughness: 0.95
    }),

    banqueta: new THREE.MeshStandardMaterial({
        color: 0xb8b8b2,
        roughness: 0.9
    }),

    linea: new THREE.MeshStandardMaterial({
        color: 0xf5f1df,
        roughness: 0.8
    }),

    amarillo: new THREE.MeshStandardMaterial({
        color: 0xffd42a,
        roughness: 0.8
    }),

    metal: new THREE.MeshStandardMaterial({
        color: 0x697680,
        metalness: 0.65,
        roughness: 0.35
    }),

    camara: new THREE.MeshStandardMaterial({
        color: 0x252d35,
        metalness: 0.4,
        roughness: 0.4
    }),

    lente: new THREE.MeshStandardMaterial({
        color: 0x168ee8,
        metalness: 0.7,
        roughness: 0.2,
        emissive: 0x062b52
    })
};

// ------------------------------------------------------------
// FUNCIONES GEOMÉTRICAS
// ------------------------------------------------------------

function crearCaja(
    nombre,
    posicion,
    escala,
    material,
    sombras = true
) {
    const geometria = new THREE.BoxGeometry(
        escala[0],
        escala[1],
        escala[2]
    );

    const objeto = new THREE.Mesh(
        geometria,
        material
    );

    objeto.name = nombre;

    objeto.position.set(
        posicion[0],
        posicion[1],
        posicion[2]
    );

    objeto.castShadow = sombras;
    objeto.receiveShadow = true;

    scene.add(objeto);

    return objeto;
}

function crearCilindro(
    nombre,
    posicion,
    radioSuperior,
    radioInferior,
    altura,
    material
) {
    const geometria = new THREE.CylinderGeometry(
        radioSuperior,
        radioInferior,
        altura,
        16
    );

    const objeto = new THREE.Mesh(
        geometria,
        material
    );

    objeto.name = nombre;

    objeto.position.set(
        posicion[0],
        posicion[1],
        posicion[2]
    );

    objeto.castShadow = true;
    objeto.receiveShadow = true;

    scene.add(objeto);

    return objeto;
}

// ------------------------------------------------------------
// SUELO GENERAL
// ------------------------------------------------------------

crearCaja(
    'Terreno_General',
    [0, -0.35, 0],
    [240, 0.5, 240],
    materiales.suelo,
    false
);

// ------------------------------------------------------------
// CARRETERAS
// ------------------------------------------------------------

crearCaja(
    'Carretera_Frontal',
    [0, -0.06, 58],
    [180, 0.12, 16],
    materiales.carretera,
    false
);

crearCaja(
    'Carretera_Lateral_Derecha',
    [72, -0.06, 8],
    [16, 0.12, 100],
    materiales.carretera,
    false
);

crearCaja(
    'Carretera_Lateral_Izquierda',
    [-72, -0.06, 8],
    [16, 0.12, 100],
    materiales.carretera,
    false
);

crearCaja(
    'Banqueta_Frontal',
    [0, 0.02, 48.8],
    [180, 0.22, 2],
    materiales.banqueta
);

crearCaja(
    'Banqueta_Derecha',
    [63.2, 0.02, 8],
    [2, 0.22, 100],
    materiales.banqueta
);

crearCaja(
    'Banqueta_Izquierda',
    [-63.2, 0.02, 8],
    [2, 0.22, 100],
    materiales.banqueta
);

// Líneas centrales de la carretera frontal.

for (let x = -82; x <= 82; x += 9) {
    crearCaja(
        `Linea_Carretera_${x}`,
        [x, 0.015, 58],
        [4.2, 0.025, 0.16],
        materiales.linea,
        false
    );
}

// ------------------------------------------------------------
// ESTACIONAMIENTO
// ------------------------------------------------------------

crearCaja(
    'Zona_Estacionamiento',
    [0, -0.05, 34],
    [76, 0.12, 22],
    materiales.carretera,
    false
);

for (let x = -34; x <= 34; x += 4.5) {
    crearCaja(
        `Linea_Cajon_${x}`,
        [x, 0.025, 34],
        [0.12, 0.035, 9],
        materiales.linea,
        false
    );
}

crearCaja(
    'Borde_Estacionamiento',
    [0, 0.025, 23],
    [76, 0.12, 0.16],
    materiales.amarillo,
    false
);

// ------------------------------------------------------------
// ILUMINACIÓN
// ------------------------------------------------------------

const luzAmbiente = new THREE.HemisphereLight(
    0xe0efff,
    0x66705b,
    1.5
);

scene.add(luzAmbiente);

const luzSol = new THREE.DirectionalLight(
    0xfff0d5,
    2.2
);

luzSol.position.set(35, 65, 25);
luzSol.castShadow = true;

luzSol.shadow.mapSize.width = 2048;
luzSol.shadow.mapSize.height = 2048;

luzSol.shadow.camera.left = -100;
luzSol.shadow.camera.right = 100;
luzSol.shadow.camera.top = 100;
luzSol.shadow.camera.bottom = -100;

scene.add(luzSol);

// ------------------------------------------------------------
// FAROLAS
// ------------------------------------------------------------

function crearFarola(x, z) {
    const grupo = new THREE.Group();

    const poste = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.12,
            0.18,
            6,
            12
        ),
        materiales.metal
    );

    poste.position.y = 3;
    grupo.add(poste);

    const brazo = new THREE.Mesh(
        new THREE.BoxGeometry(
            1.4,
            0.12,
            0.12
        ),
        materiales.metal
    );

    brazo.position.set(0.6, 5.8, 0);
    grupo.add(brazo);

    const pantalla = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.8,
            0.16,
            0.55
        ),
        materiales.metal
    );

    pantalla.position.set(1.1, 5.7, 0);
    grupo.add(pantalla);

    const focoMaterial = new THREE.MeshStandardMaterial({
        color: 0xffedbd,
        emissive: 0xffd477,
        emissiveIntensity: 0.3
    });

    const foco = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.6,
            0.06,
            0.4
        ),
        focoMaterial
    );

    foco.position.set(1.1, 5.6, 0);
    grupo.add(foco);

    grupo.position.set(x, 0, z);

    grupo.traverse(objeto => {
        if (objeto.isMesh) {
            objeto.castShadow = true;
            objeto.receiveShadow = true;
        }
    });

    scene.add(grupo);

    const luz = new THREE.PointLight(
        0xffdca0,
        0,
        22
    );

    luz.position.set(
        x + 1.1,
        5.4,
        z
    );

    scene.add(luz);

    return {
        grupo,
        luz,
        focoMaterial
    };
}

const farolas = [
    crearFarola(-35, 52),
    crearFarola(-12, 52),
    crearFarola(12, 52),
    crearFarola(35, 52),
    crearFarola(-61, 25),
    crearFarola(61, 25),
    crearFarola(-61, -10),
    crearFarola(61, -10)
];

// ------------------------------------------------------------
// CÁMARAS DE SEGURIDAD 3D
// ------------------------------------------------------------

function crearCamaraModelo(
    x,
    y,
    z,
    rotacionY = 0
) {
    const grupo = new THREE.Group();

    const soporte = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.16,
            0.6,
            0.16
        ),
        materiales.metal
    );

    soporte.position.y = 0.3;
    grupo.add(soporte);

    const cuerpo = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.65,
            0.32,
            0.38
        ),
        materiales.camara
    );

    cuerpo.position.set(
        0,
        0.65,
        -0.12
    );

    grupo.add(cuerpo);

    const lente = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.105,
            0.105,
            0.1,
            16
        ),
        materiales.lente
    );

    lente.rotation.x = Math.PI / 2;

    lente.position.set(
        0,
        0.65,
        -0.36
    );

    grupo.add(lente);

    grupo.position.set(x, y, z);
    grupo.rotation.y = rotacionY;

    grupo.traverse(objeto => {
        if (objeto.isMesh) {
            objeto.castShadow = true;
            objeto.receiveShadow = true;
        }
    });

    scene.add(grupo);

    return grupo;
}

// Se conservan las seis cámaras originales.

crearCamaraModelo(0, 5.8, 20);
crearCamaraModelo(30, 5.8, 15, -Math.PI / 2);
crearCamaraModelo(-32, 5.8, -8, Math.PI / 2);
crearCamaraModelo(27, 5.8, -23, -Math.PI / 2);
crearCamaraModelo(0, 5.8, -26);
crearCamaraModelo(0, 5.8, 52, Math.PI);

// ------------------------------------------------------------
// VISTAS DE LAS CÁMARAS VIRTUALES
// ------------------------------------------------------------

const cameraViews = [
    {
        position: [0, 7, 20],
        target: [0, 1.8, 0]
    },
    {
        position: [30, 7, 15],
        target: [0, 1.8, 15]
    },
    {
        position: [-32, 7, -8],
        target: [-10, 1.8, -10]
    },
    {
        position: [27, 7, -23],
        target: [25, 1.8, -27]
    },
    {
        position: [0, 7, -26],
        target: [0, 1.8, -10]
    },
    {
        position: [0, 7, 52],
        target: [0, 1.8, 30]
    }
];

// ------------------------------------------------------------
// SUPERMERCADO Y MÓDULOS EXISTENTES
// ------------------------------------------------------------

// No se crean carros adicionales desde main.js.

const mercado = crearMercado(
    scene,
    THREE
);

const interacciones = crearInteracciones({
    THREE,
    scene,
    camera,
    renderer,
    controls,
    mercado
});

// ------------------------------------------------------------
// ESTILOS DE LA INTERFAZ
// ------------------------------------------------------------

const uiStyle = document.createElement('style');

uiStyle.textContent = `
    * {
        box-sizing: border-box;
    }

    #hud-principal {
        position: fixed;
        top: 18px;
        left: 18px;
        width: 285px;
        padding: 16px 18px;
        color: #f7fafc;
        background: rgba(11, 20, 30, 0.90);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 15px;
        box-shadow: 0 8px 28px rgba(0,0,0,0.25);
        backdrop-filter: blur(12px);
        z-index: 100;
        pointer-events: none;
        font-size: 13px;
        line-height: 1.9;
    }

    #hud-principal .titulo {
        font-size: 16px;
        font-weight: 800;
        letter-spacing: 1px;
        margin-bottom: 6px;
    }

    #hud-principal .estado {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 3px;
    }

    #hud-principal .punto {
        width: 8px;
        height: 8px;
        flex: 0 0 8px;
        background: #35df91;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(53,223,145,0.65);
    }

    #hud-principal .separador {
        height: 1px;
        margin: 8px 0;
        background: rgba(255,255,255,0.12);
    }

    #hud-controles {
        position: fixed;
        bottom: 18px;
        left: 18px;
        max-width: calc(100vw - 36px);
        padding: 12px 15px;
        color: #f7fafc;
        background: rgba(11, 20, 30, 0.86);
        border: 1px solid rgba(255,255,255,0.13);
        border-radius: 12px;
        backdrop-filter: blur(10px);
        z-index: 100;
        font-size: 12px;
        line-height: 1.9;
        pointer-events: none;
    }

    #hud-controles .tecla {
        display: inline-block;
        min-width: 23px;
        margin-right: 3px;
        padding: 1px 5px;
        text-align: center;
        background: rgba(255,255,255,0.12);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 5px;
        font-weight: bold;
    }

    #mensaje-inicio {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: rgba(4, 10, 18, 0.72);
        backdrop-filter: blur(6px);
        z-index: 500;
        cursor: pointer;
    }

    #mensaje-inicio .tarjeta {
        width: min(490px, 100%);
        padding: 32px;
        color: white;
        background: linear-gradient(
            145deg,
            rgba(24, 38, 53, 0.98),
            rgba(9, 17, 27, 0.98)
        );
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 20px;
        box-shadow: 0 24px 80px rgba(0,0,0,0.4);
        text-align: center;
    }

    #mensaje-inicio .icono {
        font-size: 42px;
        margin-bottom: 10px;
    }

    #mensaje-inicio h1 {
        margin: 0 0 10px;
        font-size: clamp(23px, 5vw, 32px);
        letter-spacing: 1px;
    }

    #mensaje-inicio p {
        color: #bdc9d7;
        line-height: 1.7;
        font-size: 14px;
    }

    #mensaje-inicio .boton-inicio {
        margin-top: 15px;
        padding: 13px 24px;
        color: #07150f;
        background: #52e5a0;
        border: none;
        border-radius: 10px;
        font-weight: 800;
        font-size: 14px;
        cursor: pointer;
        transition: background 0.2s, transform 0.2s;
    }

    #mensaje-inicio .boton-inicio:hover {
        background: #8af3bf;
        transform: translateY(-2px);
    }

    #mensaje-inicio .nota {
        font-size: 12px;
        margin-bottom: 0;
    }

    @media (max-width: 600px) {
        #hud-principal {
            top: 10px;
            left: 10px;
            width: 230px;
            padding: 10px 12px;
            font-size: 11px;
        }

        #hud-controles {
            left: 10px;
            bottom: 10px;
            font-size: 11px;
        }

        #mensaje-inicio .tarjeta {
            padding: 23px;
        }
    }
`;

document.head.appendChild(uiStyle);

// ------------------------------------------------------------
// HUD PRINCIPAL
// ------------------------------------------------------------

const hud = document.createElement('div');

hud.id = 'hud-principal';

document.body.appendChild(hud);

// ------------------------------------------------------------
// HUD DE CONTROLES
// ------------------------------------------------------------

const controlesHUD = document.createElement('div');

controlesHUD.id = 'hud-controles';

controlesHUD.innerHTML = `
    <div>
        <span class="tecla">W</span>
        <span class="tecla">A</span>
        <span class="tecla">S</span>
        <span class="tecla">D</span>
        Moverse
    </div>

    <div>
        <span class="tecla">SHIFT</span> Correr
        &nbsp;
        <span class="tecla">E</span> Interactuar
    </div>

    <div>
        <span class="tecla">N</span> Día/noche
        &nbsp;
        <span class="tecla">ESPACIO</span> Cámaras
    </div>

    <div>
        <span class="tecla">1-6</span> Seleccionar cámara
    </div>

    <div>
        <span class="tecla">ESC</span> Liberar el cursor
    </div>
`;

document.body.appendChild(controlesHUD);

// ------------------------------------------------------------
// MENSAJE DE INICIO
// ------------------------------------------------------------

const startMessage = document.createElement('div');

startMessage.id = 'mensaje-inicio';

startMessage.innerHTML = `
    <div class="tarjeta">
        <div class="icono">🏬</div>

        <h1>SUPERMERCADO 3D</h1>

        <p>
            Entorno virtual interactivo con exploración,
            productos y sistema de vigilancia.
        </p>

        <p>
            Explora el establecimiento, interactúa con
            los productos y accede a las cámaras de seguridad.
        </p>

        <button class="boton-inicio">
            ENTRAR AL SUPERMERCADO
        </button>

        <p class="nota">
            Haz clic para comenzar
        </p>
    </div>
`;

document.body.appendChild(startMessage);

// ------------------------------------------------------------
// ACTUALIZAR HUD
// ------------------------------------------------------------

function updateHUD() {
    const modeText = cameraMode
        ? `VIGILANCIA · Cámara ${activeCamera + 1}`
        : 'EXPLORACIÓN';

    const timeText = nightMode
        ? 'NOCHE'
        : 'DÍA';

    hud.innerHTML = `
        <div class="titulo">SUPERMERCADO 3D</div>

        <div class="estado">
            <span class="punto"></span>
            <span>Sistema activo</span>
        </div>

        <div class="separador"></div>

        <div>Modo: <strong>${modeText}</strong></div>

        <div>Iluminación: <strong>${timeText}</strong></div>

        <div>
            Cámaras disponibles:
            <strong>${cameraViews.length}</strong>
        </div>
    `;

    farolas.forEach(farola => {
        farola.luz.intensity = nightMode ? 2.2 : 0;

        farola.focoMaterial.emissiveIntensity =
            nightMode ? 2 : 0.3;
    });
}

// ------------------------------------------------------------
// CAMBIAR DÍA Y NOCHE
// ------------------------------------------------------------

function toggleDayNight() {
    nightMode = !nightMode;

    if (nightMode) {
        scene.background.setHex(colorNoche);
        scene.fog.color.setHex(colorNoche);

        luzAmbiente.intensity = 0.35;
        luzSol.intensity = 0.15;

        renderer.toneMappingExposure = 0.8;
    } else {
        scene.background.setHex(colorDia);
        scene.fog.color.setHex(colorDia);

        luzAmbiente.intensity = 1.5;
        luzSol.intensity = 2.2;

        renderer.toneMappingExposure = 1.05;
    }

    updateHUD();
}

// ------------------------------------------------------------
// ACTIVAR UNA CÁMARA DE SEGURIDAD
// ------------------------------------------------------------

function activateSecurityCamera(index) {
    if (
        index < 0 ||
        index >= cameraViews.length
    ) {
        return;
    }

    activeCamera = index;

    const vista = cameraViews[index];

    camera.position.set(
        vista.position[0],
        vista.position[1],
        vista.position[2]
    );

    const direccion = new THREE.Vector3(
        vista.target[0] - vista.position[0],
        vista.target[1] - vista.position[1],
        vista.target[2] - vista.position[2]
    ).normalize();

    camera.rotation.order = 'YXZ';

    camera.rotation.y = Math.atan2(
        -direccion.x,
        -direccion.z
    );

    camera.rotation.x = Math.asin(
        THREE.MathUtils.clamp(
            direccion.y,
            -1,
            1
        )
    );

    camera.rotation.z = 0;

    updateHUD();
}

// ------------------------------------------------------------
// GUARDAR Y RECUPERAR LA POSICIÓN DEL JUGADOR
// ------------------------------------------------------------

function guardarPosicionJugador() {
    posicionJugadorGuardada.copy(camera.position);

    quaternionJugadorGuardado.copy(camera.quaternion);

    jugadorGuardado = true;
}

function restaurarPosicionJugador() {
    if (!jugadorGuardado) {
        camera.position.set(
            0,
            jugador.altura,
            45
        );

        camera.rotation.set(0, 0, 0, 'YXZ');
    } else {
        camera.position.copy(posicionJugadorGuardada);

        camera.quaternion.copy(quaternionJugadorGuardado);
    }

    camera.position.y = jugador.altura;

    camera.rotation.order = 'YXZ';

    jugadorGuardado = false;
}

// ------------------------------------------------------------
// MODO DE CÁMARAS
// ------------------------------------------------------------

function entrarModoCamara(index = activeCamera) {
    if (!cameraMode) {
        guardarPosicionJugador();
    }

    cameraMode = true;

    activateSecurityCamera(index);

    startMessage.style.display = 'none';

    if (!controls.isLocked) {
        controls.lock();
    }

    updateHUD();
}

function salirModoCamara() {
    if (!cameraMode) {
        return;
    }

    cameraMode = false;

    restaurarPosicionJugador();

    updateHUD();
}

function toggleCameraMode() {
    if (cameraMode) {
        salirModoCamara();
    } else {
        entrarModoCamara(activeCamera);
    }
}

// ------------------------------------------------------------
// SISTEMA DE SEGURIDAD
// ------------------------------------------------------------

const seguridad = crearSeguridad({
    scene,
    cameraViews,

    seleccionarCamara: indice => {
        entrarModoCamara(indice);
    }
});

// ------------------------------------------------------------
// EVENTOS DEL MENSAJE DE INICIO
// ------------------------------------------------------------

startMessage.addEventListener('click', () => {
    if (!controls.isLocked) {
        controls.lock();
    }
});

controls.addEventListener('lock', () => {
    startMessage.style.display = 'none';
});

controls.addEventListener('unlock', () => {
    // Si el jugador sale de la vista de vigilancia con ESC,
    // recupera su posición y orientación anteriores.

    if (cameraMode) {
        salirModoCamara();
    }

    // Cuando el cursor se libera, se muestra el inicio.

    startMessage.style.display = 'flex';

    // Evita que las teclas queden activas después de ESC.

    for (const codigo in teclas) {
        teclas[codigo] = false;
    }
});

// ------------------------------------------------------------
// TECLADO
// ------------------------------------------------------------

document.addEventListener('keydown', event => {
    teclas[event.code] = true;

    if (
        [
            'Space',
            'ArrowUp',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight'
        ].includes(event.code)
    ) {
        event.preventDefault();
    }

    if (event.repeat) {
        return;
    }

    // Día y noche.

    if (event.code === 'KeyN') {
        toggleDayNight();
    }

    // Cambiar entre exploración y vigilancia.

    if (event.code === 'Space') {
        toggleCameraMode();
    }

    // Selección de cámaras con números del 1 al 6.

    if (
        event.code.startsWith('Digit') &&
        !event.shiftKey
    ) {
        const numero = Number(
            event.code.replace('Digit', '')
        );

        if (
            numero >= 1 &&
            numero <= cameraViews.length
        ) {
            activeCamera = numero - 1;

            if (cameraMode) {
                activateSecurityCamera(activeCamera);
            }

            updateHUD();
        }
    }

    // Interacción con productos.

    if (event.code === 'KeyE') {
        if (
            !cameraMode &&
            interacciones &&
            typeof interacciones.interactuar === 'function'
        ) {
            interacciones.interactuar();
        }
    }
});

document.addEventListener('keyup', event => {
    teclas[event.code] = false;
});

// ------------------------------------------------------------
// MOVIMIENTO DEL JUGADOR
// ------------------------------------------------------------

function actualizarMovimiento(delta) {
    if (
        !controls.isLocked ||
        cameraMode
    ) {
        return;
    }

    velocidadActual = (
        teclas.ShiftLeft ||
        teclas.ShiftRight
    )
        ? jugador.velocidadCorrer
        : jugador.velocidad;

    let adelante = 0;
    let derecha = 0;

    if (
        teclas.KeyW ||
        teclas.ArrowUp
    ) {
        adelante += 1;
    }

    if (
        teclas.KeyS ||
        teclas.ArrowDown
    ) {
        adelante -= 1;
    }

    if (
        teclas.KeyD ||
        teclas.ArrowRight
    ) {
        derecha += 1;
    }

    if (
        teclas.KeyA ||
        teclas.ArrowLeft
    ) {
        derecha -= 1;
    }

    if (
        adelante === 0 &&
        derecha === 0
    ) {
        return;
    }

    vectorMovimiento.set(
        derecha,
        0,
        adelante
    );

    vectorMovimiento.normalize();

    const longitud = velocidadActual * delta;

    const avance = vectorMovimiento.z * longitud;
    const lateral = vectorMovimiento.x * longitud;

    // Calcula el movimiento según la dirección de la cámara.
    // W avanza hacia donde mira el jugador.

    const yaw = camera.rotation.y;

    const dx =
        -Math.sin(yaw) * avance +
        Math.cos(yaw) * lateral;

    const dz =
        -Math.cos(yaw) * avance -
        Math.sin(yaw) * lateral;

    // Usa las colisiones si están implementadas en
    // interacciones.js.

    if (
        interacciones &&
        typeof interacciones.moverConColision === 'function'
    ) {
        interacciones.moverConColision(dx, dz);
    } else {
        controls.moveRight(lateral);
        controls.moveForward(avance);
    }

    camera.position.y = jugador.altura;
}

// ------------------------------------------------------------
// REDIMENSIONAR VENTANA
// ------------------------------------------------------------

window.addEventListener('resize', () => {
    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );
});

// ------------------------------------------------------------
// BUCLE PRINCIPAL
// ------------------------------------------------------------

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(
        reloj.getDelta(),
        0.05
    );

    actualizarMovimiento(delta);

    if (
        interacciones &&
        typeof interacciones.actualizar === 'function'
    ) {
        interacciones.actualizar(delta);
    }

    if (
        mercado &&
        mercado.userData &&
        typeof mercado.userData.update === 'function'
    ) {
        mercado.userData.update(delta);
    }

    renderer.render(
        scene,
        camera
    );
}

// ------------------------------------------------------------
// INICIAR
// ------------------------------------------------------------

updateHUD();
animate();