import { useRef, useState, useCallback, useEffect } from 'react'
import { ImagePlus, X, Camera, ChevronLeft, ChevronRight } from 'lucide-react'

const MAX_IMAGES = 5
const SHOW_DURATION = 900 // ms to show the new image before sliding to "Add Photo"

/**
 * ImageUploader — Horizontal slider image uploader.
 *
 * Each slide is full-width (same width as the description field).
 * The last slide is always "Add Photo" when under the limit.
 * Arrow buttons navigate between slides.
 *
 * When images are added the slider:
 *   1. Jumps to the new image (confirms upload)
 *   2. After a short pause, smoothly slides to "Add Photo"
 *
 * Props:
 *   images   — { file, preview, id }[]
 *   onChange — (images) => void
 */

async function convertImage(file) {
    const img = document.createElement("img")
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target.result)
        reader.readAsDataURL(file)
    })

    img.src = dataUrl

    await new Promise(resolve => {
        img.onload = resolve
    })

    const MAX_WIDTH = 2000
    const scale = Math.min(1, MAX_WIDTH / img.width)

    canvas.width = img.width * scale
    canvas.height = img.height * scale

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    return new Promise(resolve => {
        canvas.toBlob(
            blob => resolve(blob),
            "image/jpeg",
            0.8
        )
    })
}

function ImageUploader({ images, onChange }) {
    const inputRef = useRef(null)
    const [dragOver, setDragOver] = useState(false)
    const [shake, setShake] = useState(false)
    const [activeSlide, setActiveSlide] = useState(0)
    /** Track whether we are in the "flash → slide" animation */
    const [animating, setAnimating] = useState(false)

    const atLimit = images.length >= MAX_IMAGES
    const totalSlides = images.length + (atLimit ? 0 : 1)

    /* ── Detect newly added images and run flash → slide animation ── */
    const prevLenRef = useRef(images.length)
    const timerRef = useRef(null)

    useEffect(() => {
        const prevLen = prevLenRef.current
        prevLenRef.current = images.length

        // New images added
        if (images.length > prevLen) {
            const firstNewIdx = prevLen // index of the first newly added image
            setAnimating(true)

            // 1. Instantly jump to the new image
            setActiveSlide(firstNewIdx)

            // 2. After a pause, slide to "Add Photo" (last slide) if not at limit
            clearTimeout(timerRef.current)
            const newTotal = images.length + (images.length >= MAX_IMAGES ? 0 : 1)
            const addPhotoIdx = newTotal - 1

            if (images.length < MAX_IMAGES) {
                timerRef.current = setTimeout(() => {
                    setActiveSlide(addPhotoIdx)
                    setAnimating(false)
                }, SHOW_DURATION)
            } else {
                // At limit — stay on the last image
                setAnimating(false)
            }
            return
        }

        // Images removed — clamp activeSlide
        if (images.length < prevLen) {
            setActiveSlide((s) => Math.min(s, Math.max(0, totalSlides - 1)))
        }

        return () => clearTimeout(timerRef.current)
    }, [images.length, totalSlides])

    /* ── Clean up timer on unmount ── */
    useEffect(() => () => clearTimeout(timerRef.current), [])

    /* ── File handling ── */
    const addFiles = useCallback(async (files) => {
        const remaining = MAX_IMAGES - images.length

        if (remaining <= 0) {
            setShake(true)
            setTimeout(() => setShake(false), 500)
            return
        }

        const validFiles = Array.from(files)
            .filter(f => f.type.startsWith('image/'))
            .slice(0, remaining)

        const processedImages = (await Promise.all(
            validFiles.map(async (file) => {
                const convertedBlob = await convertImage(file)

                if (!convertedBlob) return null

                const newFile = new File(
                    [convertedBlob],
                    file.name.replace(/\.\w+$/, ".jpg"),
                    { type: "image/jpeg" }
                )

                return {
                    file: newFile,
                    preview: URL.createObjectURL(newFile),
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                }
            })
        )).filter(Boolean)

        onChange([...images, ...processedImages])
    }, [images, onChange])

    const removeImage = useCallback((index) => {
        const removed = images[index]
        if (removed?.preview) URL.revokeObjectURL(removed.preview)
        onChange(images.filter((_, i) => i !== index))
    }, [images, onChange])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        setDragOver(false)
        addFiles(e.dataTransfer.files)
    }, [addFiles])

    const handleDragOver = (e) => { e.preventDefault(); setDragOver(true) }
    const handleDragLeave = () => setDragOver(false)

    const handleInputChange = (e) => {
        addFiles(e.target.files)
        e.target.value = ''
    }

    const goPrev = () => {
        if (animating) return
        setActiveSlide((s) => Math.max(0, s - 1))
    }
    const goNext = () => {
        if (animating) return
        setActiveSlide((s) => Math.min(totalSlides - 1, s + 1))
    }

    /* ── Use CSS transform instead of scrollTo for reliable positioning ── */
    const translateX = -(activeSlide * 100)

    return (
        <div className="create-images">
            <label className="create-field__label">
                <Camera size={14} />
                Photos
                <span className={`create-images__counter ${atLimit ? 'create-images__counter--limit' : ''}`}>
                    {images.length}/{MAX_IMAGES}
                </span>
            </label>

            {/* ── Slider wrapper ── */}
            <div className={`create-images__slider ${shake ? 'create-images__slider--shake' : ''}`}>
                <div
                    className="create-images__track"
                    style={{
                        transform: `translateX(${translateX}%)`,
                        transition: animating
                            ? 'none'
                            : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                >
                    {/* Image slides */}
                    {images.map((img, i) => (
                        <div key={img.id} className="create-images__slide">
                            <img src={img.preview} alt={`Upload ${i + 1}`} className="create-images__img" />
                            <button
                                type="button"
                                className="create-images__remove"
                                onClick={() => removeImage(i)}
                                aria-label="Remove image"
                            >
                                <X size={14} />
                            </button>
                            {i === 0 && <span className="create-images__cover-badge">Cover</span>}
                        </div>
                    ))}

                    {/* Add Photo slide (always last when under limit) */}
                    {!atLimit && (
                        <div
                            className={`create-images__slide create-images__slide--add ${dragOver ? 'create-images__slide--drag' : ''}`}
                            onClick={() => inputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                        >
                            <ImagePlus size={32} />
                            <span>Add Photo</span>
                        </div>
                    )}
                </div>

                {/* ── Dots indicator ── */}
                {totalSlides > 1 && (
                    <div className="create-images__dots">
                        {Array.from({ length: totalSlides }).map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                className={`create-images__dot ${i === activeSlide ? 'create-images__dot--active' : ''}`}
                                onClick={() => { if (!animating) setActiveSlide(i) }}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* ── Navigation arrows ── */}
                {totalSlides > 1 && (
                    <div className="create-images__arrows">
                        <button
                            type="button"
                            className={`create-images__arrow ${activeSlide === 0 ? 'create-images__arrow--disabled' : ''}`}
                            onClick={goPrev}
                            disabled={activeSlide === 0 || animating}
                            aria-label="Previous"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            type="button"
                            className={`create-images__arrow ${activeSlide === totalSlides - 1 ? 'create-images__arrow--disabled' : ''}`}
                            onClick={goNext}
                            disabled={activeSlide === totalSlides - 1 || animating}
                            aria-label="Next"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleInputChange}
            />

            {atLimit && (
                <p className="create-images__limit-msg">Maximum of {MAX_IMAGES} photos reached</p>
            )}
        </div>
    )
}

export default ImageUploader

