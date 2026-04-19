import {QueryClientProvider} from '@tanstack/react-query';
import {queryClient} from './lib/queryClient';
import {useEffect, useMemo, useState} from 'react';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import TorrentTable from './components/TorrentTable';
import DetailsPanel from './components/DetailsPanel';
import CreateCategoryModal from './components/CreateCategoryModal';
import {useTorrents} from './hooks/useTorrents';
import type {Torrent} from './types';


function QBittorrentPanel() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedServer, setSelectedServer] = useState<string | null>(null);
    const [selectedTracker, setSelectedTracker] = useState<string | null>(null);
    const [selectedTrackerStatus, setSelectedTrackerStatus] = useState<string | null>(null);
    const [selectedTorrentHash, setSelectedTorrentHash] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarWidth, setSidebarWidth] = useState(208);
    const [detailsHeight, setDetailsHeight] = useState(256);
    const [isResizingSidebar, setIsResizingSidebar] = useState(false);
    const [isResizingDetails, setIsResizingDetails] = useState(false);
    const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
    const [selectedTorrents, setSelectedTorrents] = useState<Torrent[]>([]);
    const [sortResetKey, setSortResetKey] = useState(0);

    const {data: torrentsData} = useTorrents({
        categories: selectedCategory ? [selectedCategory] : undefined,
        servers: selectedServer ? [selectedServer] : undefined,
    });

    const selectedTorrent = useMemo(() => {
        if (!selectedTorrentHash || !torrentsData?.Torrents) {
            return null;
        }
        return torrentsData.Torrents.find(
            (torrent: Torrent) => torrent.InfoHashV1 === selectedTorrentHash
        ) ?? null;
    }, [selectedTorrentHash, torrentsData?.Torrents]);

    useEffect(() => {
        const handleMouseMove = (e: globalThis.MouseEvent) => {
            if (isResizingSidebar) {
                const newWidth = Math.max(150, Math.min(500, e.clientX));
                setSidebarWidth(newWidth);
            }
            if (isResizingDetails) {
                const newHeight = Math.max(150, Math.min(600, window.innerHeight - e.clientY));
                setDetailsHeight(newHeight);
            }
        };

        const handleMouseUp = () => {
            setIsResizingSidebar(false);
            setIsResizingDetails(false);
        };

        if (isResizingSidebar || isResizingDetails) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isResizingSidebar, isResizingDetails]);

    return (
        <div className="h-screen flex flex-col">
            <Toolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddCategory={() => setIsCreateCategoryOpen(true)}
                onResetSort={() => setSortResetKey((k) => k + 1)}
                selectedTorrents={selectedTorrents}
            />
            <div className="flex-1 flex overflow-hidden">
                <Sidebar
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                    selectedServer={selectedServer}
                    onServerSelect={setSelectedServer}
                    selectedTracker={selectedTracker}
                    onTrackerSelect={setSelectedTracker}
                    selectedTrackerStatus={selectedTrackerStatus}
                    onTrackerStatusSelect={setSelectedTrackerStatus}
                    width={sidebarWidth}
                    searchQuery={searchQuery}
                />
                {/* Vertical resizer for sidebar */}
                <button
                    type="button"
                    aria-label="Resize sidebar"
                    className="w-1 bg-(--qbt-border) hover:bg-(--qbt-accent) cursor-col-resize transition-colors"
                    onMouseDown={() => setIsResizingSidebar(true)}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TorrentTable
                        selectedCategory={selectedCategory}
                        selectedServer={selectedServer}
                        selectedTracker={selectedTracker}
                        selectedTrackerStatus={selectedTrackerStatus}
                        selectedTorrentHash={selectedTorrentHash}
                        onTorrentSelect={(hash) => setSelectedTorrentHash(hash)}
                        searchQuery={searchQuery}
                        onSelectionChange={setSelectedTorrents}
                        sortResetKey={sortResetKey}
                    />
                    {/* Horizontal resizer for details panel */}
                    <button
                        type="button"
                        aria-label="Resize details panel"
                        className="h-1 bg-(--qbt-border) hover:bg-(--qbt-accent) cursor-row-resize transition-colors"
                        onMouseDown={() => setIsResizingDetails(true)}
                    />
                    <DetailsPanel torrent={selectedTorrent} height={detailsHeight}/>
                </div>
            </div>
            <CreateCategoryModal
                isOpen={isCreateCategoryOpen}
                onClose={() => setIsCreateCategoryOpen(false)}
            />
        </div>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <QBittorrentPanel/>
        </QueryClientProvider>
    );
}

export default App
