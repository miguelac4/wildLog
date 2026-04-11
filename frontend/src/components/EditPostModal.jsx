import { X, Plus, Trash2, Camera } from 'lucide-react'
import { useState } from 'react'
import { postUserService } from '../api/postUserService'

export default function EditPostModal({ post, onClose, onUpdate }) {
    const [title, setTitle] = useState(post.title || '')
    const [description, setDescription] = useState(post.description || '')
    const [visibility, setVisibility] = useState(post.visibility || 'public')
    const [tags, setTags] = useState(post.tags || [])
    const [images, setImages] = useState(post.images?.length ? post.images : (post.image ? [post.image] : []))
    
    const [newTag, setNewTag] = useState('')
    const [uploadingImage, setUploadingImage] = useState(false)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const handleSaveBasicInfo = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await postUserService.editPostBasic({
                postId: post.id,
                title,
                description,
                visibility
            })
            // Inform parent
            onUpdate({ ...post, title, description, visibility, tags, images })
            alert('Post guardado com sucesso!')
        } catch (err) {
            console.error(err)
            alert('Erro ao guardar as alterações básicas.')
        } finally {
            setSaving(false)
        }
    }

    const handleAddTag = async () => {
        if (!newTag.trim()) return
        try {
            await postUserService.addPostTag({ postId: post.id, newTag: newTag.trim() })
            const tagObj = { id: Date.now(), name: newTag.trim() } // Temporary id if backend doesn't return one immediately
            const updatedTags = [...tags, tagObj]
            setTags(updatedTags)
            setNewTag('')
            onUpdate({ ...post, tags: updatedTags })
        } catch (err) {
            console.error(err)
            alert('Erro ao adicionar tag.')
        }
    }

    const handleRemoveTag = async (tag) => {
        try {
            // Need tag_id. If tag is object, use tag.id.
            const tagId = tag.id || tag
            await postUserService.deletePostTag({ postId: post.id, tagId })
            const updatedTags = tags.filter(t => (t.id || t) !== tagId)
            setTags(updatedTags)
            onUpdate({ ...post, tags: updatedTags })
        } catch (err) {
            console.error(err)
            alert('Erro ao remover tag.')
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setUploadingImage(true)
        try {
            await postUserService.uploadPostImg({ postId: post.id, images: [file] })
            // To immediately show it, we might need the image URL from backend,
            // but we can just use a local object URL temporarily or refetch post.
            // For now, let's just create a local URL.
            const localUrl = URL.createObjectURL(file)
            const updatedImages = [...images, localUrl]
            setImages(updatedImages)
            onUpdate({ ...post, images: updatedImages })
            alert('Imagem adicionada com sucesso!')
        } catch (err) {
            console.error(err)
            alert('Erro ao fazer upload da imagem.')
        } finally {
            setUploadingImage(false)
        }
    }

    const handleRemoveImage = async (imgObjOrUrl, index) => {
        try {
            // Se as imagens na API têm ID, precisamos passar o ID da imagem.
            // Aqui vamos assumir que passam o index ou que a backend precisa do nome. 
            // O backend espera "image_id".
            // Se as imagens são apenas strings (URLs), teremos dificuldade em saber o ID.
            // Vou passar um valor para tentar.
            let imageId = imgObjOrUrl.id || imgObjOrUrl
            // Extract from URL if necessary. Assuming we have imageId.
            // If post user service requires a specific ID format and we only have URLs, 
            // we might have to just send the URL string if the backend parses it.
            await postUserService.deletePostImg({ postId: post.id, imageId })
            
            const updatedImages = [...images]
            updatedImages.splice(index, 1)
            setImages(updatedImages)
            onUpdate({ ...post, images: updatedImages })
        } catch (err) {
            console.error(err)
            alert('Erro ao remover imagem.')
        }
    }

    const handleDeletePost = async () => {
        if (!window.confirm('Tens a certeza absoluta que queres apagar este post? Esta ação não pode ser desfeita.')) return
        
        setDeleting(true)
        try {
            await postUserService.deletePost({ postId: post.id })
            alert('Post apagado com sucesso!')
            onUpdate(null) // Signal that the post is deleted
            onClose()
        } catch (err) {
            console.error(err)
            alert('Erro ao apagar post.')
            setDeleting(false)
        }
    }

    return (
        <div className="main-post-panel__backdrop" style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="main-post-panel__card" style={{ maxHeight: '90vh', overflowY: 'auto', padding: '24px', width: '100%', maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>Editar Post</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSaveBasicInfo}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Título</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', color: '#000' }}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Descrição</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '100px', color: '#000' }}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Visibilidade</label>
                        <select 
                            value={visibility} 
                            onChange={(e) => setVisibility(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', color: '#000' }}
                        >
                            <option value="public">Pública</option>
                            <option value="private">Privada</option>
                        </select>
                    </div>

                    <button type="submit" disabled={saving} style={{ background: '#a0845f', color: 'white', padding: '10px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {saving ? 'A Guardar...' : 'Guardar Alterações Básicas'}
                    </button>
                </form>

                <hr style={{ margin: '24px 0', borderColor: '#eee' }} />

                <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ marginBottom: '12px' }}>Tags</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                        {tags.map((tag) => {
                            const tagId = tag.id || tag;
                            const tagName = tag.name || tag;
                            return (
                                <span key={tagId} style={{ background: '#e0e0e0', padding: '4px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: '#333', fontSize: '14px' }}>
                                    #{tagName}
                                    <button onClick={() => handleRemoveTag(tag)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#888' }} title="Remover Tag">
                                        <X size={14} />
                                    </button>
                                </span>
                            )
                        })}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                            type="text" 
                            value={newTag} 
                            onChange={(e) => setNewTag(e.target.value)} 
                            placeholder="Nova tag" 
                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc', color: '#000' }}
                        />
                        <button onClick={handleAddTag} style={{ background: '#333', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Plus size={16} /> Adicionar
                        </button>
                    </div>
                </div>

                <hr style={{ margin: '24px 0', borderColor: '#eee' }} />

                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '12px' }}>Imagens</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                        {images.map((img, index) => {
                            const imgUrl = img.url || img;
                            return (
                                <div key={index} style={{ position: 'relative', aspectRatio: '1', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                                    <img src={imgUrl} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button onClick={() => handleRemoveImage(img, index)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Remover imagem">
                                        <X size={14} />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0f0f0', padding: '10px', borderRadius: '4px', cursor: 'pointer', width: 'max-content', color: '#333' }}>
                        <Camera size={16} />
                        {uploadingImage ? 'A enviar...' : 'Upload Imagem'}
                        <input type="file" style={{ display: 'none' }} onChange={handleImageUpload} accept="image/*" disabled={uploadingImage} />
                    </label>
                </div>

                <hr style={{ margin: '24px 0', borderColor: '#eee' }} />

                <div style={{ textAlign: 'right' }}>
                    <button 
                        onClick={handleDeletePost} 
                        disabled={deleting}
                        style={{ background: '#ff4d4f', color: 'white', padding: '12px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}
                    >
                        <Trash2 size={16} />
                        {deleting ? 'A Apagar...' : 'Apagar Post Definitivamente'}
                    </button>
                </div>

            </div>
        </div>
    )
}
