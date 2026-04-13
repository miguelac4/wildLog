import { useEffect, useState, useCallback, useRef } from "react"
import ExploreMap from "./ExploreMap"
import ExploreSidebar from "./ExploreSidebar"
import { postExploreService } from "../../api/postExploreService"
import { postUserService } from "../../api/postUserService"
import { normalizeImageUrl } from "../../config/mediaConfig"

function ExploreView({
                         isMobile,
                         sidebarOpen,
                         setSidebarOpen,
                         selectedPost,
                         setSelectedPost,
                         bookmarkedIds = new Set()
                     }) {

    /* ───────────────────────────────
       STATE
    ─────────────────────────────── */
    const [mapPosts, setMapPosts] = useState([])
    const [nearbyPosts, setNearbyPosts] = useState([])
    const [userPostIds, setUserPostIds] = useState(new Set())
    const [coords, setCoords] = useState(null)
    const [loadingNearby, setLoadingNearby] = useState(true)

    const [flyToTarget, setFlyToTarget] = useState(null)
    const lastCoordsRef = useRef(null)
    const isFlyingRef = useRef(false)


    /* ───────────────────────────────
       LOAD MAP PINS (1x)
    ─────────────────────────────── */
    useEffect(() => {
        loadMapPosts()
        
        postUserService.getUserPosts()
            .then(data => {
                if (data && data.posts) {
                    const ids = new Set(data.posts.map(p => String(p.id)))
                    setUserPostIds(ids)
                }
            })
            .catch(err => console.error("Erro a carregar user posts:", err))
    }, [])

    async function loadMapPosts() {
        try {
            const data = await postExploreService.getMapPosts()
            const normalized = (data.posts || []).map(p => ({
                ...p,
                lat: Number(p.lat),
                lng: Number(p.lng),
            }))

            setMapPosts(normalized)
        } catch (err) {
            console.error("Erro map posts:", err)
        }
    }

    /* ───────────────────────────────
       LOAD NEARBY POSTS (quando coords mudam)
    ─────────────────────────────── */
    useEffect(() => {
        if (!coords) return

        const sameCoords =
            lastCoordsRef.current &&
            Math.abs(lastCoordsRef.current.lat - coords.lat) < 0.00001 &&
            Math.abs(lastCoordsRef.current.lng - coords.lng) < 0.00001

        if (sameCoords) return

        const timeout = setTimeout(() => {
            loadNearbyPosts(coords.lat, coords.lng)
            lastCoordsRef.current = {
                lat: coords.lat,
                lng: coords.lng
            }
        }, 400)

        return () => clearTimeout(timeout)
    }, [coords?.lat, coords?.lng])

    async function loadNearbyPosts(lat, lng) {
        setLoadingNearby(true)
        try {
            const data = await postExploreService.getNearbyPosts(lat, lng)

            // Normalizar dados
            // NOTA: get_nearby_posts NÃO devolve lat/lng — enriquecer a partir do mapPosts
            const normalized = data.posts.map(p => {
                const mapMatch = mapPosts.find(mp => String(mp.id) === String(p.id))
                return {
                    id: p.id,
                    title: p.title,
                    author: p.author,
                    createdAt: p.created_at,
                    tags: p.tags || [],
                    likes: p.likes,
                    comments: p.comments,
                    lat: mapMatch ? mapMatch.lat : null,
                    lng: mapMatch ? mapMatch.lng : null,
                }
            })

            setNearbyPosts(prev => {
                const same =
                    prev.length === normalized.length &&
                    prev.every((p, i) => p.id === normalized[i].id)

                return same ? prev : normalized
            })

        } catch (err) {
            console.error("Erro nearby:", err)
        } finally {
            setLoadingNearby(false)
        }
    }

    /* ───────────────────────────────
       MAP MOVE → recebe coords
    ─────────────────────────────── */
    const handleMapMove = useCallback((lat, lng) => {
        if (isFlyingRef.current) return

        setCoords(prev => {
            if (prev && Math.abs(prev.lat - lat) < 0.01 && Math.abs(prev.lng - lng) < 0.001) {
                return prev // mesma posição — sem re-render
            }
            return { lat, lng }
        })
    }, [])

    /* ───────────────────────────────
       CLICK POST
    ─────────────────────────────── */
    const handlePostClick = useCallback(async (post) => {

        let lat = Number(post.lat)
        let lng = Number(post.lng)

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            const mapMatch = mapPosts.find(mp => String(mp.id) === String(post.id))
            if (mapMatch) {
                lat = mapMatch.lat
                lng = mapMatch.lng
            }
        }

        try {
            const data = await postExploreService.getPost(post.id)

            const formattedPost = {
                ...data.post,

                lat,
                lng,

                tags: Array.isArray(data.post.tags)
                    ? data.post.tags
                    : (data.post.tags
                        ? data.post.tags.split(',').map(t => t.trim())
                        : []),

                images: Array.isArray(data.post.images)
                    ? data.post.images.map(img => normalizeImageUrl(img.image_url))
                    : [],

                comments: data.post.comments || 0,

                loading: false,
            }

            setSelectedPost(formattedPost)

        } catch (err) {
            console.error("Erro ao carregar post:", err)
        }

        // FlyTo
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            isFlyingRef.current = true

            setFlyToTarget({
                lat,
                lng,
                isMobile,
                _id: Date.now(),
            })
        }

        if (isMobile) {
            setSidebarOpen(false)
        }

    }, [isMobile, mapPosts])

    const handleFlyComplete = useCallback(() => {
        isFlyingRef.current = false
    }, [])

    return (
        <>
            <ExploreSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                filteredPosts={nearbyPosts}
                selectedPost={selectedPost}
                onPostClick={handlePostClick}
                regions={[]} // depois ligas API se quiseres
                loading={loadingNearby}
            />

            <ExploreMap
                posts={mapPosts}
                userPostIds={userPostIds}
                bookmarkedIds={bookmarkedIds}
                regions={[]}
                onPostClick={handlePostClick}
                flyToTarget={flyToTarget}
                onFlyComplete={handleFlyComplete}
                onMoveEnd={handleMapMove}
            />
        </>
    )
}

export default ExploreView