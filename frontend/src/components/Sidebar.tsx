import {useMemo, useState} from "react";
import {Dialog, DialogPanel} from "@headlessui/react";
import {ChevronDown, ChevronRight, Folder, FolderOpen, Radio, Server, ServerOff, Signal, X,} from "lucide-react";
import {useTorrents} from "../hooks/useTorrents";
import {useCategories} from "../hooks/useCategories";

function SectionHeader({
                           label,
                           collapsed,
                           onToggle,
                       }: {
    label: string;
    collapsed: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="w-full flex items-center gap-1 px-2 py-1 mt-2 first:mt-0 rounded hover:bg-[var(--qbt-bg-tertiary)] transition-colors"
        >
            {collapsed ? (
                <ChevronRight
                    size={12}
                    className="text-[var(--qbt-text-secondary)] flex-shrink-0"
                />
            ) : (
                <ChevronDown
                    size={12}
                    className="text-[var(--qbt-text-secondary)] flex-shrink-0"
                />
            )}
            <span className="text-xs font-semibold text-[var(--qbt-text-secondary)]">
				{label}
			</span>
        </button>
    );
}

function FilterItem({
                        label,
                        icon,
                        selected,
                        onClick,
                    }: {
    label: string;
    icon: React.ReactNode;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                selected
                    ? "bg-[var(--qbt-selected)] text-white"
                    : "hover:bg-[var(--qbt-bg-tertiary)] text-[var(--qbt-text-primary)]"
            }`}
        >
            {icon}
            <span className="truncate">{label}</span>
        </button>
    );
}

export default function Sidebar({
                                    selectedCategory,
                                    onCategorySelect,
                                    selectedServer,
                                    onServerSelect,
                                    selectedTracker,
                                    onTrackerSelect,
                                    selectedTrackerStatus,
                                    onTrackerStatusSelect,
                                    width,
                                    searchQuery,
                                    isDrawerOpen,
                                    onCloseDrawer,
                                }: {
    selectedCategory: string | null;
    onCategorySelect: (category: string | null) => void;
    selectedServer: string | null;
    onServerSelect: (server: string | null) => void;
    selectedTracker: string | null;
    onTrackerSelect: (tracker: string | null) => void;
    selectedTrackerStatus: string | null;
    onTrackerStatusSelect: (status: string | null) => void;
    width: number;
    searchQuery: string;
    isDrawerOpen?: boolean;
    onCloseDrawer?: () => void;
}) {
    const [categoriesCollapsed, setCategoriesCollapsed] = useState(false);
    const [serversCollapsed, setServersCollapsed] = useState(false);
    const [trackersCollapsed, setTrackersCollapsed] = useState(false);
    const [trackerStatusCollapsed, setTrackerStatusCollapsed] = useState(false);

    const {data: categoriesData} = useCategories();
    const {data: torrentsData} = useTorrents();

    const allTorrents = torrentsData?.Torrents ?? [];

    const filteredTorrents = useMemo(() => {
        if (!searchQuery.trim()) return allTorrents;
        const query = searchQuery.toLowerCase();
        return allTorrents.filter(
            (t) =>
                t.Name.toLowerCase().includes(query) ||
                t.Category.toLowerCase().includes(query) ||
                t.InfoHashV1.toLowerCase().includes(query) ||
                t.Server.toLowerCase().includes(query) ||
                t.SavePath.toLowerCase().includes(query),
        );
    }, [allTorrents, searchQuery]);

    const visibleCategories = useMemo(() => {
        const all = categoriesData?.Categories ?? [];
        if (!searchQuery.trim()) return all;
        const inResults = new Set(filteredTorrents.map((t) => t.Category));
        return all.filter((c) => inResults.has(c.Name));
    }, [categoriesData?.Categories, filteredTorrents, searchQuery]);

    const categoryCounts = useMemo(() => {
        const counts = new Map<string, number>();
        for (const t of filteredTorrents) {
            counts.set(t.Category, (counts.get(t.Category) ?? 0) + 1);
        }
        return counts;
    }, [filteredTorrents]);

    const serverCounts = useMemo(() => {
        const counts = new Map<string, number>();
        for (const t of filteredTorrents) {
            if (t.Server) counts.set(t.Server, (counts.get(t.Server) ?? 0) + 1);
        }
        return counts;
    }, [filteredTorrents]);

    const visibleServers = useMemo(() => {
        return Array.from(serverCounts.keys()).sort();
    }, [serverCounts]);

    const trackerCounts = useMemo(() => {
        const counts = new Map<string, number>();
        for (const t of filteredTorrents) {
            if (t.TrackerUrl)
                counts.set(t.TrackerUrl, (counts.get(t.TrackerUrl) ?? 0) + 1);
        }
        return counts;
    }, [filteredTorrents]);

    const visibleTrackers = useMemo(() => {
        return Array.from(trackerCounts.keys()).sort();
    }, [trackerCounts]);

    const trackerStatusCounts = useMemo(() => {
        const counts = new Map<string, number>();
        for (const t of filteredTorrents) {
            if (!t.Trackers?.length) continue;
            const primary =
                t.Trackers.find((tr) => tr.Url === t.TrackerUrl) ?? t.Trackers[0];
            if (primary?.Status)
                counts.set(primary.Status, (counts.get(primary.Status) ?? 0) + 1);
        }
        return counts;
    }, [filteredTorrents]);

    const visibleTrackerStatuses = useMemo(() => {
        return Array.from(trackerStatusCounts.keys()).sort();
    }, [trackerStatusCounts]);

    const trackerLabel = (url: string) => {
        try {
            const {protocol, host} = new URL(url);
            return `${protocol}//${host}`;
        } catch {
            return url;
        }
    };

    const hasActiveFilters =
        selectedCategory !== null ||
        selectedServer !== null ||
        selectedTracker !== null ||
        selectedTrackerStatus !== null;

    const clearFilters = () => {
        onCategorySelect(null);
        onServerSelect(null);
        onTrackerSelect(null);
        onTrackerStatusSelect(null);
    };

    const filterContent = (closeOnSelect?: () => void) => (
        <div className="p-2 overflow-y-auto flex-1">
            {hasActiveFilters && (
                <button
                    type="button"
                    onClick={() => {
                        clearFilters();
                        closeOnSelect?.();
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-[var(--qbt-text-secondary)] bg-[var(--qbt-bg-secondary)]/90 backdrop-blur-sm border border-[var(--qbt-border)] hover:bg-[var(--qbt-bg-tertiary)] hover:text-[var(--qbt-text-primary)] transition-colors shadow-sm mb-1"
                >
                    <span>✕</span>
                    <span>Clear filters</span>
                </button>
            )}
            <SectionHeader
                label="CATEGORIES"
                collapsed={categoriesCollapsed}
                onToggle={() => setCategoriesCollapsed((v) => !v)}
            />

            {!categoriesCollapsed && (
                <>
                    <FilterItem
                        label={`All (${filteredTorrents.length})`}
                        icon={<Folder size={16} className="flex-shrink-0"/>}
                        selected={selectedCategory === null}
                        onClick={() => {
                            onCategorySelect(null);
                            closeOnSelect?.();
                        }}
                    />
                    {visibleCategories.map((category) => (
                        <FilterItem
                            key={category.Name}
                            label={`${category.Name} (${categoryCounts.get(category.Name) ?? 0})`}
                            icon={
                                selectedCategory === category.Name ? (
                                    <FolderOpen size={16} className="flex-shrink-0"/>
                                ) : (
                                    <Folder size={16} className="flex-shrink-0"/>
                                )
                            }
                            selected={selectedCategory === category.Name}
                            onClick={() => {
                                onCategorySelect(
                                    selectedCategory === category.Name ? null : category.Name,
                                );
                                closeOnSelect?.();
                            }}
                        />
                    ))}
                </>
            )}

            <SectionHeader
                label="SERVERS"
                collapsed={serversCollapsed}
                onToggle={() => setServersCollapsed((v) => !v)}
            />

            {!serversCollapsed && (
                <>
                    <FilterItem
                        label={`All (${filteredTorrents.length})`}
                        icon={<Server size={16} className="flex-shrink-0"/>}
                        selected={selectedServer === null}
                        onClick={() => {
                            onServerSelect(null);
                            closeOnSelect?.();
                        }}
                    />
                    {visibleServers.map((server) => (
                        <FilterItem
                            key={server}
                            label={`${server} (${serverCounts.get(server) ?? 0})`}
                            icon={
                                selectedServer === server ? (
                                    <Server
                                        size={16}
                                        className="flex-shrink-0 text-[var(--qbt-accent)]"
                                    />
                                ) : (
                                    <ServerOff size={16} className="flex-shrink-0"/>
                                )
                            }
                            selected={selectedServer === server}
                            onClick={() => {
                                onServerSelect(selectedServer === server ? null : server);
                                closeOnSelect?.();
                            }}
                        />
                    ))}
                </>
            )}

            <SectionHeader
                label="TRACKERS"
                collapsed={trackersCollapsed}
                onToggle={() => setTrackersCollapsed((v) => !v)}
            />

            {!trackersCollapsed && (
                <>
                    <FilterItem
                        label={`All (${filteredTorrents.length})`}
                        icon={<Radio size={16} className="flex-shrink-0"/>}
                        selected={selectedTracker === null}
                        onClick={() => {
                            onTrackerSelect(null);
                            closeOnSelect?.();
                        }}
                    />
                    {visibleTrackers.map((tracker) => (
                        <FilterItem
                            key={tracker}
                            label={`${trackerLabel(tracker)} (${trackerCounts.get(tracker) ?? 0})`}
                            icon={
                                <Radio
                                    size={16}
                                    className={`flex-shrink-0 ${selectedTracker === tracker ? "text-[var(--qbt-accent)]" : ""}`}
                                />
                            }
                            selected={selectedTracker === tracker}
                            onClick={() => {
                                onTrackerSelect(selectedTracker === tracker ? null : tracker);
                                closeOnSelect?.();
                            }}
                        />
                    ))}
                </>
            )}

            <SectionHeader
                label="TRACKER STATUS"
                collapsed={trackerStatusCollapsed}
                onToggle={() => setTrackerStatusCollapsed((v) => !v)}
            />

            {!trackerStatusCollapsed && (
                <>
                    <FilterItem
                        label={`All (${filteredTorrents.length})`}
                        icon={<Signal size={16} className="flex-shrink-0"/>}
                        selected={selectedTrackerStatus === null}
                        onClick={() => {
                            onTrackerStatusSelect(null);
                            closeOnSelect?.();
                        }}
                    />
                    {visibleTrackerStatuses.map((status) => (
                        <FilterItem
                            key={status}
                            label={`${status} (${trackerStatusCounts.get(status) ?? 0})`}
                            icon={
                                <Signal
                                    size={16}
                                    className={`flex-shrink-0 ${selectedTrackerStatus === status ? "text-[var(--qbt-accent)]" : ""}`}
                                />
                            }
                            selected={selectedTrackerStatus === status}
                            onClick={() => {
                                onTrackerStatusSelect(
                                    selectedTrackerStatus === status ? null : status,
                                );
                                closeOnSelect?.();
                            }}
                        />
                    ))}
                </>
            )}
        </div>
    );

    return (
        <>
            {/* Desktop: inline sidebar */}
            <div
                className="relative hidden md:flex flex-col bg-[var(--qbt-bg-secondary)] border-r border-[var(--qbt-border)]"
                style={{width: `${width}px`}}
            >
                {filterContent()}
            </div>

            {/* Mobile: slide-in drawer */}
            {isDrawerOpen && (
                <div className="md:hidden">
                    <Dialog
                        open={isDrawerOpen}
                        onClose={() => onCloseDrawer?.()}
                        className="relative z-50"
                    >
                        <div className="fixed inset-0 bg-black/60" aria-hidden="true"/>
                        <div className="fixed inset-0 flex">
                            <DialogPanel
                                className="relative w-72 max-w-[85vw] h-full bg-[var(--qbt-bg-secondary)] shadow-2xl flex flex-col">
                                <div
                                    className="flex items-center justify-between px-3 py-2 border-b border-[var(--qbt-border)] flex-shrink-0">
									<span className="text-sm font-semibold text-[var(--qbt-text-secondary)]">
										Filters
									</span>
                                    <button
                                        type="button"
                                        onClick={onCloseDrawer}
                                        className="p-1.5 hover:bg-[var(--qbt-bg-tertiary)] rounded transition-colors"
                                        aria-label="Close filters"
                                    >
                                        <X size={18}/>
                                    </button>
                                </div>
                                {filterContent(onCloseDrawer)}
                            </DialogPanel>
                        </div>
                    </Dialog>
                </div>
            )}
        </>
    );
}
