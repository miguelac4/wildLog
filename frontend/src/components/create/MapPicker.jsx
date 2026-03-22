import { useRef, useEffect, useState, useCallback } from 'react'
import { MapPin, Navigation, Loader } from 'lucide-react'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

/**
 * MapPicker — Cesium globe to pick lat/lng by clicking.
 *
 * Props:
 *   lat         — number | null
 *   lng         — number | null
 *   onLocationChange — ({ lat, lng }) => void
 *   onMapHover  — (hovering: boolean) => void  — tells parent to stop/start scroll
 */
function MapPicker({ lat, lng, onLocationChange, onMapHover }) {
    const containerRef = useRef(null)
    const viewerRef = useRef(null)
    const pinRef = useRef(null)
    const [ready, setReady] = useState(false)
    const [locating, setLocating] = useState(false)

    /* ── Initialize Cesium viewer (once) ── */
    useEffect(() => {
        const container = containerRef.current
        if (!container || viewerRef.current) return

        window.CESIUM_BASE_URL = `${import.meta.env.BASE_URL}cesium/`
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
        })

        // Block Maximum Zoom Distance
        const controller = viewer.scene.screenSpaceCameraController
        controller.maximumZoomDistance = 7000000

        viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#060d09')
        viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0a1f14')
        viewer.scene.globe.maximumScreenSpaceError = 2
        viewer.scene.fog.enabled = false
        viewer.scene.globe.enableLighting = false
        viewer.scene.skyAtmosphere = undefined

        // Fly to default position (Iberian Peninsula)
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(-8.0, 39.5, 4000000),
            duration: 0,
        })

        // Click handler — pick location
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
        handler.setInputAction((movement) => {
            const cartesian = viewer.camera.pickEllipsoid(
                movement.position,
                viewer.scene.globe.ellipsoid
            )
            if (!cartesian) return

            const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
            const pickedLat = Cesium.Math.toDegrees(cartographic.latitude)
            const pickedLng = Cesium.Math.toDegrees(cartographic.longitude)

            onLocationChange({
                lat: Number(pickedLat.toFixed(6)),
                lng: Number(pickedLng.toFixed(6)),
            })
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

        viewerRef.current = viewer
        setReady(true)

        return () => {
            handler.destroy()
            if (viewerRef.current && !viewerRef.current.isDestroyed()) {
                viewerRef.current.destroy()
            }
            viewerRef.current = null
        }
    }, [])

    /* ── Update pin when lat/lng change ── */
    useEffect(() => {
        const viewer = viewerRef.current
        if (!viewer || viewer.isDestroyed()) return

        // Remove previous pin
        if (pinRef.current) {
            viewer.entities.remove(pinRef.current)
            pinRef.current = null
        }

        if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
            pinRef.current = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(lng, lat),
                billboard: {
                    image: `${window.CESIUM_BASE_URL}Assets/Textures/maki/marker.png`,
                    width: 36,
                    height: 36,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    color: Cesium.Color.fromCssColorString('#C8A97E'),
                    scale: 1.3,
                },
            })

            // Smooth fly to selected location
            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(lng, lat, 500000),
                duration: 1.2,
                easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
            })
        }
    }, [lat, lng])

    /* ── Use current location ── */
    const handleUseCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) return

        setLocating(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                onLocationChange({
                    lat: Number(pos.coords.latitude.toFixed(6)),
                    lng: Number(pos.coords.longitude.toFixed(6)),
                })
                setLocating(false)
            },
            () => {
                setLocating(false)
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }, [onLocationChange])

    const hasLocation = lat != null && lng != null

    return (
        <div className="create-map">
            <label className="create-field__label">
                <MapPin size={14} />
                Location
            </label>

            <div
                className="create-map__container"
                data-lenis-prevent
            >
                <div ref={containerRef} className="create-map__viewer" />

                {/* Hide Cesium default UI */}
                {!ready && (
                    <div className="create-map__loading">
                        <Loader size={20} className="create-map__spinner" />
                        <span>Loading map…</span>
                    </div>
                )}

                {/* Instructions overlay */}
                {ready && !hasLocation && (
                    <div className="create-map__hint">
                        <MapPin size={16} />
                        <span>Click on the map to set location</span>
                    </div>
                )}
            </div>

            {/* Location info + actions */}
            <div className="create-map__footer">
                <button
                    type="button"
                    className="create-map__gps-btn"
                    onClick={handleUseCurrentLocation}
                    disabled={locating}
                >
                    {locating ? (
                        <Loader size={14} className="create-map__spinner" />
                    ) : (
                        <Navigation size={14} />
                    )}
                    {locating ? 'Locating…' : 'Use current location'}
                </button>

                {hasLocation && (
                    <div className="create-map__coords">
                        <span>{lat}° N</span>
                        <span className="create-map__coords-sep">·</span>
                        <span>{lng}° W</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MapPicker

