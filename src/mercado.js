
export function crearMercado(scene, THREE) {
  const mercado = new THREE.Group()
  mercado.name = 'Supermercado_Completo'

  const materiales = {}

  function mat(nombre, color, roughness = 0.75, metalness = 0) {
    if (!materiales[nombre]) {
      materiales[nombre] = new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness
      })
    }
    return materiales[nombre]
  }

  const M = {
    piso: mat('Piso', '#c9cdd0'),
    pared: mat('Pared', '#e8e9e7'),
    blanco: mat('Blanco', '#f4f4f1'),
    techo: mat('Techo', '#d7dcdf'),
    metal: mat('Metal', '#687780', 0.35, 0.72),
    metalOscuro: mat('MetalOscuro', '#34434c', 0.38, 0.65),
    azul: mat('Azul', '#1768a7'),
    azulOscuro: mat('AzulOscuro', '#103a60'),
    rojo: mat('Rojo', '#d62732'),
    verde: mat('Verde', '#258448'),
    amarillo: mat('Amarillo', '#f5c542'),
    carton: mat('Carton', '#b98550'),
    cartonClaro: mat('CartonClaro', '#d2a16a'),
    cristal: new THREE.MeshStandardMaterial({
      color: '#bce8f5',
      roughness: 0.18,
      metalness: 0.15,
      transparent: true,
      opacity: 0.35
    }),
    negro: mat('Negro', '#202529', 0.4),
    vidrio: mat('Vidrio', '#a9d7e4', 0.15, 0.2),
    naranja: mat('Naranja', '#ef8125'),
    rosa: mat('Rosa', '#e95d87'),
    morado: mat('Morado', '#7950a0'),
    leche: mat('Leche', '#f7f5eb'),
    madera: mat('Madera', '#b78a55'),
    concreto: mat('Concreto', '#8c9398'),
    pisoAlmacen: mat('PisoAlmacen', '#aeb4b7'),
    verdeOscuro: mat('VerdeOscuro', '#176239')
  }

  function caja(nombre, x, y, z, sx, sy, sz, material, padre = mercado) {
    const geo = new THREE.BoxGeometry(sx, sy, sz)
    const mesh = new THREE.Mesh(geo, material)
    mesh.name = nombre
    mesh.position.set(x, y, z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    padre.add(mesh)
    return mesh
  }

  function cilindro(nombre, x, y, z, radioSup, radioInf, alto, material, padre = mercado, lados = 16) {
    const geo = new THREE.CylinderGeometry(radioSup, radioInf, alto, lados)
    const mesh = new THREE.Mesh(geo, material)
    mesh.name = nombre
    mesh.position.set(x, y, z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    padre.add(mesh)
    return mesh
  }

  function esfera(nombre, x, y, z, radio, material, padre = mercado) {
    const geo = new THREE.SphereGeometry(radio, 12, 8)
    const mesh = new THREE.Mesh(geo, material)
    mesh.name = nombre
    mesh.position.set(x, y, z)
    mesh.castShadow = true
    padre.add(mesh)
    return mesh
  }

  function letrero(texto, x, y, z, ancho, alto, color = '#1768a7', padre = mercado) {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 128

    const ctx = canvas.getContext('2d')
    ctx.fillStyle = color
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 46px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(texto, 256, 64, 480)

    const textura = new THREE.CanvasTexture(canvas)
    textura.colorSpace = THREE.SRGBColorSpace

    const mesh = caja(
      `Letrero_${texto.replace(/\s+/g, '_')}`,
      x, y, z, ancho, alto, 0.12,
      new THREE.MeshStandardMaterial({
        map: textura,
        emissive: color,
        emissiveIntensity: 0.12,
        roughness: 0.65
      }),
      padre
    )
    return mesh
  }

  function luz(nombre, x, y, z, padre, intensidad = 22, distancia = 17) {
    caja(
      `${nombre}_Pantalla`,
      x, y, z, 2.8, 0.09, 0.55,
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        emissive: '#fff4d2',
        emissiveIntensity: 1.2
      }),
      padre
    )

    const point = new THREE.PointLight('#fff2d8', intensidad, distancia, 2)
    point.name = `${nombre}_Luz`
    point.position.set(x, y - 0.15, z)
    point.castShadow = false
    padre.add(point)
  }

  function estante(nombre, x, z, padre = mercado, ancho = 5.8, fondo = 1.25, alto = 4.2, tipo = 'super') {
    const baseY = 0
    const niveles = tipo === 'almacen' ? [0.8, 2.2, 3.6, 4.8] : [0.7, 1.65, 2.6, 3.5]
    const altoReal = alto

    caja(`${nombre}_Base`, x, baseY + 0.12, z, ancho, 0.24, fondo, M.metalOscuro, padre)

    for (const px of [-ancho / 2 + 0.12, ancho / 2 - 0.12]) {
      for (const pz of [-fondo / 2 + 0.08, fondo / 2 - 0.08]) {
        caja(`${nombre}_Poste`, x + px, altoReal / 2, z + pz, 0.13, altoReal, 0.13, M.metal, padre)
      }
    }

    niveles.forEach((nivel, i) => {
      const y = tipo === 'almacen' ? nivel : nivel
      if (y < altoReal) {
        caja(`${nombre}_Bandeja_${i}`, x, y, z, ancho - 0.12, 0.13, fondo, M.metal, padre)
      }
    })

    if (tipo === 'almacen') {
      const colores = [M.carton, M.cartonClaro, M.carton, M.cartonClaro]
      niveles.forEach((nivel, i) => {
        if (nivel > altoReal - 0.4) return
        const cantidad = Math.max(2, Math.floor(ancho / 0.9))
        for (let j = 0; j < cantidad; j++) {
          const px = x - ancho / 2 + 0.55 + j * ((ancho - 1.0) / (cantidad - 1 || 1))
          caja(
            `${nombre}_Caja_${i}_${j}`,
            px,
            nivel + 0.45,
            z,
            0.62,
            0.7,
            0.72,
            colores[(i + j) % colores.length],
            padre
          )
          caja(
            `${nombre}_Cinta_${i}_${j}`,
            px,
            nivel + 0.45,
            z + 0.366,
            0.055,
            0.7,
            0.015,
            M.madera,
            padre
          )
        }
      })
    } else {
      const colores = [
        M.rojo, M.azul, M.verde, M.amarillo,
        M.naranja, M.morado, M.rosa, M.blanco
      ]

      niveles.forEach((nivel, i) => {
        if (nivel > altoReal - 0.25) return
        for (let j = 0; j < 9; j++) {
          const px = x - ancho / 2 + 0.42 + j * ((ancho - 0.85) / 8)
          const py = nivel + 0.35
          const productoMaterial = colores[(i * 3 + j) % colores.length]

          if (j % 3 === 0) {
            cilindro(`${nombre}_Producto_${i}_${j}`, px, py, z, 0.17, 0.19, 0.55, productoMaterial, padre, 12)
          } else {
            caja(`${nombre}_Producto_${i}_${j}`, px, py, z, 0.34, 0.62, 0.38, productoMaterial, padre)
          }
        }
      })
    }
  }

  function producto(nombre, x, y, z, ancho, alto, fondo, material, precio, padre = mercado) {
    const grupo = new THREE.Group()
    grupo.name = nombre
    grupo.position.set(x, y, z)
    grupo.userData.producto = true
    grupo.userData.nombre = nombre.replaceAll('_', ' ')
    grupo.userData.precio = precio
    grupo.userData.tipo = 'producto'

    const cuerpo = new THREE.Mesh(
      new THREE.BoxGeometry(ancho, alto, fondo),
      material
    )
    cuerpo.position.y = alto / 2
    cuerpo.castShadow = true
    cuerpo.receiveShadow = true
    grupo.add(cuerpo)

    caja(
      `${nombre}_Etiqueta`,
      0, alto * 0.48, fondo / 2 + 0.012,
      ancho * 0.75, alto * 0.19, 0.025,
      M.blanco,
      grupo
    )

    padre.add(grupo)
    return grupo
  }

  function cajaCobro(nombre, x, z) {
    const g = new THREE.Group()
    g.name = nombre
    mercado.add(g)

    caja(`${nombre}_Mueble`, x, 0.65, z, 3.8, 1.3, 1.5, M.azulOscuro, g)
    caja(`${nombre}_Cubierta`, x, 1.34, z, 3.95, 0.12, 1.6, M.negro, g)
    caja(`${nombre}_Banda`, x, 1.43, z - 0.28, 1.45, 0.06, 0.68, M.metalOscuro, g)
    caja(`${nombre}_Pantalla`, x + 1.25, 1.72, z - 0.35, 0.55, 0.5, 0.12, M.negro, g)
    caja(`${nombre}_PantallaVidrio`, x + 1.25, 1.72, z - 0.275, 0.43, 0.34, 0.025, M.vidrio, g)
    caja(`${nombre}_Lector`, x - 0.65, 1.47, z + 0.25, 0.45, 0.08, 0.42, M.rojo, g)
    caja(`${nombre}_Cajon`, x + 0.6, 1.42, z + 0.28, 0.55, 0.1, 0.42, M.metal, g)

    letrero('CAJA', x, 2.35, z, 1.65, 0.42, '#103a60', g)
  }

  function refrigerador(nombre, x, z) {
    const g = new THREE.Group()
    g.name = nombre
    mercado.add(g)

    caja(`${nombre}_Cuerpo`, x, 2.5, z, 2.1, 5, 1.4, M.blanco, g)
    caja(`${nombre}_Interior`, x, 2.5, z + 0.72, 1.82, 4.5, 0.08, M.azulOscuro, g)
    caja(`${nombre}_MarcoSuperior`, x, 4.98, z + 0.77, 2.08, 0.13, 0.12, M.metal, g)

    for (let i = 0; i < 5; i++) {
      const y = 0.8 + i * 0.85
      caja(`${nombre}_Repisa_${i}`, x, y, z + 0.45, 1.75, 0.08, 0.8, M.blanco, g)
      for (let j = 0; j < 5; j++) {
        const colors = [M.rojo, M.verde, M.amarillo, M.azul, M.blanco]
        cilindro(`${nombre}_Bebida_${i}_${j}`, x - 0.68 + j * 0.34, y + 0.34, z + 0.5, 0.1, 0.1, 0.55, colors[(i + j) % colors.length], g, 10)
      }
    }

    caja(`${nombre}_Puerta`, x, 2.6, z + 0.83, 1.75, 4.25, 0.08, M.cristal, g)
    caja(`${nombre}_Tirador`, x + 0.76, 2.7, z + 0.91, 0.06, 3.3, 0.07, M.metal, g)
  }

  function tarima(nombre, x, z, padre) {
    caja(`${nombre}_Base`, x, 0.16, z, 2.1, 0.25, 1.6, M.madera, padre)
    for (let i = 0; i < 4; i++) {
      caja(`${nombre}_Tabla_${i}`, x - 0.78 + i * 0.52, 0.29, z, 0.1, 0.06, 1.52, M.carton, padre)
    }
  }

  function puerta(nombre, x, z, ancho, alto, padre, material = M.azulOscuro) {
    caja(`${nombre}_MarcoSuperior`, x, alto + 0.16, z, ancho + 0.5, 0.32, 0.42, M.metalOscuro, padre)
    caja(`${nombre}_MarcoIzquierdo`, x - ancho / 2 - 0.12, alto / 2, z, 0.24, alto, 0.42, M.metal, padre)
    caja(`${nombre}_MarcoDerecho`, x + ancho / 2 + 0.12, alto / 2, z, 0.24, alto, 0.42, M.metal, padre)

    caja(`${nombre}_HojaIzquierdaAbierta`, x - ancho / 2 - 1.35, alto / 2, z, 0.18, alto, 0.22, material, padre)
    caja(`${nombre}_HojaDerechaAbierta`, x + ancho / 2 + 1.35, alto / 2, z, 0.18, alto, 0.22, material, padre)
  }

  // Iluminación general del supermercado
  const ambient = new THREE.HemisphereLight('#e7f4ff', '#77716a', 1.65)
  ambient.name = 'Luz_Ambiente_Supermercado'
  mercado.add(ambient)

  const direccion = new THREE.DirectionalLight('#fff1d7', 2.1)
  direccion.name = 'Luz_Principal_Supermercado'
  direccion.position.set(-18, 32, 24)
  direccion.castShadow = true
  direccion.shadow.mapSize.set(2048, 2048)
  direccion.shadow.camera.left = -80
  direccion.shadow.camera.right = 80
  direccion.shadow.camera.top = 80
  direccion.shadow.camera.bottom = -80
  mercado.add(direccion)

  // Edificio principal
  caja('Piso_Supermercado', 0, -0.18, 0, 70, 0.36, 42, M.piso)
  caja('Piso_Entrada', 0, -0.16, 23, 70, 0.32, 4, M.concreto)

  // Muros laterales
  caja('Muro_Izquierdo', -35, 4.4, 0, 0.6, 8.8, 42, M.pared)
  caja('Muro_Derecho', 35, 4.4, 0, 0.6, 8.8, 42, M.pared)

  // Fachada frontal con entrada
  caja('Fachada_Frontal_Izquierda', -23, 3.3, 21, 24, 6.6, 0.5, M.pared)
  caja('Fachada_Frontal_Derecha', 23, 3.3, 21, 24, 6.6, 0.5, M.pared)
  caja('Fachada_Dintel_Entrada', 0, 7.7, 21, 22, 2.2, 0.5, M.pared)

  caja('Cristal_Entrada_Izquierdo', -9.5, 3.2, 20.72, 3.4, 6.2, 0.08, M.vidrio)
  caja('Cristal_Entrada_Derecho', 9.5, 3.2, 20.72, 3.4, 6.2, 0.08, M.vidrio)
  caja('Puerta_Entrada_Izquierda', -3.1, 2.7, 20.62, 0.12, 5.4, 0.16, M.metal)
  caja('Puerta_Entrada_Derecha', 3.1, 2.7, 20.62, 0.12, 5.4, 0.16, M.metal)

  letrero('SUPERMERCADO', 0, 7.4, 20.55, 16, 1.2, '#1768a7')
  letrero('ENTRADA', 0, 5.4, 20.45, 4.6, 0.6, '#258448')

  // Pared posterior con paso al almacén
  caja('Muro_Trasero_Izquierdo', -21.5, 4.4, -21, 27, 8.8, 0.55, M.pared)
  caja('Muro_Trasero_Derecho', 21.5, 4.4, -21, 27, 8.8, 0.55, M.pared)
  caja('Muro_Trasero_Dintel', -8, 7.7, -21, 10, 2.2, 0.55, M.pared)
  puerta('Puerta_Interior_Almacen', -8, -21.1, 6.2, 5.5, mercado, M.azul)

  // Techo perimetral, dejando gran parte del centro abierto para facilitar la vista
  caja('Techo_Frontal', 0, 8.9, 17.5, 70, 0.35, 7, M.techo)
  caja('Techo_Trasero', 0, 8.9, -17.5, 70, 0.35, 7, M.techo)
  caja('Techo_Lateral_Izquierdo', -32.5, 8.9, 0, 5, 0.35, 28, M.techo)
  caja('Techo_Lateral_Derecho', 32.5, 8.9, 0, 5, 0.35, 28, M.techo)

  // Pasillos centrales
  estante('Gondola_A', -22, 2, mercado, 6.1, 1.3, 4.0, 'super')
  estante('Gondola_B', -10, 2, mercado, 6.1, 1.3, 4.0, 'super')
  estante('Gondola_C', 2, 2, mercado, 6.1, 1.3, 4.0, 'super')
  estante('Gondola_D', 14, 2, mercado, 6.1, 1.3, 4.0, 'super')

  estante('Gondola_E', -22, -7, mercado, 6.1, 1.3, 4.0, 'super')
  estante('Gondola_F', -10, -7, mercado, 6.1, 1.3, 4.0, 'super')
  estante('Gondola_G', 2, -7, mercado, 6.1, 1.3, 4.0, 'super')
  estante('Gondola_H', 14, -7, mercado, 6.1, 1.3, 4.0, 'super')

  // Letreros de departamentos
  letrero('ABARROTES', -22, 5.0, 2.0, 4.8, 0.5, '#1768a7')
  letrero('BOTANAS', -10, 5.0, 2.0, 4.8, 0.5, '#d62732')
  letrero('BEBIDAS', 2, 5.0, 2.0, 4.8, 0.5, '#258448')
  letrero('LIMPIEZA', 14, 5.0, 2.0, 4.8, 0.5, '#7950a0')

  // Cajas de cobro
  cajaCobro('Caja_Cobro_01', -20, 14)
  cajaCobro('Caja_Cobro_02', -13, 14)
  cajaCobro('Caja_Cobro_03', -6, 14)

  // Zona de frutas y verduras
  letrero('FRUTAS Y VERDURAS', 23.5, 6.3, 14.5, 7.8, 0.8, '#258448')

  const frutas = [
    ['Manzana_Roja', M.rojo],
    ['Manzana_Verde', M.verde],
    ['Naranja', M.naranja],
    ['Limón', M.verdeOscuro]
  ]

  frutas.forEach((fruta, i) => {
    const x = 21 + i * 2.1
    caja(`Mesa_Fruta_${i}`, x, 0.8, 14.5, 1.8, 1.4, 2.2, M.madera)

    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        esfera(`${fruta[0]}_${j}_${k}`, x - 0.5 + j * 0.5, 1.65, 13.9 + k * 0.5, 0.22, fruta[1])
      }
    }
  })

  // Rincón de productos de limpieza
  estante('Estante_Limpieza', -29.5, -10, mercado, 4.4, 1.5, 4.2, 'super')
  producto('Detergente_Azul', -30.7, 0.8, -10, 0.48, 1.2, 0.5, M.azul, 42)
  producto('Cloro_Blanco', -29.5, 0.8, -10, 0.48, 1.2, 0.5, M.leche, 28)
  producto('Suavizante_Rosa', -28.3, 0.8, -10, 0.48, 1.2, 0.5, M.rosa, 39)

  // Refrigeradores y bebidas
  refrigerador('Refrigerador_01', 31.7, -13)
  refrigerador('Refrigerador_02', 31.7, -7)
  refrigerador('Refrigerador_03', 31.7, -1)
  refrigerador('Refrigerador_04', 31.7, 5)

  // Zona de ropa
  letrero('ROPA', 24, 5.5, 8, 4, 0.6, '#7950a0')

  for (let i = 0; i < 3; i++) {
    const x = 21.5 + i * 3
    cilindro(`Perchero_Poste_${i}`, x, 2.0, 8, 0.08, 0.08, 3.5, M.metal)
    cilindro(`Perchero_Barra_${i}`, x, 3.65, 8, 0.07, 0.07, 2.5, M.metal)
    for (let j = 0; j < 5; j++) {
      const ropaMaterial = [M.azul, M.rojo, M.verde, M.amarillo, M.morado][j]
      caja(`Prenda_${i}_${j}`, x - 0.9 + j * 0.45, 2.6, 8, 0.34, 1.25, 0.12, ropaMaterial)
      cilindro(`Gancho_${i}_${j}`, x - 0.9 + j * 0.45, 3.35, 8, 0.025, 0.025, 0.25, M.metal)
    }
  }

  // Luces del área de venta
  const posicionesLuces = [
    [-27, -13], [-15, -13], [-3, -13], [9, -13], [21, -13],
    [-27, -3], [-15, -3], [-3, -3], [9, -3], [21, -3],
    [-27, 8], [-15, 8], [-3, 8], [9, 8], [21, 8]
  ]

  posicionesLuces.forEach((p, i) => {
    luz(`Luz_Tienda_${i}`, p[0], 8.1, p[1], mercado, 15, 18)
  })

  // Almacén trasero
  const almacen = new THREE.Group()
  almacen.name = 'Almacen_Mercancia'

  caja('Almacen_Piso', 0, -0.18, -43, 62, 0.36, 30, M.pisoAlmacen, almacen)

  caja('Almacen_Muro_Izquierdo', -31, 3.75, -43, 0.5, 7.5, 30, M.pared, almacen)
  caja('Almacen_Muro_Derecho', 31, 3.75, -43, 0.5, 7.5, 30, M.pared, almacen)
  caja('Almacen_Muro_Trasero_Izquierdo', -18.25, 3.75, -58, 25.5, 7.5, 0.5, M.pared, almacen)
  caja('Almacen_Muro_Trasero_Derecho', 18.25, 3.75, -58, 25.5, 7.5, 0.5, M.pared, almacen)
  caja('Almacen_Dintel_Puerta', 0, 6.5, -58, 11, 2, 0.5, M.pared, almacen)

  caja('Almacen_Techo_Frontal', 0, 7.7, -31, 62, 0.3, 5, M.techo, almacen)
  caja('Almacen_Techo_Trasero', 0, 7.7, -55, 62, 0.3, 6, M.techo, almacen)
  caja('Almacen_Techo_Lateral_Izquierdo', -29, 7.7, -43, 4, 0.3, 18, M.techo, almacen)
  caja('Almacen_Techo_Lateral_Derecho', 29, 7.7, -43, 4, 0.3, 18, M.techo, almacen)

  letrero('ALMACEN DE MERCANCIA', 0, 6.9, -30.2, 13, 0.8, '#103a60', almacen)
  letrero('RECIBO Y CONTROL', 0, 5.7, -30.2, 8, 0.55, '#258448', almacen)

  // Pasillos de racks para cajas
  estante('Rack_Almacen_A', -23, -34, almacen, 10, 1.8, 6.2, 'almacen')
  estante('Rack_Almacen_B', -23, -43, almacen, 10, 1.8, 6.2, 'almacen')
  estante('Rack_Almacen_C', -23, -52, almacen, 10, 1.8, 6.2, 'almacen')

  estante('Rack_Almacen_D', -9, -34, almacen, 7, 1.8, 6.2, 'almacen')
  estante('Rack_Almacen_E', -9, -43, almacen, 7, 1.8, 6.2, 'almacen')
  estante('Rack_Almacen_F', -9, -52, almacen, 7, 1.8, 6.2, 'almacen')

  estante('Rack_Almacen_G', 8, -34, almacen, 7, 1.8, 6.2, 'almacen')
  estante('Rack_Almacen_H', 8, -43, almacen, 7, 1.8, 6.2, 'almacen')
  estante('Rack_Almacen_I', 8, -52, almacen, 7, 1.8, 6.2, 'almacen')

  estante('Rack_Almacen_J', 23, -34, almacen, 10, 1.8, 6.2, 'almacen')
  estante('Rack_Almacen_K', 23, -43, almacen, 10, 1.8, 6.2, 'almacen')
  estante('Rack_Almacen_L', 23, -52, almacen, 10, 1.8, 6.2, 'almacen')

  // Área de recepción, tarimas y cajas sueltas
  for (let i = 0; i < 5; i++) {
    const x = -16 + i * 5.2
    tarima(`Tarima_Recepcion_${i}`, x, -31.2, almacen)

    for (let j = 0; j < 3; j++) {
      caja(
        `Caja_Recepcion_${i}_${j}`,
        x - 0.55 + j * 0.55,
        0.78,
        -31.2,
        0.48,
        0.78,
        0.48,
        j % 2 === 0 ? M.carton : M.cartonClaro,
        almacen
      )
    }
  }

  // Iluminación del almacén
  const luzAlmacen = [
    [-22, -37], [-8, -37], [7, -37], [22, -37],
    [-22, -46], [-8, -46], [7, -46], [22, -46],
    [-22, -54], [-8, -54], [7, -54], [22, -54]
  ]

  luzAlmacen.forEach((p, i) => {
    luz(`Luz_Almacen_${i}`, p[0], 7.1, p[1], almacen, 16, 15)
  })

  // Puerta trasera de carga completamente despejada
  puerta('Puerta_Trasera_Carga', 0, -58.2, 11, 5.5, almacen, M.azulOscuro)
  letrero('CARGA Y DESCARGA', 0, 6.35, -57.5, 10, 0.8, '#d62732', almacen)

  // Muelle y plataforma exterior de carga
  caja('Muelle_Plataforma', 0, -0.02, -60.1, 18, 0.55, 4.4, M.concreto, almacen)
  caja('Muelle_Borde_Izquierdo', -9.1, 0.25, -60.1, 0.2, 0.15, 4.4, M.amarillo, almacen)
  caja('Muelle_Borde_Derecho', 9.1, 0.25, -60.1, 0.2, 0.15, 4.4, M.amarillo, almacen)

  caja('Rampa_Carga', 0, -0.3, -63.1, 14, 0.35, 2.6, M.concreto, almacen)
  caja('Patio_Maniobras', 0, -0.52, -68.5, 52, 0.3, 9, M.concreto, almacen)

  // Líneas de circulación del patio
  for (let i = 0; i < 4; i++) {
    caja(`Linea_Patio_${i}`, -18 + i * 12, -0.34, -68.5, 0.12, 0.03, 7.5, M.amarillo, almacen)
  }

  // Bolardos protectores del muelle
  for (const x of [-10.2, -8.8, 8.8, 10.2]) {
    cilindro(`Bolardo_${x}`, x, 0.42, -59.2, 0.16, 0.16, 0.9, M.amarillo, almacen, 12)
  }

  // Conector techado entre tienda y almacén
  const pasillo = new THREE.Group()
  pasillo.name = 'Pasillo_Conector_Almacen'

  caja('Conector_Piso', -8, -0.12, -24.6, 6.5, 0.24, 7.4, M.piso, pasillo)
  caja('Conector_Pared_Izquierda', -11.25, 2.6, -24.6, 0.22, 5.2, 7.4, M.pared, pasillo)
  caja('Conector_Pared_Derecha', -4.75, 2.6, -24.6, 0.22, 5.2, 7.4, M.pared, pasillo)
  caja('Conector_Techo', -8, 5.35, -24.6, 6.5, 0.3, 7.4, M.techo, pasillo)
  luz('Luz_Conector', -8, 4.9, -24.6, pasillo, 10, 10)

  // Señalización del pasillo de mercancía
  letrero('SOLO PERSONAL', -8, 4.6, -22.8, 4.3, 0.55, '#d62732', pasillo)

  mercado.add(almacen)
  mercado.add(pasillo)
  scene.add(mercado)

  mercado.userData.zonaTienda = {
    minX: -35,
    maxX: 35,
    minZ: -21,
    maxZ: 21
  }

  mercado.userData.zonaAlmacen = {
    minX: -31,
    maxX: 31,
    minZ: -58,
    maxZ: -28
  }

  mercado.userData.productos = []

  mercado.traverse(obj => {
    if (obj.userData && obj.userData.producto) {
      mercado.userData.productos.push(obj)
    }
  })

  return mercado
}