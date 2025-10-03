// Enhanced main.js with loading screen and UI improvements
const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()
const loader = new THREE.GLTFLoader()
const textureLoader = new THREE.TextureLoader()

// Loading screen elements
const loadingScreen = document.getElementById('loader')
const progressBar = document.querySelector('.progress')
let assetsLoaded = 0
let totalAssets = 10 // Adjust based on actual assets

// Update progress bar
function updateProgress() {
    assetsLoaded++
    const progress = (assetsLoaded / totalAssets) * 100
    progressBar.style.width = `${progress}%`
    
    if (assetsLoaded >= totalAssets) {
        // All assets loaded, hide loading screen
        setTimeout(() => {
            loadingScreen.style.opacity = '0'
            setTimeout(() => {
                loadingScreen.style.display = 'none'
            }, 1000)
        }, 500)
    }
}

// Sizes
const sizes = { width: window.innerWidth, height: window.innerHeight }

// Camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-14, 8, 20)
scene.add(camera)

// Controls
const controls = new THREE.OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enableZoom = true
controls.minDistance = 12
controls.maxDistance = 28
controls.minPolarAngle = Math.PI / 6
controls.maxPolarAngle = Math.PI / 2.2

// Renderer with shadows
const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas, 
    antialias: true, 
    alpha: true,
    powerPreference: "high-performance"
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// 🎵 Audio setup
let lanternClickBuffer = null
let listener = new THREE.AudioListener()
camera.add(listener)

// UI Elements
const musicButton = document.getElementById('music-toggle')
const infoButton = document.getElementById('info-toggle')
const fullscreenButton = document.getElementById('fullscreen-toggle')
const infoPanel = document.getElementById('info-panel')
const closeInfoButton = document.getElementById('close-info')
const mobileNotice = document.getElementById('mobile-notice')
const closeMobileNotice = document.getElementById('close-mobile-notice')

let musicPlaying = false
let backgroundSound

// UI Event Listeners
musicButton.addEventListener('click', toggleMusic)
infoButton.addEventListener('click', toggleInfoPanel)
closeInfoButton.addEventListener('click', toggleInfoPanel)
fullscreenButton.addEventListener('click', toggleFullscreen)
closeMobileNotice.addEventListener('click', () => {
    mobileNotice.classList.remove('active')
})

// Show mobile controls notice on touch devices
if ('ontouchstart' in window) {
    setTimeout(() => {
        mobileNotice.classList.add('active')
    }, 3000)
}

function toggleMusic() {
    if (!backgroundSound) return
    
    if (!musicPlaying) {
        backgroundSound.play()
        musicButton.textContent = "🔇 Mute"
    } else {
        backgroundSound.pause()
        musicButton.textContent = "🔊 Music"
    }
    musicPlaying = !musicPlaying
}

