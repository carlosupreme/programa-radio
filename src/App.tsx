import { useEffect, useRef, useState } from 'react'
import MusicPlayer from './MusicPlayer'

type Track = {
	id: number
	file: string
	name: string
	startTime: number
	endTime: number | null // null = play until end
}

// Hardcoded tracks configuration
const TRACKS: Track[] = [
	{ id: 1, file: '/1-Intro.mp3', name: 'Intro', startTime: 0, endTime: null },
	{ id: 2, file: '/2-Alone-Marshmello.mp3', name: 'Alone - Marshmello', startTime: 0, endTime: 18 },
	{ id: 3, file: '/3-Mr. Blue Sky.mp3', name: 'Mr. Blue Sky', startTime: 0, endTime: 25 },
	{ id: 4, file: '/4-Música de Fondo para Podcast.mp3', name: 'Música de Fondo para Podcast', startTime: 0, endTime: null },
	{ id: 5, file: '/5-Olvida La Amargura.mp3', name: 'Olvida La Amargura', startTime: 0, endTime: 74 },
	{ id: 6, file: '/6-Noticias  Música Ambiental.mp3', name: 'Noticias Música Ambiental', startTime: 0, endTime: null },
	{ id: 7, file: '/7-Más de 60 Tonos de Notificaciones.mp3', name: 'Más de 60 Tonos de Notificaciones', startTime: 0, endTime: null },
	{ id: 8, file: '/8-Sonido de Teclado de Celular.mp3', name: 'Sonido de Teclado de Celular', startTime: 0, endTime: null },
	{ id: 9, file: '/9-Photograph-Ed Sheeran.mp3', name: 'Photograph - Ed Sheeran', startTime: 0, endTime: 15 },
	{ id: 10, file: '/10-SPAGHETTI-LE SSERAFIM.mp3', name: 'SPAGHETTI - LE SSERAFIM', startTime: 65, endTime: 73 },
	{ id: 11, file: '/11-Noticias  Música Ambiental Para Videos.mp3', name: 'Noticias Música Ambiental Para Videos', startTime: 0, endTime: 25 },
	{ id: 12, file: '/12-En el mar - Carlos Argetino.mp3', name: 'En el mar - Carlos Argetino', startTime: 12, endTime: 22 },
	{ id: 13, file: '/13-fondo feliz.mp3', name: 'Fondo Feliz', startTime: 0, endTime: null },
	{ id: 14, file: '/14-Bazar - flans.mp3', name: 'Bazar - Flans', startTime: 0, endTime: 9 },
	{ id: 15, file: '/15-Mr. Blue Sky.mp3', name: 'Mr. Blue Sky', startTime: 0, endTime: 30 },
	{ id: 16, file: '/16-Color Esperanza - Diego Torres .mp3', name: 'Color Esperanza - Diego Torres', startTime: 42, endTime: 74 },
	{ id: 17, file: '/17-Where No One Goes - Jónsi.mp3', name: 'Where No One Goes - Jónsi', startTime: 0, endTime: 22 },
	{ id: 18, file: '/18-Hear Me Now.mp3', name: 'Hear Me Now', startTime: 0, endTime: null },
	{ id: 19, file: '/19-Coldplay - Soft Piano.mp3', name: 'Coldplay - Soft Piano', startTime: 0, endTime: null },
]

function formatTime(seconds: number) {
	if (!Number.isFinite(seconds) || seconds <= 0) return '0:00'
	const s = Math.floor(seconds)
	const m = Math.floor(s / 60)
	const r = s % 60
	return `${m}:${String(r).padStart(2, '0')}`
}

