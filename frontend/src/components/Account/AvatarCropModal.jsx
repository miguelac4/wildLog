import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { X, ZoomIn, ZoomOut, RotateCw, Check } from 'lucide-react'
import getCroppedImg from '../../utils/cropImage'
import WildLogSpinner from '../WildLogSpinner'
import '../../styles/AvatarCropModal.css'

/**
 * AvatarCropModal — Full-screen dark modal that lets the user
 * position, zoom, rotate, and crop an image in a circular viewport.
 *
 * Follows the WildLog dark-nature palette.
 *
 * Props:
 *   imageSrc   — object URL of the selected file
 *   onCancel   — close without saving
 *   onConfirm  — receives the cropped File object
 */
export default function AvatarCropModal({ imageSrc, onCancel, onConfirm }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [saving, setSaving] = useState(false)

    const onCropComplete = useCallback((_croppedArea, croppedAreaPx) => {
        setCroppedAreaPixels(croppedAreaPx)
    }, [])

    const handleConfirm = async () => {
        if (!croppedAreaPixels) return
        setSaving(true)
        try {
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels)
            onConfirm(croppedFile)
        } catch (err) {
            console.error('Crop error:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3))
    const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 1))
    const handleRotate = () => setRotation((r) => (r + 90) % 360)

    return (
        <div className="avatar-crop-backdrop" onClick={onCancel}>
            <div className="avatar-crop-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="avatar-crop-header">
                    <h3 className="avatar-crop-title">Adjust Avatar</h3>
                    <button className="avatar-crop-close" onClick={onCancel} title="Cancel">
                        <X size={18} />
                    </button>
                </div>

                {/* Crop area */}
                <div className="avatar-crop-area">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        style={{
                            containerStyle: {
                                borderRadius: '14px',
                            },
                            cropAreaStyle: {
                                border: '2px solid rgba(160, 132, 95, 0.6)',
                                boxShadow: '0 0 0 9999px rgba(6, 13, 9, 0.82)',
                            },
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="avatar-crop-controls">
                    {/* Zoom */}
                    <div className="avatar-crop-zoom">
                        <button className="avatar-crop-ctrl-btn" onClick={handleZoomOut} title="Zoom out">
                            <ZoomOut size={16} />
                        </button>
                        <input
                            className="avatar-crop-slider"
                            type="range"
                            min={1}
                            max={3}
                            step={0.05}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                        />
                        <button className="avatar-crop-ctrl-btn" onClick={handleZoomIn} title="Zoom in">
                            <ZoomIn size={16} />
                        </button>
                    </div>

                    {/* Rotate */}
                    <button className="avatar-crop-ctrl-btn" onClick={handleRotate} title="Rotate 90°">
                        <RotateCw size={16} />
                    </button>
                </div>

                {/* Actions */}
                <div className="avatar-crop-actions">
                    <button className="avatar-crop-cancel" onClick={onCancel} disabled={saving}>
                        <X size={15} /> Cancel
                    </button>
                    <button className="avatar-crop-save" onClick={handleConfirm} disabled={saving}>
                        {saving ? (
                            <WildLogSpinner size={20} overlay={false} />
                        ) : (
                            <>
                                <Check size={15} /> Save Avatar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

