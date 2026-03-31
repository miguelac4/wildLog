/**
 * download-geodata.js
 * Downloads Natural Earth GeoJSON files needed by countryOverlays.js
 * Run: node scripts/download-geodata.js
 */
const https = require('https')
const fs    = require('fs')
const path  = require('path')

const DATA_DIR = path.join(__dirname, '..', 'public', 'data')

const FILES = [
    {
        url:  'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson',
        dest: 'ne_110m_admin_0_countries.geojson',
    },
    {
        // Land borders only — no coastlines (Google Maps style)
        url:  'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_boundary_lines_land.geojson',
        dest: 'ne_110m_admin_0_boundary_lines_land.geojson',
    },
    {
        url:  'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_populated_places_simple.geojson',
        dest: 'ne_110m_populated_places_simple.geojson',
    },
]

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    console.log('Created directory:', DATA_DIR)
}

function download(url, destFile) {
    return new Promise((resolve, reject) => {
        const fullPath = path.join(DATA_DIR, destFile)

        if (fs.existsSync(fullPath)) {
            const size = fs.statSync(fullPath).size
            if (size > 10_000) {
                console.log(`✓ Already exists: ${destFile} (${(size / 1024).toFixed(0)} KB)`)
                return resolve()
            }
        }

        console.log(`⬇  Downloading: ${destFile} …`)
        const file = fs.createWriteStream(fullPath)

        function get(url) {
            https.get(url, (res) => {
                if (res.statusCode === 301 || res.statusCode === 302) {
                    return get(res.headers.location)
                }
                if (res.statusCode !== 200) {
                    file.close()
                    fs.unlinkSync(fullPath)
                    return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
                }
                res.pipe(file)
                file.on('finish', () => {
                    file.close()
                    const size = fs.statSync(fullPath).size
                    console.log(`✓ Saved: ${destFile} (${(size / 1024).toFixed(0)} KB)`)
                    resolve()
                })
            }).on('error', (err) => {
                file.close()
                if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
                reject(err)
            })
        }

        get(url)
    })
}

async function main() {
    console.log('WildLog — Geo data download\n')
    for (const f of FILES) {
        await download(f.url, f.dest).catch(err => {
            console.error(`✗ Failed to download ${f.dest}:`, err.message)
        })
    }
    console.log('\nDone.')
}

main()

