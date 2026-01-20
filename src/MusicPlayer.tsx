import { useRef } from 'react'

type Track = {
	id: number
	file: string
	name: string
	startTime: number
	endTime: number | null
}

type MusicPlayerProps = {
	track: Track | null
	isPlaying: boolean
	currentTime: number
	duration: number
	onPlayPause: () => void
	onSeek: (time: number) => void
	onNext: () => void
	onPrevious: () => void
	onVolumeChange?: (volume: number) => void
	volume?: number
}

function formatTime(seconds: number) {
	if (!Number.isFinite(seconds) || seconds <= 0) return '0:00'
	const s = Math.floor(seconds)
	const m = Math.floor(s / 60)
	const r = s % 60
	return `${m}:${String(r).padStart(2, '0')}`
}

export default function MusicPlayer({
	track,
	isPlaying,
	currentTime,
	duration,
	onPlayPause,
	onSeek,
	onNext,
	onPrevious,
}: MusicPlayerProps) {
	const progressRef = useRef<HTMLDivElement>(null)

	const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!progressRef.current || !track) return
		const rect = progressRef.current.getBoundingClientRect()
		const x = e.clientX - rect.left
		const percentage = x / rect.width
		const newTime = track.startTime + (percentage * duration)
		onSeek(newTime)
	}

	if (!track) {
		return null
	}

	const displayTime = currentTime - track.startTime
	const progress = duration > 0 ? (displayTime / duration) * 100 : 0

	return (
		<div className="fixed bottom-4 left-4 right-4 bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl z-50 shadow-2xl border border-gray-200/50 backdrop-blur-sm">
			{/* Progress bar */}
			<div
				ref={progressRef}
				onClick={handleProgressClick}
				className="h-1.5 bg-gray-200 cursor-pointer group relative rounded-t-2xl overflow-hidden"
			>
				<div
					className="h-full bg-green-500 relative transition-all"
					style={{ width: `${Math.min(100, progress)}%` }}
				>
					<div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
				</div>
			</div>

			<div className="px-3 py-2.5">
				{/* Track Info */}
				<div className="flex items-center gap-2.5 mb-2.5">
					<div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center shrink-0 border border-gray-200">
						<span className="text-lg">🎵</span>
					</div>
					<div className="flex-1 min-w-0">
						<div className="font-semibold truncate text-xs">{track.name}</div>
						<div className="text-[10px] text-zinc-500">Track {track.id}</div>
					</div>
				</div>

				{/* Player Controls */}
				<div className="flex items-center justify-center gap-4 mb-2">
					<button
						onClick={onPrevious}
						className="text-zinc-600 hover:text-black transition-colors active:scale-95"
						title="Previous"
					>
						<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
							<path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
						</svg>
					</button>
					<button
						onClick={onPlayPause}
						className="w-11 h-11 bg-black rounded-full flex items-center justify-center hover:scale-105 active:scale-100 transition-transform shadow-lg"
						title={isPlaying ? 'Pause' : 'Play'}
					>
						{isPlaying ? (
							<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
								<path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
							</svg>
						) : (
							<svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M8 5v14l11-7z" />
							</svg>
						)}
					</button>
					<button
						onClick={onNext}
						className="text-zinc-600 hover:text-black transition-colors active:scale-95"
						title="Next"
					>
						<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
							<path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z" />
						</svg>
					</button>
				</div>

				{/* Time Display */}
				<div className="flex items-center justify-between text-[10px] text-zinc-500">
					<span className="tabular-nums">{formatTime(displayTime)}</span>
					<span className="tabular-nums">{formatTime(duration)}</span>
				</div>
			</div>
		</div>
	)
}
