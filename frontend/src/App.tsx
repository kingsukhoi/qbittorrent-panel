import {ApolloProvider} from '@apollo/client/react';
import {apolloClient} from './lib/apollo';
import {useEffect, useMemo, useState} from 'react';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import TorrentTable from './components/TorrentTable';
import DetailsPanel from './components/DetailsPanel';
import {useGetTorrentsQuery} from './gql/graphql';

function QBittorrentPanel() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTorrentHash, setSelectedTorrentHash] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarWidth, setSidebarWidth] = useState(208); // 52 * 4 = 208px (w-52 in rem)
    const [detailsHeight, setDetailsHeight] = useState(256); // 64 * 4 = 256px (h-64 in rem)
    const [isResizingSidebar, setIsResizingSidebar] = useState(false);
    const [isResizingDetails, setIsResizingDetails] = useState(false);

    // Fetch all torrents to keep selected torrent fresh
    const {data: torrentsData} = useGetTorrentsQuery({
        variables: {
            categories: selectedCategory ? [selectedCategory] : undefined,
        },
        pollInterval: 2000, // Refresh every 2 seconds
    });

    // Find the currently selected torrent from fresh data
    const selectedTorrent = useMemo(() => {
        if (!selectedTorrentHash || !torrentsData?.Torrents) {
            return null;
        }
        return torrentsData.Torrents.find(
            (torrent) => torrent.InfoHashV1 === selectedTorrentHash
        ) ?? null;
    }, [selectedTorrentHash, torrentsData?.Torrents]);

    // Add and remove event listeners
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
            <Toolbar searchQuery={searchQuery} onSearchChange={setSearchQuery}/>
            <div className="flex-1 flex overflow-hidden">
                <Sidebar
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                    width={sidebarWidth}
                    searchQuery={searchQuery}
                />
                {/* Vertical resizer for sidebar */}
                <button
                    type="button"
                    aria-label="Resize sidebar"
                    className="w-1 bg-[var(--qbt-border)] hover:bg-[var(--qbt-accent)] cursor-col-resize transition-colors"
                    onMouseDown={() => setIsResizingSidebar(true)}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TorrentTable
                        selectedCategory={selectedCategory}
                        selectedTorrentHash={selectedTorrentHash}
                        onTorrentSelect={(hash) => setSelectedTorrentHash(hash)}
                        searchQuery={searchQuery}
                    />
                    {/* Horizontal resizer for details panel */}
                    <button
                        type="button"
                        aria-label="Resize details panel"
                        className="h-1 bg-[var(--qbt-border)] hover:bg-[var(--qbt-accent)] cursor-row-resize transition-colors"
                        onMouseDown={() => setIsResizingDetails(true)}
                    />
                    <DetailsPanel torrent={selectedTorrent} height={detailsHeight}/>
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <ApolloProvider client={apolloClient}>
            <QBittorrentPanel/>
        </ApolloProvider>
    );
}

export default App
