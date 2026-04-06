import { useState, useRef, useEffect, memo } from 'react'
import { MapPin, Compass } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'

function ExploreMap({ posts, regions, onPostClick, flyToTarget, onFlyComplete, onMoveEnd }) {
    const { user } = useAuth()
    const [globeReady, setGlobeReady] = useState(false)

    const cesiumContainerRef = useRef(null)
    const viewerRef = useRef(null)
    const coordsRef = useRef(null)
    const flyingRef = useRef(false)
    const lastFlyIdRef = useRef(null) // evita re-processar o mesmo flyToTarget

    // Refs para callbacks — evita closures stale dentro dos event handlers do Cesium
    const onPostClickRef = useRef(onPostClick)
    const onMoveEndRef = useRef(onMoveEnd)
    const onFlyCompleteRef = useRef(onFlyComplete)
    const postsRef = useRef(posts)

    useEffect(() => { onPostClickRef.current = onPostClick }, [onPostClick])
    useEffect(() => { onMoveEndRef.current = onMoveEnd }, [onMoveEnd])
    useEffect(() => { onFlyCompleteRef.current = onFlyComplete }, [onFlyComplete])
    useEffect(() => { postsRef.current = posts }, [posts])

    /**
     * FlyTo — reage a mudanças de flyToTarget para reposicionar o mapa.
     * Usa lastFlyIdRef para evitar reprocessar o mesmo alvo quando o parent
     * re-renderiza sem ter mudado flyToTarget.
     */
    useEffect(() => {
        if (!flyToTarget) return
        // Evitar reprocessar o mesmo flyToTarget
        if (flyToTarget._id === lastFlyIdRef.current) return
        lastFlyIdRef.current = flyToTarget._id

        const lat = Number(flyToTarget.lat)
        const lng = Number(flyToTarget.lng)
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return

        const viewer = viewerRef.current
        if (!viewer || viewer.isDestroyed()) return

            const altitude = flyToTarget.isMobile ? 150_000 : 400_000
            const duration = flyToTarget.isMobile ? 1.8 : 1.5

            flyingRef.current = true

            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(lng, lat, altitude),
                orientation: {
                    heading: Cesium.Math.toRadians(0),
                    pitch: Cesium.Math.toRadians(-90),
                    roll: 0,
                },
                duration,
                easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
                complete: () => {
                    flyingRef.current = false
                    onFlyCompleteRef.current?.()
                },
                cancel: () => {
                    flyingRef.current = false
                },
            })
    }, [flyToTarget])

    /* ── Inicialização do Cesium Viewer (1x) ── */
    useEffect(() => {
        const container = cesiumContainerRef.current
        if (!container) return
        if (viewerRef.current) return

        let handler = null
        let removeMoveListener = null

        window.CESIUM_BASE_URL = `${import.meta.env.BASE_URL}cesium/`

            // Segurança: se o componente desmontou entre o import e aqui
            if (!cesiumContainerRef.current) return

        Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN

            const viewer = new Cesium.Viewer(container, {
                animation: false,
                baseLayerPicker: false,
                shouldAnimate: false,
                fullscreenButton: false,
                vrButton: false,
                geocoder: false,
                homeButton: false,
                infoBox: false,
                sceneModePicker: false,
                selectionIndicator: false,
                timeline: false,
                navigationHelpButton: false,
                scene3DOnly: true,
                skyBox: undefined,
                useBrowserRecommendedResolution: true,
                contextOptions: {
                    webgl: {
                        alpha: false,
                        antialias: true,
                        preserveDrawingBuffer: false,
                    },
                },
                // NÃO usar requestRenderMode — causa flicker durante drag/flyTo
                // porque os tiles não se atualizam entre frames parciais
            })

            // Block Maximum Zoom Distance
            const controller = viewer.scene.screenSpaceCameraController
            controller.maximumZoomDistance = 9000000

            viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#060d09')
            viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0a1f14')
            viewer.scene.globe.maximumScreenSpaceError = 2
            viewer.scene.globe.tileCacheSize = 1000
            viewer.scene.fog.enabled = false
            viewer.scene.globe.enableLighting = false
            viewer.scene.skyAtmosphere = undefined

            // moveEnd — suprime durante flyTo programático, com debounce
            let moveEndTimer = null
            removeMoveListener = viewer.camera.moveEnd.addEventListener(() => {
                if (flyingRef.current) return

                clearTimeout(moveEndTimer)
                moveEndTimer = setTimeout(() => {
                    if (!viewerRef.current || viewerRef.current.isDestroyed()) return

                    const cartographic = viewer.camera.positionCartographic
                    const lat = Cesium.Math.toDegrees(cartographic.latitude)
                    const lng = Cesium.Math.toDegrees(cartographic.longitude)

                    if (onMoveEndRef.current) {
                        onMoveEndRef.current(
                            Number(lat.toFixed(5)),
                            Number(lng.toFixed(5))
                        )
                    }
                }, 300)
            })

            // click handler
            handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

            handler.setInputAction((movement) => {
                const picked = viewer.scene.pick(movement.position)
                if (Cesium.defined(picked) && picked.id?.properties?.postId) {
                    const postId = picked.id.properties.postId.getValue()
                    const currentPosts = postsRef.current
                    const post = currentPosts.find((p) => String(p.id) === String(postId))
                    if (post && onPostClickRef.current) onPostClickRef.current(post)
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

            flyingRef.current = true
            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(-8.0, 39.5, 2000000),
                duration: 0,
                complete: () => { flyingRef.current = false },
                cancel: () => { flyingRef.current = false },
            })

            viewerRef.current = viewer
            setGlobeReady(true)

        return () => {
            if (handler) handler.destroy()
            if (removeMoveListener) removeMoveListener()

            if (viewerRef.current && !viewerRef.current.isDestroyed()) {
                viewerRef.current.destroy()
            }
            viewerRef.current = null
        }
}, [])

    /* ── Renderizar pins no mapa ── */
    useEffect(() => {
        const viewer = viewerRef.current
        if (!viewer || viewer.isDestroyed()) return

            // Remover apenas pins existentes
            const existing = viewer.entities.values.filter(e => {
                return e.properties && e.properties.postId
            })
            existing.forEach(e => viewer.entities.remove(e))

            posts.forEach((post) => {
                const lat = Number(post.lat)
                const lng = Number(post.lng)
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return

                const isCurrentUserPin = user && post.user_id && String(post.user_id) === String(user.id)
                const pinColor = isCurrentUserPin ? '#3b82f6' : '#a0845f'

                viewer.entities.add({
                    position: Cesium.Cartesian3.fromDegrees(lng, lat),
                    billboard: {
                        image: `${window.CESIUM_BASE_URL}Assets/Textures/maki/marker.png`,
                        width: 32,
                        height: 32,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        color: Cesium.Color.fromCssColorString(pinColor),
                        scale: 1.2,
                        eyeOffset: new Cesium.Cartesian3(0, 0, -10),
                    },
                    properties: {
                        postId: post.id,
                    },
                })
            })
    }, [posts, user])

    /* ── Renderizar regiões ── */
    useEffect(() => {
        const viewer = viewerRef.current
        if (!viewer || viewer.isDestroyed()) return

            const existing = viewer.entities.values.filter(e => e.rectangle)
            existing.forEach(e => viewer.entities.remove(e))

            regions.forEach((region) => {
                if (region.locked) {
                    viewer.entities.add({
                        rectangle: {
                            coordinates: Cesium.Rectangle.fromDegrees(...region.bounds),
                            material: Cesium.Color.fromCssColorString('#a0845f').withAlpha(0.15),
                            outline: true,
                            outlineColor: Cesium.Color.fromCssColorString('#8b7355').withAlpha(0.4),
                            outlineWidth: 2,
                        },
                    })
                }
            })

    }, [regions])

    return (
        <div className="main-globe">
            {/* Container exclusivo do Cesium — React NUNCA monta filhos aqui */}
            <div ref={cesiumContainerRef} className="main-globe__viewer" />

            {/* Placeholder FORA do container do Cesium — evita flicker */}
            {!globeReady && (
                <div className="main-globe__placeholder">
                    <div className="main-globe__planet" />
                    <div className="main-globe__glow" />
                    <p className="main-globe__hint">
                        <Compass size={20} />
                        Globe loading…
                    </p>

                    {posts.map((post) => (
                        <button
                            key={post.id}
                            className="main-globe__mock-pin"
                            style={{
                                left: `${((Number(post.lng) + 10) / 4) * 100}%`,
                                top: `${((42 - Number(post.lat)) / 8) * 100}%`,
                            }}
                            onClick={() => onPostClick(post)}
                            title={post.title}
                        >
                            <MapPin size={20} />
                        </button>
                    ))}
                </div>
            )}

            <div className="main-globe__vignette" />

            <div ref={coordsRef} className="main-globe__coords" style={{ display: 'none' }}>
                <span data-lat />
                <span data-lng />
            </div>
        </div>
    )
}

export default memo(ExploreMap)
