import {Pause, Play, Plus, Search, Settings, Trash2} from 'lucide-react';

export default function Toolbar({searchQuery, onSearchChange}: {
    searchQuery: string;
    onSearchChange: (query: string) => void
}) {
    return (
        <div
            className="h-12 bg-[var(--qbt-bg-secondary)] border-b border-[var(--qbt-border)] flex items-center px-2 gap-1">
            <button type="button" className="p-2 hover:bg-[var(--qbt-bg-tertiary)] rounded transition-colors"
                    title="Add Torrent">
                <Plus size={18}/>
            </button>
            <button type="button" className="p-2 hover:bg-[var(--qbt-bg-tertiary)] rounded transition-colors"
                    title="Resume">
                <Play size={18}/>
            </button>
            <button type="button" className="p-2 hover:bg-[var(--qbt-bg-tertiary)] rounded transition-colors"
                    title="Pause">
                <Pause size={18}/>
            </button>
            <button type="button"
                    className="p-2 hover:bg-[var(--qbt-bg-tertiary)] rounded transition-colors text-red-400"
                    title="Delete">
                <Trash2 size={18}/>
            </button>
            <div className="flex-1"/>
            <div className="relative">
                <Search size={16}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--qbt-text-secondary)]"/>
                <input
                    type="text"
                    placeholder="Search torrents..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-[var(--qbt-bg-primary)] border border-[var(--qbt-border)] rounded text-sm text-[var(--qbt-text-primary)] placeholder:text-[var(--qbt-text-secondary)] focus:outline-none focus:border-[var(--qbt-accent)] transition-colors w-64"
                />
            </div>
            <button type="button" className="p-2 hover:bg-[var(--qbt-bg-tertiary)] rounded transition-colors"
                    title="Settings">
                <Settings size={18}/>
            </button>
        </div>
    );
}