function toggleInfoPanel() {
    infoPanel.classList.toggle('active')
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`)
        })
        fullscreenButton.textContent = "⛶ Exit"
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen()
            fullscreenButton.textContent = "⛶ Fullscreen"
        }
    }
}

// Fullscreen change event
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        fullscreenButton.textContent = "⛶ Fullscreen"
    }
})

// 🌌 Beautiful gradient night sky
const createSkyGradient = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, 0, 256)
    gradient.addColorStop(0, '#1a0033')
    gradient.addColorStop(0.5, '#330066')
    gradient.addColorStop(1, '#0D0D1A')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 2, 256)
    return new THREE.CanvasTexture(canvas)
}

const skyTexture = createSkyGradient()
scene.background = skyTexture
updateProgress()

// ✨ Starfield
const createStars = () => {
    const starGeo = new THREE.BufferGeometry()
    const starCount = 1500
    const positions = new Float32Array(starCount * 3)
    
    for(let i = 0; i < starCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 150
        positions[i + 1] = Math.random() * 50 + 10
        positions[i + 2] = (Math.random() - 0.5) * 150
    }
    
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const starMat = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.15,
        transparent: true,
        opacity: 0.8
    })
    
    return new THREE.Points(starGeo, starMat)
}

const stars = createStars()
scene.add(stars)
updateProgress()

// 🌙 Enhanced Moon with glow
const createMoon = () => {
    const moonGroup = new THREE.Group()
    
    // Main moon with crater texture
    const moonGeo = new THREE.SphereGeometry(2.5, 64, 64)
    const moonMat = new THREE.MeshStandardMaterial({ 
        color: '#FFF8DC',
        emissive: '#FFE4B5',
        emissiveIntensity: 0.6,
        roughness: 0.8
    })
    const moon = new THREE.Mesh(moonGeo, moonMat)
    
    // Glow effect
    const glowGeo = new THREE.SphereGeometry(3.2, 32, 32)
    const glowMat = new THREE.MeshBasicMaterial({
        color: '#FFE4B5',
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    })
    const glow = new THREE.Mesh(glowGeo, glowMat)
    
    moonGroup.add(moon, glow)
    moonGroup.position.set(-12, 12, -18)
    return moonGroup
}

const moonGroup = createMoon()
scene.add(moonGroup)
updateProgress()

// 💡 Enhanced Lighting
const ambient = new THREE.AmbientLight('#6495ED', 0.3)
scene.add(ambient)

const moonLight = new THREE.DirectionalLight('#FFF8DC', 0.8)
moonLight.position.set(-12, 12, -18)
moonLight.castShadow = true
moonLight.shadow.mapSize.width = 2048
moonLight.shadow.mapSize.height = 2048
moonLight.shadow.camera.far = 50
scene.add(moonLight)
updateProgress()

// 🏮 Vietnamese Star Lanterns (Đèn Ông Sao)
function createStarLantern(x, y, z, color) {
    const lanternGroup = new THREE.Group()
    
    // Star-shaped geometry
    const starShape = new THREE.Shape()
    const outerRadius = 0.4
    const innerRadius = 0.2
    const points = 5
    
    for(let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const angle = (i * Math.PI) / points
        const x = radius * Math.sin(angle)
        const y = radius * Math.cos(angle)
        if(i === 0) starShape.moveTo(x, y)
        else starShape.lineTo(x, y)
    }
    starShape.closePath()
    
    const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.01 }
    const starGeo = new THREE.ExtrudeGeometry(starShape, extrudeSettings)
    const starMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.9,
        roughness: 0.4,
        metalness: 0.2
    })
    
    const star = new THREE.Mesh(starGeo, starMat)
    star.castShadow = true
    
    // Hanging string
    const stringGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.5, 8)
    const stringMat = new THREE.MeshStandardMaterial({ color: '#654321' })
    const string = new THREE.Mesh(stringGeo, stringMat)
    string.position.y = 1
    
    // Decorative tassel
    const tasselGeo = new THREE.ConeGeometry(0.08, 0.3, 8)
    const tasselMat = new THREE.MeshStandardMaterial({ color: '#FFD700' })
    const tassel = new THREE.Mesh(tasselGeo, tasselMat)
    tassel.position.y = -0.5
    
    // Point light
    const light = new THREE.PointLight(color, 2, 8)
    light.castShadow = true
    
    lanternGroup.add(star, string, tassel, light)
    lanternGroup.position.set(x, y, z)
    lanternGroup.userData.isLantern = true
    lanternGroup.userData.star = star
    lanternGroup.userData.originalY = y
    
    return lanternGroup
}

// Place colorful Vietnamese lanterns
let lanterns = []
const lanternColors = ['#FF0000', '#FF1493', '#FFD700', '#00FF00', '#00CED1', '#FF6347']
const positions = [
    [2, 4, 0], [-3, 4, 1], [1, 3.5, -2], [-2, 3.5, -1],
    [4, 3.8, 2], [-4, 3.8, 2], [0, 4.2, 3], [3, 3.5, -3], [-3, 3.5, -3]
]

positions.forEach((pos, i) => {
    const color = lanternColors[i % lanternColors.length]
    const lantern = createStarLantern(pos[0], pos[1], pos[2], color)
    lanterns.push(lantern)
    scene.add(lantern)
})
updateProgress()

// 🌳 Ground with textured pattern
const createGround = () => {
    const groundGeo = new THREE.PlaneGeometry(50, 50, 20, 20)
    
    // Create procedural texture for ground
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    
    // Base color
    ctx.fillStyle = '#8B7355'
    ctx.fillRect(0, 0, 512, 512)
    
    // Add tile pattern
    ctx.strokeStyle = '#6B5345'
    ctx.lineWidth = 2
    const tileSize = 64
    for(let i = 0; i < 512; i += tileSize) {
        for(let j = 0; j < 512; j += tileSize) {
            ctx.strokeRect(i, j, tileSize, tileSize)
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 4)
    
    const groundMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.9,
        metalness: 0.1
    })
    
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    return ground
}

const ground = createGround()
scene.add(ground)
updateProgress()

// 🏠 Enhanced House with decorations
loader.load(
    'https://rawcdn.githack.com/ricardoolivaalonso/ThreeJS-Room12/cecbd1c77333b3c9ee23bb1eb41dee395e14ca3e/dist/model.glb',
    (gltf) => {
        const house = gltf.scene
        house.scale.set(1.2, 1.2, 1.2)
        house.traverse(child => {
            if (child.isMesh) {
                // Create wood texture
                const canvas = document.createElement('canvas')
                canvas.width = 256
                canvas.height = 256
                const ctx = canvas.getContext('2d')
                
                ctx.fillStyle = '#8B4513'
                ctx.fillRect(0, 0, 256, 256)
                
                // Wood grain
                for(let i = 0; i < 30; i++) {
                    ctx.strokeStyle = `rgba(101, 67, 33, ${Math.random() * 0.3})`
                    ctx.lineWidth = Math.random() * 3
                    ctx.beginPath()
                    ctx.moveTo(0, Math.random() * 256)
                    ctx.lineTo(256, Math.random() * 256)
                    ctx.stroke()
                }
                
                const woodTexture = new THREE.CanvasTexture(canvas)
                
                child.material = new THREE.MeshStandardMaterial({
                    map: woodTexture,
                    color: '#A0522D',
                    roughness: 0.7,
                    metalness: 0.1
                })
                child.castShadow = true
                child.receiveShadow = true
            }
        })
        scene.add(house)
        
        // Add red lanterns on house
        const houseLantern1 = createStarLantern(-2.5, 3, -2, '#FF0000')
        const houseLantern2 = createStarLantern(2.5, 3, -2, '#FF0000')
        scene.add(houseLantern1, houseLantern2)
        lanterns.push(houseLantern1, houseLantern2)
        updateProgress()
    },
    (progress) => {
        // Loading progress for house model
        console.log('Loading house: ', (progress.loaded / progress.total) * 100 + '%')
    },
    (error) => {
        console.error('Error loading house model:', error)
        updateProgress() // Still count as loaded even if error
    }
)

// 🪙 Enhanced Mooncakes (Bánh Trung Thu) with details
function createMooncake(x, y, z) {
    const mooncakeGroup = new THREE.Group()
    
    // Base cake
    const cakeGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.25, 32)
    
    // Create mooncake texture
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    
    // Golden brown color
    ctx.fillStyle = '#DAA520'
    ctx.fillRect(0, 0, 256, 256)
    
    // Add pattern details
    ctx.strokeStyle = '#B8860B'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(128, 128, 80, 0, Math.PI * 2)
    ctx.stroke()
    
    // Chinese character pattern
    ctx.font = 'bold 60px serif'
    ctx.fillStyle = '#8B4513'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('福', 128, 128)
    
    const cakeTexture = new THREE.CanvasTexture(canvas)
    
    const cakeMat = new THREE.MeshStandardMaterial({
        map: cakeTexture,
        color: '#FFD39B',
        roughness: 0.6,
        metalness: 0.2
    })
    
    const cake = new THREE.Mesh(cakeGeo, cakeMat)
    cake.castShadow = true
    
    // Decorative top pattern
    const patternGeo = new THREE.CylinderGeometry(0.43, 0.43, 0.03, 32)
    const patternMat = new THREE.MeshStandardMaterial({
        color: '#B8860B',
        roughness: 0.5
    })
    const pattern = new THREE.Mesh(patternGeo, patternMat)
    pattern.position.y = 0.14
    
    mooncakeGroup.add(cake, pattern)
    mooncakeGroup.position.set(x, y, z)
    return mooncakeGroup
}

// 🪑 Decorative table with cloth
const createTable = () => {
    const tableGroup = new THREE.Group()
    
    // Table top
    const topGeo = new THREE.BoxGeometry(3.5, 0.12, 2.5)
    const topMat = new THREE.MeshStandardMaterial({
        color: '#8B4513',
        roughness: 0.6,
        metalness: 0.1
    })
    const top = new THREE.Mesh(topGeo, topMat)
    top.position.y = 1
    top.castShadow = true
    top.receiveShadow = true
    
    // Table cloth
    const clothGeo = new THREE.BoxGeometry(3.6, 0.02, 2.6)
    const clothMat = new THREE.MeshStandardMaterial({
        color: '#DC143C',
        roughness: 0.8
    })
    const cloth = new THREE.Mesh(clothGeo, clothMat)
    cloth.position.y = 1.07
    
    // Legs
    const legGeo = new THREE.CylinderGeometry(0.08, 0.1, 1, 12)
    const legMat = new THREE.MeshStandardMaterial({ color: '#654321' })
    
    const legPositions = [[1.5, 0.5, 1.1], [-1.5, 0.5, 1.1], [1.5, 0.5, -1.1], [-1.5, 0.5, -1.1]]
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, legMat)
        leg.position.set(...pos)
        leg.castShadow = true
        tableGroup.add(leg)
    })
    
    tableGroup.add(top, cloth)
    tableGroup.position.set(1, 0, 0.5)
    return tableGroup
}

const table = createTable()
scene.add(table)

// Add mooncakes on table
const mooncakePositions = [
    [0.5, 1.25, 0.5], [1, 1.25, 0.5], [1.5, 1.25, 0.5],
    [0.5, 1.25, 0], [1, 1.25, 0], [1.5, 1.25, 0],
    [0.7, 1.5, 0.2], [1.3, 1.5, 0.2]
]

mooncakePositions.forEach(pos => {
    const mooncake = createMooncake(...pos)
    scene.add(mooncake)
})
updateProgress()

// 🐉 Enhanced Lion/Dragon Dance figure
loader.load(
    'https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMan/glTF/CesiumMan.gltf',
    (gltf) => {
        const dragon = gltf.scene
        dragon.scale.set(1, 1, 1)
        dragon.position.set(-3, 0, 3)
        dragon.traverse(child => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: '#FF0000',
                    emissive: '#FF4500',
                    emissiveIntensity: 0.3,
                    roughness: 0.5,
                    metalness: 0.4
                })
                child.castShadow = true
            }
        })
        scene.add(dragon)
        
        // Animate dragon
        const animateDragon = () => {
            const time = Date.now() * 0.001
            dragon.position.y = Math.sin(time * 2) * 0.1
            dragon.rotation.y = Math.sin(time * 0.5) * 0.2
        }
        dragon.userData.animate = animateDragon
        updateProgress()
    },
    (progress) => {
        // Loading progress for dragon model
        console.log('Loading dragon: ', (progress.loaded / progress.total) * 100 + '%')
    },
    (error) => {
        console.error('Error loading dragon model:', error)
        updateProgress() // Still count as loaded even if error
    }
)

// 🎋 Decorative bamboo
const createBamboo = (x, z) => {
    const bambooGroup = new THREE.Group()
    
    for(let i = 0; i < 3; i++) {
        const segmentGeo = new THREE.CylinderGeometry(0.1, 0.12, 1.5, 12)
        const segmentMat = new THREE.MeshStandardMaterial({
            color: '#556B2F',
            roughness: 0.7
        })
        const segment = new THREE.Mesh(segmentGeo, segmentMat)
        segment.position.y = i * 1.4
        segment.castShadow = true
        
        // Joint
        const jointGeo = new THREE.TorusGeometry(0.12, 0.03, 8, 12)
        const jointMat = new THREE.MeshStandardMaterial({ color: '#3B5323' })
        const joint = new THREE.Mesh(jointGeo, jointMat)
        joint.rotation.x = Math.PI / 2
        joint.position.y = i * 1.4 + 0.7
        
        bambooGroup.add(segment, joint)
    }
    
    // Leaves
    for(let i = 0; i < 5; i++) {
        const leafGeo = new THREE.ConeGeometry(0.2, 0.6, 3)
        const leafMat = new THREE.MeshStandardMaterial({ color: '#228B22' })
        const leaf = new THREE.Mesh(leafGeo, leafMat)
        leaf.position.set(
            Math.random() * 0.3 - 0.15,
            3 + Math.random() * 0.5,
            Math.random() * 0.3 - 0.15
        )
        leaf.rotation.z = Math.random() * Math.PI
        bambooGroup.add(leaf)
    }
    
    bambooGroup.position.set(x, 0, z)
    return bambooGroup
}

scene.add(createBamboo(5, -5))
scene.add(createBamboo(-5, -5))
updateProgress()

// 🎵 Load audio
const audioLoader = new THREE.AudioLoader()
audioLoader.load(
    'https://assets.codepen.io/1468070/Relaxing+Japanese+Music.mp3',
    (buffer) => {
        backgroundSound = new THREE.Audio(listener)
        backgroundSound.setBuffer(buffer)
        backgroundSound.setLoop(true)
        backgroundSound.setVolume(0.4)
        updateProgress()
    },
    (progress) => {
        // Audio loading progress
        console.log('Loading audio: ', (progress.loaded / progress.total) * 100 + '%')
    },
    (error) => {
        console.error('Error loading audio:', error)
        updateProgress() // Still count as loaded even if error
    }
)

// Lantern click sound
audioLoader.load(
    'https://assets.codepen.io/1468070/ding.mp3',
    (buffer) => {
        lanternClickBuffer = buffer
        updateProgress()
    },
    (progress) => {
        // Sound loading progress
        console.log('Loading sound: ', (progress.loaded / progress.total) * 100 + '%')
    },
    (error) => {
        console.error('Error loading sound:', error)
        updateProgress() // Still count as loaded even if error
    }
)

// 🖱️ Mouse interaction
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1
    mouse.y = -(event.clientY / sizes.height) * 2 + 1
    
    raycaster.setFromCamera(mouse, camera)
    
    const intersects = raycaster.intersectObjects(scene.children, true)
    
    for (const intersect of intersects) {
        let object = intersect.object
        while (object.parent && !object.userData.isLantern) {
            object = object.parent
        }
        
        if (object.userData.isLantern) {
            // Play click sound
            if (lanternClickBuffer) {
                const sound = new THREE.Audio(listener)
                sound.setBuffer(lanternClickBuffer)
                sound.setVolume(0.3)
                sound.play()
            }
            
            // Lantern interaction animation
            const lantern = object
            const star = lantern.userData.star
            
            // Color flash effect
            const originalColor = star.material.color.getHex()
            star.material.color.set('#FFFFFF')
            star.material.emissive.set('#FFFFFF')
            
            // Bounce animation
            const originalY = lantern.userData.originalY
            const bounceHeight = 0.5
            
            let startTime = Date.now()
            const bounce = () => {
                const elapsed = Date.now() - startTime
                const progress = Math.min(elapsed / 600, 1)
                
                if (progress < 1) {
                    const bounceValue = Math.sin(progress * Math.PI * 2) * bounceHeight
                    lantern.position.y = originalY + bounceValue
                    requestAnimationFrame(bounce)
                } else {
                    lantern.position.y = originalY
                    // Return to original color
                    star.material.color.setHex(originalColor)
                    star.material.emissive.setHex(originalColor)
                }
            }
            
            bounce()
            break
        }
    }
})

// 🎆 Particle effects for festive atmosphere
const createFireworks = () => {
    const particles = []
    const particleCount = 100
    
    for(let i = 0; i < particleCount; i++) {
        const particleGeo = new THREE.SphereGeometry(0.05, 8, 8)
        const particleMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(Math.random(), 1, 0.7),
            transparent: true,
            opacity: 0.8
        })
        const particle = new THREE.Mesh(particleGeo, particleMat)
        
        // Random position in the sky
        particle.position.set(
            (Math.random() - 0.5) * 30,
            Math.random() * 15 + 5,
            (Math.random() - 0.5) * 30
        )
        
        // Random velocity
        particle.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02
        )
        
        particle.userData.life = Math.random() * 100 + 50
        particles.push(particle)
        scene.add(particle)
    }
    
    return particles
}

const fireworks = createFireworks()
updateProgress()

// 🎬 Animation loop
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    
    // Update controls
    controls.update()
    
    // Animate lanterns
    lanterns.forEach((lantern, i) => {
        const time = elapsedTime + i
        lantern.position.y = lantern.userData.originalY + Math.sin(time * 0.8) * 0.1
        lantern.rotation.y = Math.sin(time * 0.5) * 0.1
    })
    
    // Animate moon
    moonGroup.rotation.y = elapsedTime * 0.05
    
    // Animate stars
    stars.rotation.y = elapsedTime * 0.01
    
    // Animate fireworks particles
    fireworks.forEach(particle => {
        particle.position.add(particle.userData.velocity)
        particle.userData.life--
        
        if (particle.userData.life <= 0) {
            // Reset particle
            particle.position.set(
                (Math.random() - 0.5) * 30,
                Math.random() * 15 + 5,
                (Math.random() - 0.5) * 30
            )
            particle.userData.life = Math.random() * 100 + 50
        }
        
        // Fade out
        particle.material.opacity = Math.min(particle.userData.life / 50, 0.8)
    })
    
    // Animate dragon if present
    scene.traverse(child => {
        if (child.userData && child.userData.animate) {
            child.userData.animate()
        }
    })
    
    // Render
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()

// 📱 Handle window resize
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Handle visibility change for audio
document.addEventListener('visibilitychange', () => {
    if (document.hidden && backgroundSound && musicPlaying) {
        backgroundSound.pause()
    } else if (!document.hidden && backgroundSound && musicPlaying) {
        backgroundSound.play()
    }
})