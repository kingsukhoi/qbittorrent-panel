import {useEffect, useMemo, useRef, useState} from "react";
import {
	type ColumnSizingState,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type RowSelectionState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import {useTorrents} from "../hooks/useTorrents";
import {AlertCircle, ArrowDown, ArrowDownUp, ArrowUp, Clock, HelpCircle, Pause, RefreshCw,} from "lucide-react";
import type {Torrent} from "../types";

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
	columnHelper.accessor("State", {
		header: ({table}) => {
			const selectedCount = table.getSelectedRowModel().rows.length;
			return (
				<div className="flex items-center gap-1.5">
					<input
						type="checkbox"
						checked={table.getIsAllRowsSelected()}
						ref={(el) => {
							if (el) el.indeterminate = table.getIsSomeRowsSelected();
						}}
						onChange={() =>
							table.toggleAllRowsSelected(
								!table.getIsAllRowsSelected() && !table.getIsSomeRowsSelected(),
							)
						}
						className="cursor-pointer accent-[var(--qbt-accent)]"
					/>
					{selectedCount > 0 && (
						<span className="text-xs text-[var(--qbt-text-secondary)]">
							{selectedCount}
						</span>
					)}
				</div>
			);
		},
		size: 36,
		enableSorting: false,
		cell: (info) => (
			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					info.row.toggleSelected();
				}}
				className="flex items-center justify-center w-6 h-6 rounded hover:bg-[var(--qbt-bg-tertiary)] transition-colors"
			>
				{info.row.getIsSelected() ? (
					<input
						type="checkbox"
						checked
						readOnly
						className="cursor-pointer accent-[var(--qbt-accent)] pointer-events-none"
					/>
				) : (
					<StatusIcon state={info.getValue()}/>
				)}
			</button>
		),
	}),
	columnHelper.accessor("Name", {
		header: "Name",
		size: 300,
		cell: (info) => (
			<div className="truncate" title={info.getValue()}>
				{info.getValue()}
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
];

export default function TorrentTable({
										 selectedCategory,
										 selectedServer,
										 selectedTracker,
										 selectedTrackerStatus,
										 selectedTorrentHash,
										 onTorrentSelect,
										 searchQuery,
										 onSelectionChange,
										 sortResetKey,
										 isMobile,
									 }: {
	selectedCategory: string | null;
	selectedServer: string | null;
	selectedTracker: string | null;
	selectedTrackerStatus: string | null;
	selectedTorrentHash: string | null;
	onTorrentSelect: (hash: string) => void;
	searchQuery: string;
	onSelectionChange?: (torrents: Torrent[]) => void;
	sortResetKey?: number;
	isMobile?: boolean;
}) {
	const {data} = useTorrents({
		categories: selectedCategory ? [selectedCategory] : undefined,
		servers: selectedServer ? [selectedServer] : undefined,
	});

	const torrents = useMemo(() => {
		let allTorrents = data?.Torrents ?? [];

		if (selectedTracker) {
			allTorrents = allTorrents.filter((t) => t.TrackerUrl === selectedTracker);
		}

		if (selectedTrackerStatus) {
			allTorrents = allTorrents.filter((t) => {
				if (!t.Trackers?.length) return false;
				const primary =
					t.Trackers.find((tr) => tr.Url === t.TrackerUrl) ?? t.Trackers[0];
				return primary?.Status === selectedTrackerStatus;
			});
		}

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
	}, [data?.Torrents, searchQuery, selectedTracker]);

	const columnVisibility = useMemo(
		() => ({
			SavePath: !isMobile,
			Ratio: !isMobile,
			AddedOn: !isMobile,
			Category: !isMobile,
			Server: !isMobile,
		}),
		[isMobile],
	);

	const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);

	const mobileSortOptions = [
		{id: "AddedOn", label: "Added On"},
		{id: "Name", label: "Name"},
		{id: "SizeBytes", label: "Size"},
		{id: "Category", label: "Category"},
		{id: "State", label: "Status"},
	];

	const defaultSorting: SortingState = [
		{id: "AddedOn", desc: true},
		{id: "Name", desc: false},
	];
	const [sorting, setSorting] = useState<SortingState>(defaultSorting);

	useEffect(() => {
		if (sortResetKey) setSorting(defaultSorting);
	}, [sortResetKey]);
	const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
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
			rowSelection,
			columnVisibility,
		},
		onSortingChange: handleSortingChange,
		onColumnSizingChange: setColumnSizing,
		onRowSelectionChange: (updater) => {
			setRowSelection((old) => {
				const next = typeof updater === "function" ? updater(old) : updater;
				const selected = torrents.filter((t) => next[t.InfoHashV1]);
				onSelectionChange?.(selected);
				return next;
			});
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		columnResizeMode: "onChange",
		enableRowSelection: true,
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
			className={`flex-1 bg-[var(--qbt-bg-primary)] ${isMobile ? "overflow-y-auto overflow-x-hidden" : "overflow-auto"}`}
		>
			{isMobile ? (
				/* Mobile card list */
				<div className="flex flex-col">
					{/* Sort bar */}
					<div
						className="sticky top-0 z-10 flex items-center justify-end px-3 py-1.5 bg-[var(--qbt-bg-secondary)] border-b border-[var(--qbt-border)]">
						<div className="relative">
							<button
								type="button"
								onClick={() => setIsMobileSortOpen((v) => !v)}
								className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-[var(--qbt-text-secondary)] hover:bg-[var(--qbt-bg-tertiary)] transition-colors"
							>
								<ArrowDownUp size={13}/>
								{mobileSortOptions.find((o) => o.id === sorting[0]?.id)
									?.label ?? "Sort"}
								{sorting[0] &&
									(sorting[0].desc ? (
										<ArrowDown size={11}/>
									) : (
										<ArrowUp size={11}/>
									))}
							</button>
							{isMobileSortOpen && (
								<div
									className="absolute right-0 top-full mt-1 w-36 bg-[var(--qbt-bg-secondary)] border border-[var(--qbt-border)] rounded shadow-lg z-50">
									{mobileSortOptions.map((opt) => {
										const active = sorting[0]?.id === opt.id;
										return (
											<button
												key={opt.id}
												type="button"
												onClick={() => {
													setSorting(
														active
															? [
																{id: opt.id, desc: !sorting[0].desc},
																{
																	id: "Name",
																	desc: false,
																},
															]
															: [
																{id: opt.id, desc: true},
																{id: "Name", desc: false},
															],
													);
													setIsMobileSortOpen(false);
												}}
												className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
													active
														? "text-[var(--qbt-accent)] bg-[var(--qbt-bg-tertiary)]"
														: "text-[var(--qbt-text-primary)] hover:bg-[var(--qbt-bg-tertiary)]"
												}`}
											>
												{opt.label}
												{active &&
													(sorting[0].desc ? (
														<ArrowDown size={13}/>
													) : (
														<ArrowUp size={13}/>
													))}
											</button>
										);
									})}
								</div>
							)}
						</div>
					</div>
					{table.getRowModel().rows.length === 0 && (
						<div className="text-center py-8 text-[var(--qbt-text-secondary)] text-sm">
							No torrents found
						</div>
					)}
					{table.getRowModel().rows.map((row, index) => {
						const torrent = row.original;
						const isSelected = selectedTorrentHash === torrent.InfoHashV1;
						const isChecked = row.getIsSelected();
						const progress = getProgress(torrent);
						const isEven = index % 2 === 0;
						return (
							<div
								key={row.id}
								onClick={() => onTorrentSelect(torrent.InfoHashV1)}
								className={`flex items-start gap-2 px-3 py-2 border-b border-[var(--qbt-border)] cursor-pointer transition-colors ${
									isSelected
										? "bg-[var(--qbt-selected)]"
										: isEven
											? "hover:bg-[var(--qbt-bg-secondary)]"
											: "bg-[var(--qbt-bg-secondary)] hover:bg-[var(--qbt-bg-tertiary)]"
								}`}
							>
								{/* Checkbox / status icon */}
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										row.toggleSelected();
									}}
									className="flex-shrink-0 flex items-center justify-center w-6 h-6 mt-0.5 rounded hover:bg-[var(--qbt-bg-tertiary)] transition-colors"
								>
									{isChecked ? (
										<input
											type="checkbox"
											checked
											readOnly
											className="cursor-pointer accent-[var(--qbt-accent)] pointer-events-none"
										/>
									) : (
										<StatusIcon state={torrent.State}/>
									)}
								</button>

								{/* 3-row content */}
								<div className="flex-1 min-w-0 flex flex-col gap-1">
									{/* Row 1: Name — wraps */}
									<div className="text-sm text-[var(--qbt-text-primary)] leading-snug break-words">
										{torrent.Name}
									</div>
									{/* Row 2: Category(path) left, Size right */}
									<div
										className="flex items-center justify-between text-xs text-[var(--qbt-text-secondary)]">
										<span className="truncate mr-2">
											{torrent.Category || "—"}
										</span>
										<span className="flex-shrink-0">
											{formatBytes(torrent.SizeBytes)}
										</span>
									</div>
									{/* Row 3: Progress bar — only when incomplete */}
									{progress < 1 && (
										<div
											className="relative bg-[var(--qbt-bg-tertiary)] rounded-full h-3.5 overflow-hidden">
											<div
												className="bg-[var(--qbt-accent)] h-full"
												style={{width: `${progress * 100}%`}}
											/>
											<span
												className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
												{(progress * 100).toFixed(1)}%
											</span>
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			) : (
				/* Desktop table */
				<table className="w-full text-sm" style={{tableLayout: "fixed"}}>
					<thead
						className="sticky top-0 bg-[var(--qbt-bg-secondary)] border-b border-[var(--qbt-border)] z-10">
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
										className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hidden md:block ${
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
								colSpan={table.getAllColumns().length}
								className="text-center py-8 text-[var(--qbt-text-secondary)]"
							>
								No torrents found
							</td>
						</tr>
					)}
					{table.getRowModel().rows.map((row, index) => {
						const isSelected =
							selectedTorrentHash === row.original.InfoHashV1;
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
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext(),
										)}
									</td>
								))}
							</tr>
						);
					})}
					</tbody>
				</table>
			)}
		</div>
	);
}
