import {FolderPlus, Pause, Play, Plus, Search, Settings, Trash2, Upload} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import UploadTorrentModal from './UploadTorrentModal';
import {usePauseTorrents, useResumeTorrents} from "../hooks/useTorrentMutations";

export default function Toolbar({searchQuery, onSearchChange, selectedTorrent, onAddCategory}: {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedTorrent?: { Server: string; InfoHashV1: string } | null;
    onAddCategory?: () => void;
}) {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isPlusOpen, setIsPlusOpen] = useState(false);
    const plusRef = useRef<HTMLDivElement>(null);
    const {mutate: pauseTorrents} = usePauseTorrents();
    const {mutate: resumeTorrents} = useResumeTorrents();

    useEffect(() => {
        if (!isPlusOpen) return;
        const handler = (e: MouseEvent) => {
            if (plusRef.current && !plusRef.current.contains(e.target as Node)) {
                setIsPlusOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isPlusOpen]);

    const handlePause = () => {
        if (!selectedTorrent) return;
        pauseTorrents({
            Torrents: [{Server: selectedTorrent.Server, Hash: selectedTorrent.InfoHashV1}],
        });
    };

    const handleResume = () => {
        if (!selectedTorrent) return;
        resumeTorrents({
            Torrents: [{Server: selectedTorrent.Server, Hash: selectedTorrent.InfoHashV1}],
        });
    };

    return (
        <>
            <div
                className="h-12 bg-[var(--qbt-bg-secondary)] border-b border-[var(--qbt-border)] flex items-center px-2 gap-1">
                <div ref={plusRef} className="relative">
                    <button
                        type="button"
                        className="p-2 hover:bg-[var(--qbt-bg-tertiary)] rounded transition-colors"
                        title="Add"
                        onClick={() => setIsPlusOpen((v) => !v)}
                    >
                        <Plus size={18}/>
                    </button>
                    {isPlusOpen && (
                        <div
                            className="absolute left-0 top-full mt-1 w-48 bg-[var(--qbt-bg-secondary)] border border-[var(--qbt-border)] rounded shadow-lg z-50">
                            <button
                                type="button"
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--qbt-text-primary)] hover:bg-[var(--qbt-bg-tertiary)] transition-colors"
                                onClick={() => {
                                    setIsUploadModalOpen(true);
                                    setIsPlusOpen(false);
                                }}
                            >
                                <Upload size={15}/>
                                Add torrent files
                            </button>
                            <button
                                type="button"
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--qbt-text-primary)] hover:bg-[var(--qbt-bg-tertiary)] transition-colors"
                                onClick={() => {
                                    onAddCategory?.();
                                    setIsPlusOpen(false);
                                }}
                            >
                                <FolderPlus size={15}/>
                                Add category
                            </button>
                        </div>
                    )}
                </div>
                <button type="button"
                        className="p-2 hover:bg-[var(--qbt-bg-tertiary)] rounded transition-colors disabled:opacity-50"
                        title="Resume" disabled={!selectedTorrent}
                        onClick={handleResume}
                >
                <Play size={18}/>
            </button>
                <button type="button"
                        className="p-2 hover:bg-[var(--qbt-bg-tertiary)] rounded transition-colors disabled:opacity-50"
                        title="Pause"
                        disabled={!selectedTorrent}
                        onClick={handlePause}
                >
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
            <UploadTorrentModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />
        </>
    );
}
