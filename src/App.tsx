import { useEffect, useRef, useState } from 'react'

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
		audioRef.current.volume = 0.8

		const audio = audioRef.current
		audio.addEventListener('play', () => setIsPlaying(true))
		audio.addEventListener('pause', () => setIsPlaying(false))
		audio.addEventListener('ended', handleStop)
		audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
		audio.addEventListener('durationchange', () => setAudioDuration(audio.duration))

		return () => {
			audio.pause()
			audio.remove()
		}
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

	const trackData = getCurrentTrackData()
	const duration = trackData?.endTime ?? audioDuration
	const displayTime = trackData ? currentTime - trackData.startTime : 0

	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100 pb-safe">
			{/* Sticky Now Playing Bar */}
			{trackData && (
				<div className="sticky top-0 z-20 border-b border-white/10 bg-zinc-900/95 backdrop-blur-lg">
					<div className="px-4 pt-3 pb-2">
						<div className="flex items-center justify-between gap-3 mb-2">
							<div className="min-w-0 flex-1">
								<div className="text-xs font-medium text-sky-400 mb-0.5">REPRODUCIENDO</div>
								<div className="text-base font-bold truncate">{trackData.name}</div>
							</div>
							<button
								onClick={handleStop}
								className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500 active:bg-red-600 active:scale-95 transition flex items-center justify-center text-xl"
							>
								⏹️
							</button>
						</div>
						
						{/* Progress bar */}
						<div className="space-y-1">
							<div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
								<div
									className="h-full rounded-full bg-sky-500 transition-all"
									style={{
										width: `${Math.min(100, (displayTime / (trackData.endTime ?? duration)) * 100)}%`,
									}}
								/>
							</div>
							<div className="flex justify-between text-xs text-zinc-400 tabular-nums">
								<span>{formatTime(displayTime)}</span>
								<span>{formatTime(trackData.endTime ?? duration)}</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Header */}
			<header className="sticky top-0 z-10 border-b border-white/10 bg-zinc-900/95 backdrop-blur-lg px-4 py-3">
				<h1 className="text-xl font-bold">🎵 Pistas</h1>
				<p className="text-xs text-zinc-500">{TRACKS.length} canciones</p>
			</header>

			{/* Track list */}
			<main className="px-3 py-3 space-y-2">
				{TRACKS.map(track => {
					const isActive = currentTrack === track.id
					const trackDuration = track.endTime ? track.endTime - track.startTime : null

					return (
						<button
							key={track.id}
							onClick={() => playTrack(track.id)}
							className={`w-full rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98] ${
								isActive
									? 'border-sky-500 bg-sky-500/15 shadow-lg shadow-sky-500/20'
									: 'border-white/10 bg-zinc-900/50 active:bg-zinc-900/70'
							}`}
						>
							<div className="flex items-start gap-3">
								{/* Play button icon */}
								<div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-2xl transition ${
									isActive && isPlaying
										? 'bg-sky-500 shadow-lg shadow-sky-500/30'
										: 'bg-white/10'
								}`}>
									{isActive && isPlaying ? '⏸️' : '▶️'}
								</div>
								
								{/* Track info */}
								<div className="min-w-0 flex-1 pt-1">
									<div className="font-bold text-base leading-tight mb-1">
										{track.id}. {track.name}
									</div>
									<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400">
										<span className="tabular-nums">
											{formatTime(track.startTime)} → {track.endTime ? formatTime(track.endTime) : 'fin'}
										</span>
										{trackDuration !== null && (
											<span className="px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-medium tabular-nums">
												{trackDuration}s
											</span>
										)}
									</div>
								</div>
							</div>
						</button>
					)
				})}
			</main>

			{/* Bottom spacing for safe area */}
			<div className="h-6"></div>
		</div>
	)
}