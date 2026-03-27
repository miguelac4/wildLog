/**
 * countryOverlays.js
 * ──────────────────────────────────────────────────────────────────
 * Loads country boundaries and name labels onto a CesiumJS Viewer.
 *
 * Data source: Natural Earth 110m admin-0 countries GeoJSON (~530 KB).
 * Fetched once from jsdelivr CDN, cached by the browser.
 *
 * Visual style:
 *  • Thin, subtle earth-tone boundary lines
 *  • Uppercase country name labels that fade by altitude
 *  • Matches the WildLog dark-globe aesthetic
 * ──────────────────────────────────────────────────────────────────
 */
import * as Cesium from 'cesium'

/* ── Data URL ────────────────────────────────────────────────────── */
// Natural Earth 110m (lightest resolution — fast load, global coverage)
const LOCAL_URL = `${import.meta.env.BASE_URL}data/ne_110m_admin_0_countries.geojson`
const CDN_URL =
    'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson'

/* ── Color palette (WildLog dark theme) ──────────────────────────── */
const BORDER_COLOR  = Cesium.Color.fromCssColorString('#8b7355').withAlpha(0.28)
const FILL_COLOR    = Cesium.Color.fromCssColorString('#111f17').withAlpha(0.035)
const LABEL_FILL    = Cesium.Color.fromCssColorString('#c8c0b4').withAlpha(0.50)
const LABEL_OUTLINE = Cesium.Color.fromCssColorString('#060d09').withAlpha(0.85)

/* ── Centroid helpers ────────────────────────────────────────────── */

/** Average of ring vertices (skip closing duplicate). */
function ringCentroid(ring) {
    const n = ring[ring.length - 1][0] === ring[0][0] &&
              ring[ring.length - 1][1] === ring[0][1]
        ? ring.length - 1
        : ring.length

    let lngSum = 0
    let latSum = 0
    for (let i = 0; i < n; i++) {
        lngSum += ring[i][0]
        latSum += ring[i][1]
    }
    return { lng: lngSum / n, lat: latSum / n }
}

/** For MultiPolygon, pick the largest polygon by vertex count. */
function largestPolygonCentroid(coordinates) {
    let bestRing = coordinates[0][0]
    for (const polygon of coordinates) {
        if (polygon[0].length > bestRing.length) bestRing = polygon[0]
    }
    return ringCentroid(bestRing)
}

/* ── Main loader ─────────────────────────────────────────────────── */

/**
 * Load country boundaries + name labels onto the Cesium Viewer.
 *
 * Call once after Viewer initialisation.
 * Non-blocking — failures are logged but never break the map.
 *
 * @param {Cesium.Viewer} viewer
 * @returns {Promise<Cesium.GeoJsonDataSource|null>}
 */
export async function loadCountryOverlays(viewer) {
    if (!viewer || viewer.isDestroyed()) return null

    try {
        /* ── 1  Fetch GeoJSON (local first, CDN fallback) ───────── */
        let geojson
        try {
            const localRes = await fetch(LOCAL_URL)
            if (localRes.ok) {
                geojson = await localRes.json()
            }
        } catch { /* ignore — try CDN */ }

        if (!geojson) {
            const cdnRes = await fetch(CDN_URL)
            if (!cdnRes.ok) throw new Error(`CDN fetch failed: ${cdnRes.status}`)
            geojson = await cdnRes.json()
        }

        // Guard: viewer may have been destroyed while we were fetching
        if (viewer.isDestroyed()) return null

        /* ── 2  Boundaries via GeoJsonDataSource ────────────────── */
        const ds = await Cesium.GeoJsonDataSource.load(geojson, {
            stroke: Cesium.Color.fromCssColorString('#d6d0c4').withAlpha(0.7),
            strokeWidth: 1.8,
            clampToGround: true,
        })

        if (viewer.isDestroyed()) return null

        // Fine-tune each polygon entity
        for (const entity of ds.entities.values) {
            if (entity.polygon) {
                entity.polygon.outline = true
                entity.polygon.outlineColor = Cesium.Color.fromCssColorString('#d6d0c4').withAlpha(0.7)
                entity.polygon.material = Cesium.Color.TRANSPARENT

                entity.polygon.height = 0
                entity.polygon.perPositionHeight = false

                // 🔥 Glow fake (shadow line)
                entity.polyline = new Cesium.PolylineGraphics({
                    positions: entity.polygon.hierarchy.getValue().positions,
                    width: 3.5,
                    material: Cesium.Color.fromCssColorString('#000000').withAlpha(0.25),
                })
            }
            // Remove any auto-generated labels/billboards from the data source
            entity.label     = undefined
            entity.billboard = undefined
            entity.point     = undefined
        }

        viewer.dataSources.add(ds)

        /* ── 3  Country name labels ─────────────────────────────── */
        for (const feature of geojson.features) {
            const name = feature.properties?.NAME
                      || feature.properties?.name
                      || feature.properties?.ADMIN
            if (!name) continue

            const geom = feature.geometry
            let centroid

            if (geom.type === 'Polygon') {
                centroid = ringCentroid(geom.coordinates[0])
            } else if (geom.type === 'MultiPolygon') {
                centroid = largestPolygonCentroid(geom.coordinates)
            }
            if (!centroid) continue

            viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(centroid.lng, centroid.lat),
                label: {
                    text:  name.toUpperCase(),
                    font: '22px Figtree, Inter, system-ui, sans-serif',
                    fillColor:    LABEL_FILL,
                    outlineColor: LABEL_OUTLINE,
                    outlineWidth: 3,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,

                    verticalOrigin:   Cesium.VerticalOrigin.CENTER,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,

                    // Always render on top (never hidden behind terrain)
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,

                    // Visible only at "country-level" zoom (300 km – 9 000 km)
                    distanceDisplayCondition:
                        new Cesium.DistanceDisplayCondition(0, 20_000_000),

                    // Shrink as the camera pulls away
                    scaleByDistance:
                        new Cesium.NearFarScalar(300_000, 1.05, 9_000_000, 0.40),

                    // Fade out at extreme distances
                    translucencyByDistance:
                        new Cesium.NearFarScalar(300_000, 0.85, 9_000_000, 0.15),

                    pixelOffset: new Cesium.Cartesian2(0, 0),
                },
                properties: { _countryLabel: true },
            })
        }

        return ds
    } catch (err) {
        console.warn('[WildLog] Country overlays failed to load:', err.message)
        return null
    }
}

