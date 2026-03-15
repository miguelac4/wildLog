import { useEffect, useRef, useState } from 'react'
import { MapPin, Compass } from 'lucide-react'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import '../../styles/Account.css'

function AccountMap({ posts = [] }) {
    const cesiumContainerRef = useRef(null)
    const viewerRef = useRef(null)
    const [globeReady, setGlobeReady] = useState(false)

    // Usamos os posts de placeholder caso a prop venha vazia
    const mapPosts = posts.length > 0 ? posts : [
        { id: 101, lat: 40.3215, lng: -7.6128 },
        { id: 102, lat: 37.0194, lng: -7.8322 },
        { id: 103, lat: 41.7215, lng: -8.1528 }
    ]

    useEffect(() => {
        if (!cesiumContainerRef.current) return

        let destroyed = false
        window.CESIUM_BASE_URL = `${import.meta.env.BASE_URL}cesium/`

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
                contextOptions: { webgl: { alpha: true } },
            })

            viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT
            viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0a1f14')

            // Adicionar os Pinos do Utilizador
            mapPosts.forEach((post) => {
                viewer.entities.add({
                    position: Cesium.Cartesian3.fromDegrees(post.lng, post.lat),
                    billboard: {
                        image: `${window.CESIUM_BASE_URL}Assets/Textures/maki/marker.png`,
                        width: 24,
                        height: 24,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        color: Cesium.Color.fromCssColorString('#a0845f'), // Pino Dourado
                    }
                })
            })

            // Focar a câmara em Portugal por defeito
            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(-8.0, 39.5, 1500000),
                duration: 0,
            })

            viewerRef.current = viewer
            setGlobeReady(true)
        }).catch(err => console.error('Erro Cesium na Conta:', err))

        return () => {
            destroyed = true
            if (viewerRef.current && !viewerRef.current.isDestroyed()) {
                viewerRef.current.destroy()
            }
        }
    }, [mapPosts])

    return (
        <>
            <h3 className="account-section-title" style={{ padding: '1.5rem 1.5rem 0' }}>
                <MapPin size={20} />
                O Meu Mapa
            </h3>

            <div className="account-cesium-wrapper">
                <div ref={cesiumContainerRef} className="account-cesium-container" />

                {!globeReady && (
                    <div className="account-cesium-loading">
                        <Compass size={24} className="spin-animation" />
                        <p>A carregar satélite...</p>
                    </div>
                )}
            </div>
        </>
    )
}

export default AccountMap