import { useState, useCallback, useMemo } from 'react'
import { Send, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import ImageUploader from './ImageUploader'
import MapPicker from './MapPicker'
import TagInput from './TagInput'
import useLenisContainer from '../../hooks/useLenisContainer'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * CreateView — Full create-post form.
 *
 * Uses the existing sub-components:
 *   - ImageUploader  (photo grid with drag & drop)
 *   - MapPicker      (Cesium globe location picker)
 *   - TagInput       (tag chips)
 *
 * Props:
 *   onCreated — optional callback after successful creation
 */
function CreateView({ onCreated }) {
    /* ── Form state ── */
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [images, setImages] = useState([])           // { file, preview, id }[]
    const [tags, setTags] = useState([])               // string[]
    const [lat, setLat] = useState(null)
    const [lng, setLng] = useState(null)
    const [visibility, setVisibility] = useState('public')

    /* ── UI state ── */
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    /* ── Lenis smooth scroll for the form ── */
    const lenisOpts = useMemo(() => ({
        lerp: 0.08,
        duration: 1.4,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.5,
    }), [])
    const { wrapperRef: scrollRef } = useLenisContainer(lenisOpts)

    /* ── Location handler ── */
    const handleLocationChange = useCallback(({ lat: newLat, lng: newLng }) => {
        setLat(newLat)
        setLng(newLng)
    }, [])

    /* ── Submit ── */
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        /* Client-side validation */
        if (!title.trim()) { setError('Title is required.'); return }
        if (images.length === 0) { setError('At least one photo is required.'); return }
        if (lat == null || lng == null) { setError('Please select a location on the map.'); return }

        setSubmitting(true)

        try {
            const formData = new FormData()
            formData.append('title', title.trim())
            formData.append('description', description.trim())
            formData.append('lat', lat)
            formData.append('lng', lng)
            formData.append('visibility', visibility)

            tags.forEach((tag, i) => formData.append(`tags[${i}]`, tag))
            images.forEach((img) => formData.append('images[]', img.file))

            const res = await fetch(`${API_BASE_URL}/post/user/create.php`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data?.message || 'Failed to create post.')
            }

            setSuccess('Post created successfully!')

            /* Reset form */
            setTitle('')
            setDescription('')
            setImages([])
            setTags([])
            setLat(null)
            setLng(null)
            setVisibility('public')

            onCreated?.(data)
        } catch (err) {
            setError(err.message || 'Something went wrong.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="create-view" ref={scrollRef}>
            <div className="create-view__container">

                <div className="create-view__header">
                    <h2 className="create-view__title">Create Post</h2>
                    <p className="create-view__subtitle">
                        Share a place you discovered with the WildLog community.
                    </p>
                </div>

                {/* ── Alerts ── */}
                {error && (
                    <div className="create-view__alert create-view__alert--error">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}
                {success && (
                    <div className="create-view__alert create-view__alert--success">
                        <CheckCircle size={16} />
                        <span>{success}</span>
                    </div>
                )}

                <form className="create-view__form" onSubmit={handleSubmit}>

                    {/* ── Title ── */}
                    <div className="create-field">
                        <label className="create-field__label" htmlFor="create-title">Title</label>
                        <input
                            id="create-title"
                            type="text"
                            className="create-field__input"
                            placeholder="Give your post a title…"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                        />
                        <span className="create-field__counter">{title.length}/100</span>
                    </div>

                    {/* ── Description ── */}
                    <div className="create-field">
                        <label className="create-field__label" htmlFor="create-desc">Description</label>
                        <textarea
                            id="create-desc"
                            className="create-field__textarea"
                            placeholder="Describe the place, the experience, the wildlife…"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                        />
                    </div>

                    {/* ── Images ── */}
                    <ImageUploader images={images} onChange={setImages} />

                    {/* ── Map location ── */}
                    <MapPicker lat={lat} lng={lng} onLocationChange={handleLocationChange} />

                    {/* ── Tags ── */}
                    <TagInput tags={tags} onChange={setTags} />

                    {/* ── Visibility ── */}
                    <div className="create-field">
                        <label className="create-field__label">Visibility</label>
                        <div className="create-visibility">
                            <button
                                type="button"
                                className={`create-visibility__btn ${visibility === 'public' ? 'create-visibility__btn--active' : ''}`}
                                onClick={() => setVisibility('public')}
                            >
                                <Eye size={14} />
                                Public
                            </button>
                            <button
                                type="button"
                                className={`create-visibility__btn ${visibility === 'private' ? 'create-visibility__btn--active' : ''}`}
                                onClick={() => setVisibility('private')}
                            >
                                <EyeOff size={14} />
                                Private
                            </button>
                        </div>
                        {visibility === 'public' && (
                            <p className="create-field__hint">
                                Public posts are subject to environmental review before appearing.
                            </p>
                        )}
                    </div>

                    {/* ── Submit ── */}
                    <button
                        type="submit"
                        className="create-view__submit"
                        disabled={submitting}
                    >
                        <Send size={16} />
                        {submitting ? 'Publishing…' : 'Publish Post'}
                    </button>

                </form>
            </div>
        </div>
    )
}

export default CreateView

