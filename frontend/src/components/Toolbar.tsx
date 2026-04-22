import {Filter, FolderPlus, Pause, Play, Plus, RotateCcw, Search, Trash2, Upload,} from "lucide-react";
import {useEffect, useRef, useState} from "react";
import UploadTorrentModal from "./UploadTorrentModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import {usePauseTorrents, useResumeTorrents,} from "../hooks/useTorrentMutations";

export default function Toolbar({
                                    searchQuery,
                                    onSearchChange,
                                    onAddCategory,
                                    onResetSort,
                                    selectedTorrents,
                                    onOpenSidebar,
                                }: {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAddCategory?: () => void;
    onResetSort?: () => void;
    selectedTorrents?: { Server: string; InfoHashV1: string; Name: string }[];
    onOpenSidebar?: () => void;
}) {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isPlusOpen]);

    const targets = selectedTorrents?.length
        ? selectedTorrents.map((t) => ({Server: t.Server, Hash: t.InfoHashV1}))
        : null;

    const handlePause = () => {
        if (!targets) return;
        pauseTorrents({Torrents: targets});
    };

    const handleResume = () => {
        if (!targets) return;
        resumeTorrents({Torrents: targets});
    };

    return (
        <>
            <div
                className="h-12 bg-[var(--qbt-bg-secondary)] border-b border-[var(--qbt-border)] flex items-center px-2 gap-1">
                {/* Filter button — mobile only */}
                <button
                    type="button"
                    className="p-2 hover:bg-[var(--qbt-bg-tertiary)] rounded transition-colors md:hidden"
                    title="Filters"
                    onClick={onOpenSidebar}
                >
                    <Filter size={18}/>
                </button>
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
                <button
                    type="button"
                    className="hidden md:inline-flex p-2 hover:bg-[var(--qbt-bg-tertiary)] rounded transition-colors disabled:opacity-50"
                    title="Resume"
                    disabled={!targets}
                    onClick={handleResume}
                >
                    <Play size={18}/>
                </button>
                <button
                    type="button"
                    className="hidden md:inline-flex p-2 hover:bg-[var(--qbt-bg-tertiary)] rounded transition-colors disabled:opacity-50"
                    title="Pause"
                    disabled={!targets}
                    onClick={handlePause}
                >
                    <Pause size={18}/>
                </button>
                <button
                    type="button"
                    disabled={!selectedTorrents?.length}
                    className="hidden md:inline-flex p-2 hover:bg-[var(--qbt-bg-tertiary)] rounded transition-colors text-red-400 disabled:opacity-50"
                    onClick={() => setIsDeleteModalOpen(true)}
                    title={
                        selectedTorrents?.length
                            ? `Delete ${selectedTorrents.length} torrent${selectedTorrents.length > 1 ? "s" : ""}`
                            : "Delete"
                    }
                >
                    <Trash2 size={18}/>
                </button>
                <div className="flex-1"/>
                <div className="relative flex-1 md:flex-none">
                    <Search
                        size={16}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--qbt-text-secondary)]"
                    />
                    <input
                        type="text"
                        placeholder="Search torrents..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-[var(--qbt-bg-primary)] border border-[var(--qbt-border)] rounded text-sm text-[var(--qbt-text-primary)] placeholder:text-[var(--qbt-text-secondary)] focus:outline-none focus:border-[var(--qbt-accent)] transition-colors w-full md:w-64"
                    />
                </div>
                <button
                    type="button"
                    className="hidden md:inline-flex p-2 hover:bg-[var(--qbt-bg-tertiary)] rounded transition-colors"
                    title="Reset sort"
                    onClick={onResetSort}
                >
                    <RotateCcw size={18}/>
                </button>
            </div>
            {/* Mobile bottom action bar — shown when torrents selected */}
            {!!selectedTorrents?.length && (
                <div
                    className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-4 py-3 bg-[var(--qbt-bg-secondary)] border-t border-[var(--qbt-border)] md:hidden">
                    <button
                        type="button"
                        onClick={handleResume}
                        className="flex flex-col items-center gap-1 text-xs text-[var(--qbt-text-primary)]"
                    >
                        <Play size={20}/>
                        Resume
                    </button>
                    <button
                        type="button"
                        onClick={handlePause}
                        className="flex flex-col items-center gap-1 text-xs text-[var(--qbt-text-primary)]"
                    >
                        <Pause size={20}/>
                        Pause
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="flex flex-col items-center gap-1 text-xs text-red-400"
                    >
                        <Trash2 size={20}/>
                        Delete ({selectedTorrents.length})
                    </button>
                </div>
            )}
            <UploadTorrentModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                torrents={selectedTorrents ?? []}
                onDeleted={() => {
                }}
            />
        </>
    );
}
