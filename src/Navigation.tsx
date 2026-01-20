type NavigationProps = {
	activeTab: 'home' | 'search' | 'library'
	onTabChange: (tab: 'home' | 'search' | 'library') => void
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
	return (
		<nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 pb-safe z-40">
			<div className="flex justify-around items-center px-4 py-2">
				<button
					onClick={() => onTabChange('home')}
					className={`flex flex-col items-center gap-1 py-2 px-4 transition ${
						activeTab === 'home' ? 'text-white' : 'text-zinc-400'
					}`}
				>
					<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
						<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
					</svg>
					<span className="text-xs font-medium">Home</span>
				</button>
				<button
					onClick={() => onTabChange('search')}
					className={`flex flex-col items-center gap-1 py-2 px-4 transition ${
						activeTab === 'search' ? 'text-white' : 'text-zinc-400'
					}`}
				>
					<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
						<path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
					</svg>
					<span className="text-xs font-medium">Search</span>
				</button>
				<button
					onClick={() => onTabChange('library')}
					className={`flex flex-col items-center gap-1 py-2 px-4 transition ${
						activeTab === 'library' ? 'text-white' : 'text-zinc-400'
					}`}
				>
					<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
						<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
					</svg>
					<span className="text-xs font-medium">Your Library</span>
				</button>
			</div>
		</nav>
	)
}
