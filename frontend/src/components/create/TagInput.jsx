import { useState, useRef } from 'react'
import { X, Tag } from 'lucide-react'

const MAX_TAGS = 5

/**
 * TagInput — Dynamic tag chips with add/remove.
 *
 * Props:
 *   tags        — string[]
 *   onChange    — (tags: string[]) => void
 */
function TagInput({ tags, onChange }) {
    const [inputValue, setInputValue] = useState('')
    const [shake, setShake] = useState(false)
    const inputRef = useRef(null)

    const atLimit = tags.length >= MAX_TAGS

    const addTag = (value) => {
        const trimmed = value.trim().toLowerCase().replace(/^#/, '')
        if (!trimmed) return
        if (tags.includes(trimmed)) return

        if (atLimit) {
            setShake(true)
            setTimeout(() => setShake(false), 500)
            return
        }

        onChange([...tags, trimmed])
        setInputValue('')
    }

    const removeTag = (index) => {
        onChange(tags.filter((_, i) => i !== index))
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addTag(inputValue)
        }
        if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags.length - 1)
        }
    }

    return (
        <div className="create-tags">
            <label className="create-field__label">
                <Tag size={14} />
                Tags
                <span className={`create-tags__counter ${atLimit ? 'create-tags__counter--limit' : ''}`}>
                    {tags.length}/{MAX_TAGS}
                </span>
            </label>

            <div className={`create-tags__box ${shake ? 'create-tags__box--shake' : ''}`}>
                {tags.map((tag, i) => (
                    <span key={tag} className="create-tags__chip">
                        #{tag}
                        <button
                            type="button"
                            className="create-tags__chip-remove"
                            onClick={() => removeTag(i)}
                            aria-label={`Remove tag ${tag}`}
                        >
                            <X size={12} />
                        </button>
                    </span>
                ))}

                {!atLimit && (
                    <input
                        ref={inputRef}
                        type="text"
                        className="create-tags__input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={tags.length === 0 ? 'Add tags (press Enter)' : 'Add more…'}
                    />
                )}
            </div>

            {atLimit && (
                <p className="create-tags__limit-msg">Maximum of {MAX_TAGS} tags reached</p>
            )}
        </div>
    )
}

export default TagInput