export default function App() {
	const audioRef = useRef<HTMLAudioElement | null>(null)
	const [currentTrack, setCurrentTrack] = useState<number | null>(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [currentTime, setCurrentTime] = useState(0)
	const [audioDuration, setAudioDuration] = useState(0)
	const [volume, setVolume] = useState(0.8)
	const [offlineReady, setOfflineReady] = useState(false)
	const [showOfflineMessage, setShowOfflineMessage] = useState(false)
	const [downloadProgress, setDownloadProgress] = useState(0)
	const [isDownloading, setIsDownloading] = useState(false)
	const checkIntervalRef = useRef<number | null>(null)

	const handleStop = () => {
		if (!audioRef.current) return
		audioRef.current.pause()
		audioRef.current.currentTime = 0
		setCurrentTrack(null)
		setIsPlaying(false)
		setCurrentTime(0)
		if (checkIntervalRef.current) {
			clearInterval(checkIntervalRef.current)
			checkIntervalRef.current = null
		}
	}

	useEffect(() => {
		audioRef.current = new Audio()
		audioRef.current.volume = volume

		const audio = audioRef.current
		audio.addEventListener('play', () => setIsPlaying(true))
		audio.addEventListener('pause', () => setIsPlaying(false))
		audio.addEventListener('ended', handleStop)
		audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
		audio.addEventListener('durationchange', () => setAudioDuration(audio.duration))

		// Listen for PWA offline ready event
		const handleOfflineReady = () => {
			setOfflineReady(true)
			setShowOfflineMessage(true)
			setIsDownloading(false)
			setTimeout(() => setShowOfflineMessage(false), 5000)
		}

		const handleDownloadProgress = (event: Event) => {
			const customEvent = event as CustomEvent<{ progress: number; downloaded: number; total: number }>
			const { progress } = customEvent.detail
			setDownloadProgress(progress)
			setIsDownloading(true)
		}

		window.addEventListener('swOfflineReady', handleOfflineReady)
		window.addEventListener('swDownloadProgress', handleDownloadProgress)

		return () => {
			audio.pause()
			audio.remove()
			window.removeEventListener('swOfflineReady', handleOfflineReady)
			window.removeEventListener('swDownloadProgress', handleDownloadProgress)
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])


	const playTrack = async (trackId: number) => {
		const track = TRACKS.find(t => t.id === trackId)
		if (!track || !audioRef.current) return

		const audio = audioRef.current

		// If same track is playing, pause it
		if (currentTrack === trackId && !audio.paused) {
			audio.pause()
			return
		}

		// Stop current track
		if (currentTrack !== trackId) {
			audio.pause()
			audio.src = track.file
			audio.currentTime = track.startTime
			setCurrentTrack(trackId)
		}

		try {
			await audio.play()

			// Monitor end time
			if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)
			if (track.endTime !== null) {
				checkIntervalRef.current = window.setInterval(() => {
					if (audio.currentTime >= track.endTime!) {
						handleStop()
					}
				}, 100)
			}
		} catch (err) {
			console.error('Error playing track:', err)
		}
	}

	const getCurrentTrackData = () => {
		if (currentTrack === null) return null
		return TRACKS.find(t => t.id === currentTrack)
	}

	const handlePlayPause = () => {
		if (!audioRef.current) return
		if (isPlaying) {
			audioRef.current.pause()
		} else {
			audioRef.current.play()
		}
	}

	const handleSeek = (time: number) => {
		if (!audioRef.current) return
		audioRef.current.currentTime = time
	}

	const handleNext = () => {
		if (currentTrack === null) return
		const currentIndex = TRACKS.findIndex(t => t.id === currentTrack)
		const nextIndex = (currentIndex + 1) % TRACKS.length
		playTrack(TRACKS[nextIndex].id)
	}

	const handlePrevious = () => {
		if (currentTrack === null) return
		const currentIndex = TRACKS.findIndex(t => t.id === currentTrack)
		const prevIndex = currentIndex === 0 ? TRACKS.length - 1 : currentIndex - 1
		playTrack(TRACKS[prevIndex].id)
	}

	const handleVolumeChange = (newVolume: number) => {
		setVolume(newVolume)
		if (audioRef.current) {
			audioRef.current.volume = newVolume
		}
	}

	const trackData = getCurrentTrackData()
	const duration = trackData?.endTime ?? audioDuration

	return (
		<div className="min-h-screen bg-white text-black">
			{/* Download Progress Bar */}
			{isDownloading && (
				<div className="fixed top-0 left-0 right-0 z-50">
					<div className="h-1 bg-gray-200">
						<div 
							className="h-full bg-green-500 transition-all duration-300"
							style={{ width: `${downloadProgress}%` }}
						/>
					</div>
					<div className="bg-white border-b border-gray-200 px-4 py-2 text-xs text-zinc-600 flex items-center gap-2">
						<svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Downloading songs for offline use... {Math.round(downloadProgress)}%
					</div>
				</div>
			)}

			{/* Offline Ready Notification */}
			{showOfflineMessage && (
				<div className="fixed top-4 left-4 right-4 z-50 animate-slide-down">
					<div className="bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
						<svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<div className="flex-1">
							<div className="font-semibold text-sm">All songs downloaded!</div>
							<div className="text-xs opacity-90">You can now use the app offline</div>
						</div>
						<button 
							onClick={() => setShowOfflineMessage(false)}
							className="shrink-0 hover:opacity-75"
						>
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
							</svg>
						</button>
					</div>
				</div>
			)}

			{/* Main Content Area with bottom padding for music player */}
			<div className={`pb-40 ${isDownloading ? 'pt-12' : ''}`}>
				{/* Header */}
				<header className="px-4 pt-4 pb-2 flex items-start justify-between">
					<div>
						<h1 className="text-2xl font-bold mb-1">Your Tracks</h1>
						<p className="text-sm text-zinc-600">
							{TRACKS.length} songs
							{offlineReady && (
								<span className="ml-2 text-green-600">• Offline ready</span>
							)}
						</p>
					</div>
					<button
						onClick={() => window.location.reload()}
						className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
						title="Refresh"
					>
						<svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
					</button>
				</header>

				{/* All Tracks List */}
				<main className="px-4 py-2">
					<div className="space-y-1">
						{TRACKS.map((track, index) => {
							const isActive = currentTrack === track.id
							const trackDuration = track.endTime ? track.endTime - track.startTime : null

							return (
								<button
									key={track.id}
									onClick={() => playTrack(track.id)}
									className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all active:scale-98 ${
										isActive ? 'bg-gray-100' : 'active:bg-gray-50'
									}`}
								>
									<div className="w-8 text-zinc-600 text-sm text-center shrink-0">
										{isActive && isPlaying ? (
											<div className="flex items-center justify-center">
												<svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
													<path d="M8 5v14l11-7z" />
												</svg>
											</div>
										) : (
											index + 1
										)}
									</div>
									<div className="flex-1 text-left min-w-0">
										<div className={`font-medium text-sm truncate ${isActive ? 'text-green-600' : ''}`}>
											{track.name}
										</div>
										<div className="text-xs text-zinc-500 truncate">
											{formatTime(track.startTime)} → {track.endTime ? formatTime(track.endTime) : 'end'}
											{trackDuration !== null && ` • ${trackDuration}s`}
										</div>
									</div>
								</button>
							)
						})}
					</div>
				</main>
			</div>

			{/* Music Player */}
			<MusicPlayer
				track={trackData ?? null}
				isPlaying={isPlaying}
				currentTime={currentTime}
				duration={duration}
				onPlayPause={handlePlayPause}
				onSeek={handleSeek}
				onNext={handleNext}
				onPrevious={handlePrevious}
				onVolumeChange={handleVolumeChange}
				volume={volume}
			/>
		</div>
	)
}