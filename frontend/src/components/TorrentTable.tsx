import {useEffect, useMemo, useRef, useState} from "react";
import {
	type ColumnSizingState,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import {useMutation, useQuery} from "@apollo/client/react";
import {AlertCircle, ArrowDown, ArrowUp, Clock, HelpCircle, Pause, RefreshCw,} from "lucide-react";
import {GET_TORRENTS, PAUSE_TORRENTS} from "../queries";
import type {Torrent} from "../types";

function PauseButton({torrent}: { torrent: Torrent }) {
    const [pauseTorrents] = useMutation(PAUSE_TORRENTS);

    const handlePause = (e: React.MouseEvent) => {
        e.stopPropagation();
        pauseTorrents({
            variables: {
                args: {
                    Torrents: [
                        {
                            Server: torrent.Server,
                            Hash: torrent.InfoHashV1,
                        },
                    ],
                },
            },
        });
    };

    return (
        <button
            type="button"
            onClick={handlePause}
            className="p-1 hover:bg-[var(--qbt-bg-tertiary)] rounded transition-colors text-[var(--qbt-text-primary)]"
            title="Pause"
        >
            <Pause size={16}/>
        </button>
    );
}

function StatusIcon({state}: { state: string }) {
    let icon = null;
    switch (state) {
        case "downloading":
        case "forcedDL":
        case "metaDL":
            icon = <ArrowDown size={16} className="text-blue-500"/>;
            break;
        case "uploading":
        case "forcedUP":
            icon = <ArrowUp size={16} className="text-green-500"/>;
            break;
        case "stalledDL":
            icon = <ArrowDown size={16} className="text-blue-300"/>;
            break;
        case "stalledUP":
            icon = <ArrowUp size={16} className="text-green-300"/>;
            break;
        case "pausedDL":
        case "stoppedUP":
        case "pausedUP":
            icon = <Pause size={16} className="text-gray-500"/>;
            break;
        case "queuedDL":
        case "queuedUP":
            icon = <Clock size={16} className="text-yellow-500"/>;
            break;
        case "checkingDL":
        case "checkingUP":
        case "checkingResumeData":
        case "allocating":
        case "moving":
            icon = <RefreshCw size={16} className="text-cyan-500 animate-spin"/>;
            break;
        case "error":
        case "missingFiles":
            icon = <AlertCircle size={16} className="text-red-500"/>;
            break;
        case "unknown":
            icon = <HelpCircle size={16} className="text-gray-500"/>;
            break;
        default:
            return <div title={state} className="w-4 h-4"/>;
    }

    return <div title={state}>{icon}</div>;
}

function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
}

