import { X, Plus, Trash2, Camera, Save } from 'lucide-react'
import { useState } from 'react'
import { postUserService } from '../api/postUserService'
import { normalizeImageUrl } from '../config/mediaConfig'
import '../styles/Account.css'

/**
 * EditPostModal — Dark-themed modal for editing a user's post.
 *
 * Supports:
 *   - Edit title, description, visibility (editPostBasic)
 *   - Add/remove tags (addPostTag / deletePostTag)
 *   - Upload/remove images (uploadPostImg / deletePostImg)
 *   - Delete post (deletePost)
 */
export default function EditPostModal({ post, onClose, onUpdate }) {
    const [title, setTitle] = useState(post.title || '')
    const [description, setDescription] = useState(post.description || '')
    const [visibility, setVisibility] = useState(post.visibility || 'public')
    const [tags, setTags] = useState(post.tags || [])
    const [images, setImages] = useState(() => {
        if (post.images?.length) return post.images
        if (post.image) return [post.image]
        return []
    })

    const [newTag, setNewTag] = useState('')
    const [uploadingImage, setUploadingImage] = useState(false)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    /* ── Save basic info ── */
    const handleSaveBasicInfo = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await postUserService.editPostBasic({
                postId: post.id,
                title,
                description,
                visibility,
            })
            onUpdate({ ...post, title, description, visibility, tags, images })
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    /* ── Tags ── */
    const handleAddTag = async () => {
        const trimmed = newTag.trim()
        if (!trimmed) return
        try {
            await postUserService.addPostTag({ postId: post.id, newTag: trimmed })
            const tagObj = { id: Date.now(), name: trimmed }
            const updated = [...tags, tagObj]
            setTags(updated)
            setNewTag('')
            onUpdate({ ...post, tags: updated })
        } catch (err) {
            console.error(err)
        }
    }

    const handleRemoveTag = async (tag) => {
        try {
            const tagId = tag.id || tag
            await postUserService.deletePostTag({ postId: post.id, tagId })
            const updated = tags.filter(t => (t.id || t) !== tagId)
            setTags(updated)
            onUpdate({ ...post, tags: updated })
        } catch (err) {
            console.error(err)
        }
    }

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddTag()
        }
    }

    /* ── Images ── */
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadingImage(true)
        try {
            await postUserService.uploadPostImg({ postId: post.id, images: [file] })
            const localUrl = URL.createObjectURL(file)
            const updated = [...images, localUrl]
            setImages(updated)
            onUpdate({ ...post, images: updated })
        } catch (err) {
            console.error(err)
        } finally {
            setUploadingImage(false)
        }
    }

    const handleRemoveImage = async (imgObjOrUrl, index) => {
        try {
            const imageId = imgObjOrUrl.id || imgObjOrUrl
            await postUserService.deletePostImg({ postId: post.id, imageId })
            const updated = [...images]
            updated.splice(index, 1)
            setImages(updated)
            onUpdate({ ...post, images: updated })
        } catch (err) {
            console.error(err)
        }
    }

    /* ── Delete post ── */
    const handleDeletePost = async () => {
        if (!window.confirm('Are you sure you want to delete this post permanently?')) return
        setDeleting(true)
        try {
            await postUserService.deletePost({ postId: post.id })
            onUpdate(null)
            onClose()
        } catch (err) {
            console.error(err)
            setDeleting(false)
        }
    }

    const resolveImgUrl = (img) => {
        if (typeof img === 'string') {
            if (img.startsWith('blob:')) return img
            return normalizeImageUrl(img)
        }
        return normalizeImageUrl(img.url || img.image_url || img)
    }

    return (
        <div className="edit-modal-backdrop" onClick={onClose}>
            <div className="edit-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="edit-modal__header">
                    <h2 className="edit-modal__title">Edit Post</h2>
                    <button className="edit-modal__close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* Basic info form */}
                <form className="edit-modal__form" onSubmit={handleSaveBasicInfo}>
                    <div className="edit-modal__field">
                        <label className="edit-modal__label">Title</label>
                        <input
                            className="edit-modal__input"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Post title"
                            required
                            maxLength={100}
                        />
                    </div>

                    <div className="edit-modal__field">
                        <label className="edit-modal__label">Description</label>
                        <textarea
                            className="edit-modal__textarea"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe your post..."
                            maxLength={500}
                        />
                    </div>

                    <div className="edit-modal__field">
                        <label className="edit-modal__label">Visibility</label>
                        <select
                            className="edit-modal__select"
                            value={visibility}
                            onChange={e => setVisibility(e.target.value)}
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                    </div>

                    <button className="edit-modal__save-btn" type="submit" disabled={saving}>
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>

                <hr className="edit-modal__divider" />

                {/* Tags */}
                <div>
                    <h3 className="edit-modal__section-title">Tags</h3>
                    <div className="edit-modal__tags">
                        {tags.map(tag => {
                            const tagName = tag.name || tag
                            const tagKey = tag.id || tag
                            return (
                                <span key={tagKey} className="edit-modal__tag">
                                    #{tagName}
                                    <button
                                        className="edit-modal__tag-remove"
                                        onClick={() => handleRemoveTag(tag)}
                                        title="Remove tag"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            )
                        })}
                        {tags.length === 0 && (
                            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.25)' }}>
                                No tags added yet.
                            </span>
                        )}
                    </div>
                    <div className="edit-modal__tag-add">
                        <input
                            className="edit-modal__input"
                            type="text"
                            value={newTag}
                            onChange={e => setNewTag(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            placeholder="New tag"
                            maxLength={30}
                        />
                        <button className="edit-modal__tag-add-btn" type="button" onClick={handleAddTag}>
                            <Plus size={14} /> Add
                        </button>
                    </div>
                </div>

                <hr className="edit-modal__divider" />

                {/* Images */}
                <div>
                    <h3 className="edit-modal__section-title">Images</h3>
                    <div className="edit-modal__images-grid">
                        {images.map((img, idx) => (
                            <div key={idx} className="edit-modal__image-item">
                                <img src={resolveImgUrl(img)} alt={`Post image ${idx + 1}`} />
                                <button
                                    className="edit-modal__image-remove"
                                    onClick={() => handleRemoveImage(img, idx)}
                                    title="Remove image"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <label className="edit-modal__upload-btn">
                        <Camera size={16} />
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                        />
                    </label>
                </div>

                <hr className="edit-modal__divider" />

                {/* Delete */}
                <div className="edit-modal__delete-section">
                    <button
                        className="edit-modal__delete-btn"
                        onClick={handleDeletePost}
                        disabled={deleting}
                    >
                        <Trash2 size={16} />
                        {deleting ? 'Deleting...' : 'Delete Post'}
                    </button>
                </div>
            </div>
        </div>
    )
}
