/**
 * countryOverlays.js — WildLog
 * Country borders, country labels and city labels for CesiumJS.
 */
import * as Cesium from 'cesium'

// ── Data sources ─────────────────────────────────────────────────
// ne_110m_admin_0_boundary_lines_land → only shared land borders, no coastlines
const LOCAL_BORDERS   = `${import.meta.env.BASE_URL}data/ne_110m_admin_0_boundary_lines_land.geojson`
const LOCAL_COUNTRIES = `${import.meta.env.BASE_URL}data/ne_110m_admin_0_countries.geojson`
const LOCAL_CITIES    = `${import.meta.env.BASE_URL}data/ne_110m_populated_places_simple.geojson`

const CDN_BORDERS = [
    'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_110m_admin_0_boundary_lines_land.geojson',
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_boundary_lines_land.geojson',
]
const CDN_COUNTRIES = [
    'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_110m_admin_0_countries.geojson',
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',
]
const CDN_CITIES = [
    'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_110m_populated_places_simple.geojson',
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_populated_places_simple.geojson',
]

// ── Palette (matches WildLog dark-green globe) ───────────────────
const BORDER      = Cesium.Color.fromCssColorString('#c8b898').withAlpha(0.80)
const LABEL_FILL  = Cesium.Color.fromCssColorString('#ede7db').withAlpha(0.92)
const LABEL_SHADE = Cesium.Color.fromCssColorString('#060c08').withAlpha(0.88)
const CITY_FILL   = Cesium.Color.fromCssColorString('#c8bfb2').withAlpha(0.84)
const CITY_SHADE  = Cesium.Color.fromCssColorString('#060c08').withAlpha(0.90)
const CITY_DOT    = Cesium.Color.fromCssColorString('#9b805d').withAlpha(0.80)

// ── Helpers ──────────────────────────────────────────────────────
function ringCentroid(ring) {
    const n = (ring.at(-1)[0] === ring[0][0] && ring.at(-1)[1] === ring[0][1])
        ? ring.length - 1 : ring.length
    let lng = 0, lat = 0
    for (let i = 0; i < n; i++) { lng += ring[i][0]; lat += ring[i][1] }
    return { lng: lng / n, lat: lat / n }
}

function largestRingCentroid(coords) {
    let best = coords[0][0]
    for (const poly of coords) if (poly[0].length > best.length) best = poly[0]
    return ringCentroid(best)
}

function labelTier(props) {
    const rank = Number(props?.LABELRANK ?? props?.labelrank ?? 5)
    if (rank <= 2) return { size: '20px', weight: '600' }
    if (rank <= 4) return { size: '16px', weight: '500' }
    return              { size: '13px', weight: '500' }
}

async function fetchGeoJSON(local, mirrors) {
    try {
        const r = await fetch(local)
        if (r.ok) return r.json()
    } catch { /* fall through */ }

    for (const url of mirrors) {
        try {
            const r = await fetch(url)
            if (r.ok) return r.json()
        } catch { /* next mirror */ }
    }
    throw new Error(`[WildLog] GeoJSON unavailable: ${local}`)
}

// ── Borders ──────────────────────────────────────────────────────
// Uses ne_110m_admin_0_boundary_lines_land (LineString / MultiLineString).
// That dataset contains ONLY shared land borders — coastlines are absent by
// design, giving the same behaviour as Google Maps.
function addBorders(viewer, geojson) {
    const instances = []

    for (const { geometry: geom } of geojson.features) {
        if (!geom) continue

        // boundary_lines_land features are LineString or MultiLineString
        const lines = geom.type === 'LineString'
            ? [geom.coordinates]
            : geom.type === 'MultiLineString'
                ? geom.coordinates
                : []

        for (const line of lines) {
            if (line.length < 2) continue
            instances.push(new Cesium.GeometryInstance({
                geometry: new Cesium.GroundPolylineGeometry({
                    positions: line.map(([lng, lat]) =>
                        Cesium.Cartesian3.fromDegrees(lng, lat)),
                    width: 2,
                }),
            }))
        }
    }

    if (!instances.length || viewer.isDestroyed()) return

    viewer.scene.groundPrimitives.add(
        new Cesium.GroundPolylinePrimitive({
            geometryInstances: instances,
            appearance: new Cesium.PolylineMaterialAppearance({
                material: Cesium.Material.fromType('Color', { color: BORDER }),
            }),
        })
    )
}

