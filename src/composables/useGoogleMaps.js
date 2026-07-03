let loaded = false
let loadPromise = null

export function useGoogleMaps() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  function loadApi() {
    if (!apiKey) return Promise.reject(new Error('No API key'))
    if (loaded) return Promise.resolve(window.google)
    if (loadPromise) return loadPromise

    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => { loaded = true; resolve(window.google) }
      script.onerror = () => { loaded = false; reject(new Error('Failed to load Google Maps')) }
      document.head.appendChild(script)
    })

    return loadPromise
  }

  function buildMapUrl(vehicles = []) {
    const withCoords = vehicles.filter(v => v.latitude && v.longitude)
    const center = withCoords.length > 0
      ? { lat: withCoords[0].latitude, lng: withCoords[0].longitude }
      : { lat: -6.7924, lng: 39.2083 } // Dar es Salaam

    const markers = withCoords.map(v =>
      `&markers=color:red%7Clabel:${encodeURIComponent(v.vehicle_name?.charAt(0) || 'V')}%7C${v.latitude},${v.longitude}`
    ).join('')

    return `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=12&size=800x400&maptype=roadmap${markers}&key=${apiKey}`
  }

  return { loadApi, buildMapUrl, hasKey: !!apiKey }
}