function formatDate(timestamp: number): string {
	if (!timestamp) return "-";
	const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
	return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

// Calculate average progress
function getProgress(torrent: Torrent): number {
	if (!torrent.Files || torrent.Files.length === 0) return 0;
	const totalProgress = torrent.Files.reduce(
		(sum, file) => sum + file.Progress,
		0,
	);
	return totalProgress / torrent.Files.length;
}

const columnHelper = createColumnHelper<Torrent>();

const columns = [
	columnHelper.accessor("Name", {
		header: "Name",
		size: 300,
		cell: (info) => (
			<div className="flex items-center gap-2 truncate" title={info.getValue()}>
				<StatusIcon state={info.row.original.State}/>
				<span className="truncate">{info.getValue()}</span>
			</div>
		),
	}),
	columnHelper.accessor("SizeBytes", {
		header: "Size",
		size: 100,
		cell: (info) => formatBytes(info.getValue()),
	}),
	columnHelper.accessor("SavePath", {
		header: "Path",
		size: 250,
		cell: (info) => (
			<div className="truncate" title={info.getValue()}>
				{info.getValue()}
			</div>
		),
	}),
	columnHelper.display({
		id: "progress",
		header: "Progress",
		size: 150,
		cell: (info) => {
			const progress = getProgress(info.row.original);
			return (
				<div className="relative bg-[var(--qbt-bg-tertiary)] rounded-full h-4 overflow-hidden">
					<div
						className="bg-[var(--qbt-accent)] h-full"
						style={{width: `${progress * 100}%`}}
					/>
					<span
						className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
						{(progress * 100).toFixed(1)}%
					</span>
				</div>
			);
		},
	}),
	columnHelper.accessor("Ratio", {
		header: "Ratio",
		size: 80,
		cell: (info) => info.getValue().toFixed(2),
	}),
	columnHelper.accessor("AddedOn", {
		header: "Added On",
		size: 180,
		cell: (info) => formatDate(info.getValue()),
	}),
	columnHelper.accessor("Category", {
		header: "Category",
		size: 150,
		cell: (info) => (
			<div className="truncate" title={info.getValue()}>
				{info.getValue() || "-"}
			</div>
		),
	}),
	columnHelper.accessor("Server", {
		header: "Server",
		size: 120,
		cell: (info) => (
			<div className="truncate" title={info.getValue()}>
				{info.getValue()}
			</div>
		),
	}),
    columnHelper.display({
        id: "actions",
        header: "Actions",
        size: 80,
        cell: (info) => <PauseButton torrent={info.row.original}/>,
    }),
];

export default function TorrentTable({
										 selectedCategory,
										 selectedTorrentHash,
										 onTorrentSelect,
										 searchQuery,
									 }: {
	selectedCategory: string | null;
	selectedTorrentHash: string | null;
	onTorrentSelect: (hash: string) => void;
	searchQuery: string;
}) {
	const {data} = useQuery<{ Torrents: Torrent[] }>(GET_TORRENTS, {
		variables: {
			categories: selectedCategory ? [selectedCategory] : undefined,
		},
		pollInterval: 2000, // Refresh every 2 seconds
	});

	const torrents = useMemo(() => {
		const allTorrents = data?.Torrents ?? [];

		if (!searchQuery.trim()) {
			return allTorrents;
		}

		const query = searchQuery.toLowerCase();
		return allTorrents.filter(
			(torrent) =>
				torrent.Name.toLowerCase().includes(query) ||
				torrent.Category.toLowerCase().includes(query) ||
				torrent.InfoHashV1.toLowerCase().includes(query) ||
				torrent.Server.toLowerCase().includes(query) ||
				torrent.SavePath.toLowerCase().includes(query),
		);
	}, [data?.Torrents, searchQuery]);

	const [sorting, setSorting] = useState<SortingState>([
		{id: "AddedOn", desc: true},
		{id: "Name", desc: false},
	]);
	const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const scrollPositionRef = useRef<number>(0);

	// Preserve scroll position on data updates
	useEffect(() => {
		const container = scrollContainerRef.current;
		if (container) {
			container.scrollTop = scrollPositionRef.current;
		}
	});

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		scrollPositionRef.current = e.currentTarget.scrollTop;
	};

	// Custom sorting handler that maintains Name as secondary sort
	const handleSortingChange = (updater: any) => {
		setSorting((old) => {
			const newSorting = typeof updater === "function" ? updater(old) : updater;
			// Always ensure Name is the secondary sort if not already the primary sort
			if (newSorting.length > 0 && newSorting[0].id !== "Name") {
				return [newSorting[0], {id: "Name", desc: false}];
			}
			return newSorting;
		});
	};

	const table = useReactTable({
		data: torrents,
		columns,
		state: {
			sorting,
			columnSizing,
		},
		onSortingChange: handleSortingChange,
		onColumnSizingChange: setColumnSizing,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		columnResizeMode: "onChange",
		getRowId: (row) => row.InfoHashV1,
		defaultColumn: {
			minSize: 50,
			maxSize: 800,
		},
	});

	return (
		<div
			ref={scrollContainerRef}
			onScroll={handleScroll}
			className="flex-1 bg-[var(--qbt-bg-primary)] overflow-auto"
		>
			<table className="w-full text-sm" style={{tableLayout: "fixed"}}>
				<thead className="sticky top-0 bg-[var(--qbt-bg-secondary)] border-b border-[var(--qbt-border)] z-10">
				{table.getHeaderGroups().map((headerGroup) => (
					<tr key={headerGroup.id}>
						{headerGroup.headers.map((header) => (
							<th
								key={header.id}
								className="text-left px-3 py-2 font-medium hover:bg-[var(--qbt-bg-tertiary)] transition-colors relative"
								style={{width: `${header.getSize()}px`}}
							>
								<button
									type="button"
									className="cursor-pointer w-full text-left"
									onClick={header.column.getToggleSortingHandler()}
								>
									{header.isPlaceholder ? null : (
										<div className="flex items-center gap-1">
											{flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
											{{
												asc: " ↑",
												desc: " ↓",
											}[header.column.getIsSorted() as string] ?? null}
										</div>
									)}
								</button>
								{/* biome-ignore lint/a11y/noStaticElementInteractions: Column resize handle is a standard table UI pattern */}
								<div
									onMouseDown={header.getResizeHandler()}
									onTouchStart={header.getResizeHandler()}
									className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none ${
										header.column.getIsResizing()
											? "bg-[var(--qbt-accent)] opacity-100"
											: "bg-[var(--qbt-border)] opacity-0 hover:opacity-100"
									}`}
								/>
							</th>
						))}
					</tr>
				))}
				</thead>
				<tbody>
				{table.getRowModel().rows.length === 0 && (
					<tr>
						<td
							colSpan={columns.length}
							className="text-center py-8 text-[var(--qbt-text-secondary)]"
						>
							No torrents found
						</td>
					</tr>
				)}
				{table.getRowModel().rows.map((row, index) => {
					const isSelected = selectedTorrentHash === row.original.InfoHashV1;
					const isEven = index % 2 === 0;
					return (
						<tr
							key={row.id}
							onClick={() => onTorrentSelect(row.original.InfoHashV1)}
							className={`border-b border-[var(--qbt-border)] cursor-pointer transition-colors ${
								isSelected
									? "bg-[var(--qbt-selected)]"
									: isEven
										? "hover:bg-[var(--qbt-bg-secondary)]"
										: "bg-[var(--qbt-bg-secondary)] hover:bg-[var(--qbt-bg-tertiary)]"
							}`}
						>
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="px-3 py-2">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					);
				})}
				</tbody>
			</table>
		</div>
	);
}