// ── Country labels ────────────────────────────────────────────────
function addCountryLabels(viewer, geojson) {
    for (const { properties: props, geometry: geom } of geojson.features) {
        const name = props?.NAME ?? props?.name ?? props?.ADMIN
        if (!name || !geom) continue

        let c
        if      (geom.type === 'Polygon')      c = ringCentroid(geom.coordinates[0])
        else if (geom.type === 'MultiPolygon') c = largestRingCentroid(geom.coordinates)
        if (!c) continue

        const { size, weight } = labelTier(props)

        viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(c.lng, c.lat),
            label: {
                text:         name.toUpperCase(),
                font:         `${weight} ${size} Figtree, Inter, system-ui, sans-serif`,
                fillColor:    LABEL_FILL,
                outlineColor: LABEL_SHADE,
                outlineWidth: 2.5,
                style:        Cesium.LabelStyle.FILL_AND_OUTLINE,

                verticalOrigin:   Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,

                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 12_000_000),
                scaleByDistance:          new Cesium.NearFarScalar(250_000, 1.05, 8_500_000, 0.18),
                translucencyByDistance:   new Cesium.NearFarScalar(200_000, 1.0,  7_000_000, 0.0),
            },
            properties: { _countryLabel: true },
        })
    }
}

// ── City labels (async, non-blocking) ────────────────────────────
async function addCityLabels(viewer) {
    let geojson
    try { geojson = await fetchGeoJSON(LOCAL_CITIES, CDN_CITIES) }
    catch { return }
    if (viewer.isDestroyed()) return

    const ds = new Cesium.CustomDataSource('wildlog-city-labels')

    for (const { properties: p, geometry: geom } of geojson.features) {
        if (viewer.isDestroyed()) break
        const name = p?.NAME ?? p?.name
        if (!name || geom?.type !== 'Point') continue

        const isCapital = Number(p.ADM0CAP)  >= 1
        const isMega    = Number(p.MEGACITY) >= 1
        const isMajor   = Number(p.POP_MAX)  >= 3_000_000
        if (!isCapital && !isMega && !isMajor) continue

        const [lng, lat] = geom.coordinates

        ds.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lng, lat),
            point: {
                pixelSize:    isCapital ? 4.5 : 3.0,
                color:        CITY_DOT,
                outlineColor: CITY_SHADE,
                outlineWidth: 1.2,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 1_800_000),
                scaleByDistance:          new Cesium.NearFarScalar(50_000, 1.4, 1_600_000, 0.4),
                translucencyByDistance:   new Cesium.NearFarScalar(80_000, 1.0, 1_700_000, 0.0),
            },
            label: {
                text:         name,
                font:         isCapital
                    ? '500 12px Figtree, Inter, system-ui, sans-serif'
                    : '400 11px Figtree, Inter, system-ui, sans-serif',
                fillColor:    CITY_FILL,
                outlineColor: CITY_SHADE,
                outlineWidth: 2.0,
                style:        Cesium.LabelStyle.FILL_AND_OUTLINE,

                verticalOrigin:   Cesium.VerticalOrigin.BOTTOM,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                pixelOffset:      new Cesium.Cartesian2(0, -6),

                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2_000_000),
                scaleByDistance:          new Cesium.NearFarScalar(50_000, 1.0, 1_800_000, 0.25),
                translucencyByDistance:   new Cesium.NearFarScalar(100_000, 1.0, 1_800_000, 0.0),
            },
            properties: { _cityLabel: true },
        })
    }

    if (!viewer.isDestroyed()) viewer.dataSources.add(ds)
}

// ── Public API ────────────────────────────────────────────────────
/**
 * Load country borders, country labels, and city labels onto the Viewer.
 * Call once after Viewer initialisation. Non-blocking — failures are silent.
 *
 * @param  {Cesium.Viewer} viewer
 * @returns {Promise<true|null>}
 */
export async function loadCountryOverlays(viewer) {
    if (!viewer || viewer.isDestroyed()) return null

    try {
        // Fetch in parallel: land borders (no coastlines) + countries (for labels only)
        const [borders, countries] = await Promise.all([
            fetchGeoJSON(LOCAL_BORDERS,   CDN_BORDERS),
            fetchGeoJSON(LOCAL_COUNTRIES, CDN_COUNTRIES),
        ])
        if (viewer.isDestroyed()) return null

        addBorders(viewer, borders)
        addCountryLabels(viewer, countries)
        addCityLabels(viewer).catch(() => {})

        return true
    } catch (err) {
        console.warn('[WildLog] Country overlays failed:', err.message)
        return null
    }
}

