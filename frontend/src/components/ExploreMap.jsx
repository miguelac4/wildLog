import { useState, useRef, useEffect } from 'react'
import { MapPin, Compass } from 'lucide-react'

function ExploreMap({ posts, regions, onPostClick, activeView }) {
    const [globeReady, setGlobeReady] = useState(false)

    const cesiumContainerRef = useRef(null)
    const viewerRef = useRef(null)
    const coordsRef = useRef(null)
    const cursorCoordsRef = useRef(null)

    useEffect(() => {
        if (activeView !== 'explore') {
            setGlobeReady(false)

            if (viewerRef.current && !viewerRef.current.isDestroyed()) {
                viewerRef.current.destroy()
            }

            viewerRef.current = null
            return
        }

        const container = cesiumContainerRef.current
        if (!container) return

        setGlobeReady(false)
        let destroyed = false
        let handler = null

        import('cesium').then((Cesium) => {
            if (destroyed || !cesiumContainerRef.current) return

            Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN

            const viewer = new Cesium.Viewer(cesiumContainerRef.current, {
                animation: false,
                baseLayerPicker: false,
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
                skyBox: false,
                skyAtmosphere: new Cesium.SkyAtmosphere(),
                contextOptions: {
                    webgl: { alpha: true },
                },
            })

            viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT
            viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0a1f14')

            posts.forEach((post) => {
                viewer.entities.add({
                    position: Cesium.Cartesian3.fromDegrees(post.lng, post.lat),
                    billboard: {
                        image: Cesium.buildModuleUrl('Assets/Textures/maki/marker.png'),
                        width: 32,
                        height: 32,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        color: Cesium.Color.fromCssColorString('#a0845f'),
                    },
                    properties: {
                        postId: post.id,
                    },
                })
            })

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

            handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

            handler.setInputAction((movement) => {
                const picked = viewer.scene.pick(movement.position)
                if (Cesium.defined(picked) && picked.id?.properties?.postId) {
                    const postId = picked.id.properties.postId.getValue()
                    const post = posts.find((p) => p.id === postId)
                    if (post) onPostClick(post)
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

            handler.setInputAction((movement) => {
                const cartesian = viewer.camera.pickEllipsoid(
                    movement.endPosition,
                    viewer.scene.globe.ellipsoid
                )

                const el = coordsRef.current

                if (cartesian) {
                    const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
                    const lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4)
                    const lng = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4)

                    cursorCoordsRef.current = { lat, lng }

                    if (el) {
                        el.style.display = ''
                        el.querySelector('[data-lat]').textContent = `${lat}° N`
                        el.querySelector('[data-lng]').textContent = `${lng}° W`
                    }
                } else {
                    cursorCoordsRef.current = null
                    if (el) el.style.display = 'none'
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(-8.0, 39.5, 2000000),
                duration: 0,
            })

            viewerRef.current = viewer
            setGlobeReady(true)

            setTimeout(() => {
                if (viewerRef.current && !viewerRef.current.isDestroyed()) {
                    viewerRef.current.resize()
                }
            }, 0)
        })

        return () => {
            destroyed = true
            setGlobeReady(false)

            if (handler) {
                handler.destroy()
            }

            if (viewerRef.current && !viewerRef.current.isDestroyed()) {
                viewerRef.current.destroy()
            }

            viewerRef.current = null
        }
    }, [activeView, posts, regions, onPostClick])

    return (
        <div className="main-globe">
            <div ref={cesiumContainerRef} className="main-globe__viewer">
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
                                    left: `${((post.lng + 10) / 4) * 100}%`,
                                    top: `${((42 - post.lat) / 8) * 100}%`,
                                }}
                                onClick={() => onPostClick(post)}
                                title={post.title}
                            >
                                <MapPin size={20} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="main-globe__vignette" />

            <div ref={coordsRef} className="main-globe__coords" style={{ display: 'none' }}>
                <span data-lat />
                <span data-lng />
            </div>
        </div>
    )
}

export default ExploreMap