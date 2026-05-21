import { useState, useRef, useEffect, useCallback } from 'react'
import './DesktopApps.css'

export default function PhotoBooth() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [photos, setPhotos] = useState([])
  const [error, setError] = useState(null)
  const [countdown, setCountdown] = useState(null)
  const [flash, setFlash] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setCameraReady(true)
      }
    } catch {
      setError(
        'Camera access denied. Please allow camera access in your browser settings.',
      )
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraReady(false)
  }

  const capturePhoto = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/png')
    setPhotos((prev) => [
      { id: Date.now(), url: dataUrl, time: new Date().toLocaleTimeString() },
      ...prev,
    ])

    setFlash(true)
    setTimeout(() => setFlash(false), 200)
  }, [])

  function handleCapture() {
    setCountdown(3)
    let count = 3
    const interval = setInterval(() => {
      count--
      if (count > 0) {
        setCountdown(count)
      } else {
        setCountdown(null)
        clearInterval(interval)
        capturePhoto()
      }
    }, 1000)
  }

  function handleInstantCapture() {
    capturePhoto()
  }

  function handleDownload(photo) {
    const link = document.createElement('a')
    link.href = photo.url
    link.download = `photobooth-${photo.id}.png`
    link.click()
  }

  if (error) {
    return (
      <div className="photobooth">
        <div className="photobooth-error">
          <div className="photobooth-error-icon">📷</div>
          <p>{error}</p>
          <button
            className="photobooth-retry-btn"
            onClick={() => {
              setError(null)
              startCamera()
            }}
            type="button"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="photobooth">
      <div className="photobooth-viewport">
        <video
          ref={videoRef}
          className="photobooth-video"
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {flash && <div className="photobooth-flash" />}

        {countdown !== null && (
          <div className="photobooth-countdown">{countdown}</div>
        )}

        {!cameraReady && !error && (
          <div className="photobooth-loading">Starting camera...</div>
        )}
      </div>

      <div className="photobooth-controls">
        <button
          className="photobooth-timer-btn"
          onClick={handleCapture}
          disabled={!cameraReady || countdown !== null}
          type="button"
          title="3s countdown"
        >
          3s
        </button>
        <button
          className="photobooth-capture-btn"
          onClick={handleInstantCapture}
          disabled={!cameraReady || countdown !== null}
          type="button"
          aria-label="Take photo"
        >
          <span className="photobooth-capture-ring" />
        </button>
        <span className="photobooth-count">
          {photos.length} photo{photos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {photos.length > 0 && (
        <div className="photobooth-gallery">
          {photos.map((photo) => (
            <div key={photo.id} className="photobooth-thumb-wrap">
              <img
                className={`photobooth-thumb ${selectedPhoto === photo.id ? 'selected' : ''}`}
                src={photo.url}
                alt={`Photo at ${photo.time}`}
                onClick={() =>
                  setSelectedPhoto(
                    selectedPhoto === photo.id ? null : photo.id,
                  )
                }
              />
              {selectedPhoto === photo.id && (
                <button
                  className="photobooth-download-btn"
                  onClick={() => handleDownload(photo)}
                  type="button"
                  title="Download"
                >
                  ↓
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
