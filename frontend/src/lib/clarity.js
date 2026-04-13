import Clarity from '@microsoft/clarity'

const CLARITY_PROJECT_ID = 'wb352oqpmj'

export function initClarity() {
    if (!CLARITY_PROJECT_ID) return
    if (typeof window === 'undefined') return

    const host = window.location.hostname
    const isLocalhost =
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host.endsWith('.local')

    if (isLocalhost) return

    Clarity.init(CLARITY_PROJECT_ID)
}