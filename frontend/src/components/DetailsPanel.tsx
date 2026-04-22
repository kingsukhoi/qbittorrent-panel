import {useEffect, useRef, useState} from "react";
import Linkify from "linkify-react";
import {Dialog, DialogPanel} from "@headlessui/react";
import {FileText, Info, List, RefreshCw, X} from "lucide-react";
import type {Torrent} from "../types";
import {useTorrentTrackers} from "../hooks/useTorrentTrackers";

type Tab = "general" | "files" | "trackers";

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
}

export default function DetailsPanel({
                                         torrent,
                                         height,
                                         isOpen,
                                         onClose,
                                     }: {
    torrent: Torrent | null;
    height: number;
    isOpen: boolean;
    onClose: () => void;
}) {
    const [activeTab, setActiveTab] = useState<Tab>("general");
    const [dragY, setDragY] = useState(window.innerHeight);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartY = useRef<number | null>(null);

    // Entrance animation: start off-screen, slide to 0
    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setDragY(0));
            });
        }
    }, [isOpen]);

    const handleTouchStart = (e: React.TouchEvent) => {
        dragStartY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (dragStartY.current === null) return;
        const delta = e.touches[0].clientY - dragStartY.current;
        if (delta > 0) setDragY(delta);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        dragStartY.current = null;
        if (dragY > 120) {
            setDragY(window.innerHeight);
            setTimeout(onClose, 250);
        } else {
            setDragY(0);
        }
    };

    const {data, isFetching: loading} = useTorrentTrackers(
        torrent?.InfoHashV1,
        activeTab === "trackers",
    );

    const trackers =
        data?.Torrent?.find((t) => t.Server === torrent?.Server)?.Trackers || [];

    const tabBar = torrent ? (
        <div className="flex items-center border-b border-(--qbt-border) flex-shrink-0">
            <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`px-4 py-2 flex items-center gap-2 text-sm transition-colors ${
                    activeTab === "general"
                        ? "bg-(--qbt-bg-primary) text-white border-b-2 border-(--qbt-accent)"
                        : "text-(--qbt-text-secondary) hover:text-white hover:bg-(--qbt-bg-tertiary)"
                }`}
            >
                <Info size={16}/>
                General
            </button>
            <button
                type="button"
                onClick={() => setActiveTab("files")}
                className={`px-4 py-2 flex items-center gap-2 text-sm transition-colors ${
                    activeTab === "files"
                        ? "bg-(--qbt-bg-primary) text-white border-b-2 border-(--qbt-accent)"
                        : "text-(--qbt-text-secondary) hover:text-white hover:bg-(--qbt-bg-tertiary)"
                }`}
            >
                <FileText size={16}/>
                Files ({torrent.Files.length})
            </button>
            <button
                type="button"
                onClick={() => setActiveTab("trackers")}
                className={`px-4 py-2 flex items-center gap-2 text-sm transition-colors ${
                    activeTab === "trackers"
                        ? "bg-(--qbt-bg-primary) text-white border-b-2 border-(--qbt-accent)"
                        : "text-(--qbt-text-secondary) hover:text-white hover:bg-(--qbt-bg-tertiary)"
                }`}
            >
                <List size={16}/>
                Trackers
            </button>
            {/* Close button — mobile only */}
            <button
                type="button"
                onClick={onClose}
                className="ml-auto mr-2 p-1.5 hover:bg-[var(--qbt-bg-tertiary)] rounded transition-colors md:hidden"
                aria-label="Close details"
            >
                <X size={18}/>
            </button>
        </div>
    ) : null;

    const tabContent = torrent ? (
        <div className="flex-1 overflow-auto p-4">
            {activeTab === "general" && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    <div>
                        <div className="text-(--qbt-text-secondary) mb-1">Name:</div>
                        <div className="break-all">{torrent.Name}</div>
                    </div>
                    <div>
                        <div className="text-(--qbt-text-secondary) mb-1">Hash:</div>
                        <div className="font-mono text-xs break-all">
                            {torrent.InfoHashV1}
                        </div>
                    </div>
                    <div>
                        <div className="text-(--qbt-text-secondary) mb-1">Size:</div>
                        <div>{formatBytes(torrent.SizeBytes)}</div>
                    </div>
                    <div>
                        <div className="text-(--qbt-text-secondary) mb-1">Ratio:</div>
                        <div>{torrent.Ratio.toFixed(3)}</div>
                    </div>
                    <div>
                        <div className="text-(--qbt-text-secondary) mb-1">Category:</div>
                        <div>{torrent.Category || "None"}</div>
                    </div>
                    <div>
                        <div className="text-(--qbt-text-secondary) mb-1">Server:</div>
                        <div>{torrent.Server}</div>
                    </div>
                    <div className="col-span-2">
                        <div className="text-(--qbt-text-secondary) mb-1">Save Path:</div>
                        <div className="font-mono text-xs break-all">
                            {torrent.SavePath}
                        </div>
                    </div>
                    {torrent.Comment && (
                        <div className="col-span-2">
                            <div className="text-(--qbt-text-secondary) mb-1">Comment:</div>
                            <Linkify
                                as="div"
                                options={{
                                    validate: {url: (value) => value.startsWith("https://")},
                                    attributes: {
                                        target: "_blank",
                                        rel: "noreferrer",
                                        className: "text-blue-400 underline hover:text-blue-300",
                                    },
                                }}
                                className="text-xs break-words"
                            >
                                {torrent.Comment}
                            </Linkify>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "files" && (
                <div className="overflow-auto">
                    <div className="flex flex-col">
                        {torrent.Files.map((file) => (
                            <div
                                key={file.Index}
                                className="flex flex-col gap-1 px-3 py-2 border-b border-(--qbt-border) hover:bg-(--qbt-bg-tertiary)"
                            >
                                {/* Row 1: File name */}
                                <div className="text-sm text-(--qbt-text-primary) break-words leading-snug">
                                    {file.Name}
                                </div>
                                {/* Row 2: Size left, Priority right */}
                                <div className="flex items-center justify-between text-xs text-(--qbt-text-secondary)">
                                    <span>{formatBytes(file.SizeBytes)}</span>
                                    <span>Priority: {file.Priority}</span>
                                </div>
                                {/* Row 3: Progress bar — only when incomplete */}
                                {file.Progress < 1 && (
                                    <div className="relative bg-(--qbt-bg-tertiary) rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-(--qbt-accent) h-full transition-all"
                                            style={{width: `${file.Progress * 100}%`}}
                                        />
                                        <span
                                            className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
											{(file.Progress * 100).toFixed(1)}%
										</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === "trackers" && (
                <div className="overflow-auto h-full">
                    {loading ? (
                        <div className="flex items-center justify-center p-8 text-(--qbt-text-secondary)">
                            <RefreshCw className="animate-spin mr-2" size={20}/>
                            Loading trackers...
                        </div>
                    ) : trackers.length > 0 ? (
                        <div className="flex flex-col">
                            {trackers.map((tracker: any, i: number) => (
                                <div
                                    key={i}
                                    className="flex flex-col gap-1 px-3 py-2 border-b border-(--qbt-border) hover:bg-(--qbt-bg-tertiary)"
                                >
                                    {/* Row 1: URL */}
                                    <div className="text-sm text-(--qbt-text-primary) break-all">
                                        {tracker.Url}
                                    </div>
                                    {/* Row 2: Status left, Tier right */}
                                    <div
                                        className="flex items-center justify-between text-xs text-(--qbt-text-secondary)">
                                        <span>{tracker.Status}</span>
                                        <span>Tier {tracker.Tier}</span>
                                    </div>
                                    {/* Row 3: Peers / Seeds / Leeches */}
                                    <div className="flex items-center gap-4 text-xs text-(--qbt-text-secondary)">
                                        <span>Peers: {tracker.Peers}</span>
                                        <span>Seeds: {tracker.Seeds}</span>
                                        <span>Leeches: {tracker.Leeches}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm">
                            <div className="mb-2 text-(--qbt-text-secondary)">Tracker:</div>
                            <div className="font-mono text-xs break-all bg-(--qbt-bg-tertiary) p-2 rounded">
                                {torrent.TrackerUrl || "No tracker"}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    ) : null;

    return (
        <>
            {/* Desktop: inline bottom panel */}
            <div
                className="hidden md:flex flex-col bg-(--qbt-bg-secondary) border-t border-(--qbt-border)"
                style={{height: `${height}px`}}
            >
                {torrent ? (
                    <>
                        {tabBar}
                        {tabContent}
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-(--qbt-text-secondary) text-sm">
                        Select a torrent to view details
                    </div>
                )}
            </div>

            {/* Mobile: bottom sheet Dialog */}
            {isOpen && (
                <div className="md:hidden">
                    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
                        <div className="fixed inset-0 bg-black/50" aria-hidden="true"/>
                        <div className="fixed inset-0 flex items-end">
                            <DialogPanel
                                className="w-screen h-[85vh] bg-(--qbt-bg-secondary) rounded-t-2xl flex flex-col shadow-2xl"
                                style={{
                                    transform: `translateY(${dragY}px)`,
                                    transition: isDragging ? "none" : "transform 250ms cubic-bezier(0.32, 0.72, 0, 1)",
                                }}
                            >
                                <div
                                    className="flex justify-center pt-3 pb-3 touch-none cursor-grab"
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    <div className="w-10 h-1 rounded-full bg-[var(--qbt-border)]"/>
                                </div>
                                {tabBar}
                                {tabContent}
                            </DialogPanel>
                        </div>
                    </Dialog>
                </div>
            )}
        </>
    );
}
