import {useMemo} from 'react';
import {Folder, FolderOpen} from 'lucide-react';
import {useGetCategoriesQuery, useGetTorrentsQuery} from '../gql/graphql';

export default function Sidebar({
                                    selectedCategory,
                                    onCategorySelect,
                                    width,
                                    searchQuery
                                }: {
    selectedCategory: string | null;
    onCategorySelect: (category: string | null) => void;
    width: number;
    searchQuery: string;
}) {
    const {data: categoriesData} = useGetCategoriesQuery({
        pollInterval: 5000, // Refresh every 5 seconds
    });

    const {data: torrentsData} = useGetTorrentsQuery({
        pollInterval: 5000, // Refresh every 5 seconds
    });

    const visibleCategories = useMemo(() => {
        const allCategories = categoriesData?.Categories ?? [];

        // If no search query, show all categories
        if (!searchQuery.trim()) {
            return allCategories;
        }

        // Filter torrents based on search query
        const query = searchQuery.toLowerCase();
        const filteredTorrents = (torrentsData?.Torrents ?? []).filter((torrent) =>
            torrent.Name.toLowerCase().includes(query) ||
            torrent.Category.toLowerCase().includes(query) ||
            torrent.InfoHashV1.toLowerCase().includes(query) ||
            torrent.Server.toLowerCase().includes(query) ||
            torrent.SavePath.toLowerCase().includes(query)
        );

        // Get unique categories from filtered torrents
        const categoriesInResults = new Set(
            filteredTorrents.map((torrent) => torrent.Category)
        );

        // Only show categories that have matching torrents
        return allCategories.filter((category) =>
            categoriesInResults.has(category.Name)
        );
    }, [categoriesData?.Categories, torrentsData?.Torrents, searchQuery]);

    return (
        <div className="bg-[var(--qbt-bg-secondary)] border-r border-[var(--qbt-border)] overflow-y-auto"
             style={{width: `${width}px`}}>
            <div className="p-2">
                <div className="text-xs font-semibold text-[var(--qbt-text-secondary)] mb-2 px-2">CATEGORIES</div>

                <button
                    type="button"
                    onClick={() => onCategorySelect(null)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                        selectedCategory === null
                            ? 'bg-[var(--qbt-selected)] text-white'
                            : 'hover:bg-[var(--qbt-bg-tertiary)] text-[var(--qbt-text-primary)]'
                    }`}
                >
                    <Folder size={16} className="flex-shrink-0"/>
                    <span className="truncate">All</span>
                </button>

                {visibleCategories.map((category) => (
                    <button
                        type="button"
                        key={category.Name}
                        onClick={() => onCategorySelect(category.Name)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                            selectedCategory === category.Name
                                ? 'bg-[var(--qbt-selected)] text-white'
                                : 'hover:bg-[var(--qbt-bg-tertiary)] text-[var(--qbt-text-primary)]'
                        }`}
                    >
                        {selectedCategory === category.Name ? <FolderOpen size={16} className="flex-shrink-0"/> :
                            <Folder size={16} className="flex-shrink-0"/>}
                        <span className="truncate">{category.Name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
