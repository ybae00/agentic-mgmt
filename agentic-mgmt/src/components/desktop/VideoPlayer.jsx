import { useState, useRef, useEffect, useCallback } from 'react'
import './DesktopApps.css'

export default function VideoPlayer() {
  const [videoUrl, setVideoUrl] = useState(null)
  const [fileName, setFileName] = useState('')
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [dragging, setDragging] = useState(false)
  const videoRef = useRef(null)
  const fileInputRef = useRef(null)
  const dropRef = useRef(null)

  function handleFile(file) {
    if (!file?.type.startsWith('video/')) return
    const url = URL.createObjectURL(file)
    setVideoUrl(url)
    setFileName(file.name)
    setPlaying(false)
    setCurrentTime(0)
  }

  function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    dropRef.current?.classList.remove('drag-over')
    const file = e.dataTransfer?.files?.[0]
    if (file) handleFile(file)
  }

  function handleDragOver(e) {
    e.preventDefault()
    dropRef.current?.classList.add('drag-over')
  }

  function handleDragLeave(e) {
    e.preventDefault()
    dropRef.current?.classList.remove('drag-over')
  }

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  function handleSeek(e) {
    const v = videoRef.current
    if (!v || !duration) return
    const pct = parseFloat(e.target.value)
    v.currentTime = pct * duration
    setCurrentTime(v.currentTime)
  }

  function handleVolumeChange(e) {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (videoRef.current) videoRef.current.volume = val
  }

  const toggleFullscreen = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      v.requestFullscreen?.()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl)
    }
  }, [videoUrl])

  function formatTime(s) {
    if (!s || !isFinite(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  if (!videoUrl) {
    return (
      <div
        ref={dropRef}
        className="video-dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="video-file-input"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="video-dropzone-icon">
          <svg viewBox="0 0 48 48" fill="none">
            <rect
              x="6"
              y="10"
              width="36"
              height="28"
              rx="4"
              stroke="rgba(140,165,200,0.4)"
              strokeWidth="2"
            />
            <path
              d="M20 18l10 6-10 6V18z"
              fill="rgba(74,158,255,0.5)"
            />
          </svg>
        </div>
        <p className="video-dropzone-text">
          Drop a video file here or click to upload
        </p>
        <p className="video-dropzone-hint">MP4, WebM, MOV supported</p>
      </div>
    )
  }

  return (
    <div className="video-player">
      <div className="video-viewport" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={videoUrl}
          onTimeUpdate={() =>
            setCurrentTime(videoRef.current?.currentTime || 0)
          }
          onLoadedMetadata={() =>
            setDuration(videoRef.current?.duration || 0)
          }
          onEnded={() => setPlaying(false)}
        />
      </div>
      <div className="video-controls">
        <button className="video-ctrl-btn" onClick={togglePlay} type="button">
          {playing ? '⏸' : '▶'}
        </button>
        <span className="video-time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <input
          className="video-seek"
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={duration ? currentTime / duration : 0}
          onChange={handleSeek}
        />
        <input
          className="video-volume"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
        />
        <button
          className="video-ctrl-btn"
          onClick={toggleFullscreen}
          type="button"
          title="Fullscreen"
        >
          ⛶
        </button>
      </div>
      <div className="video-filename">{fileName}</div>
    </div>
  )
}
