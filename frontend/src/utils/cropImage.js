/**
 * cropImage.js — Utility to produce a cropped circular-area Blob from
 * a source image URL + the crop/zoom metadata from react-easy-crop.
 *
 * Returns a File object ready to POST as multipart/form-data.
 */

/**
 * Create an HTMLImageElement from a URL (handles CORS).
 */
function createImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.addEventListener('load', () => resolve(img))
        img.addEventListener('error', (err) => reject(err))
        img.setAttribute('crossOrigin', 'anonymous')
        img.src = url
    })
}

/**
 * Given a source image URL and the croppedAreaPixels rectangle from
 * react-easy-crop, return a Blob (JPEG) of the cropped square.
 *
 * @param {string}  imageSrc          — object URL or data URL of the source
 * @param {Object}  croppedAreaPixels — { x, y, width, height } in real px
 * @param {string}  [fileName]        — output file name
 * @returns {Promise<File>}
 */
export default async function getCroppedImg(imageSrc, croppedAreaPixels, fileName = 'avatar.jpg') {
    const image = await createImage(imageSrc)

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // Output a square canvas matching the crop size (max 512px for perf)
    const outputSize = Math.min(croppedAreaPixels.width, 512)
    canvas.width = outputSize
    canvas.height = outputSize

    // Draw the cropped region scaled into the canvas
    ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        outputSize,
        outputSize,
    )

    // Convert canvas to Blob → File
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('Canvas toBlob failed'))
                    return
                }
                const file = new File([blob], fileName, { type: 'image/jpeg' })
                resolve(file)
            },
            'image/jpeg',
            0.92,
        )
    })
}

