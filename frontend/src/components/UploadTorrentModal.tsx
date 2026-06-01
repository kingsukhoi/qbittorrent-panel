import {
	Combobox,
	ComboboxButton,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions,
	Dialog,
	DialogPanel,
	DialogTitle,
} from "@headlessui/react";
import { Check, ChevronDown, Upload, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { useCategories } from "../hooks/useCategories";
import { getApiUrl } from "../lib/api";

interface UploadTorrentModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function UploadTorrentModal({
	isOpen,
	onClose,
}: UploadTorrentModalProps) {
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string>("");
	const [isDragging, setIsDragging] = useState(false);
	const [query, setQuery] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const comboButtonRef = useRef<HTMLButtonElement>(null);
	const categoryInputId = useId();

	const { data: categoriesData } = useCategories();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const allCategories = categoriesData?.Categories ?? [];
	const filteredCategories =
		query === ""
			? allCategories
			: allCategories.filter((c) =>
					c.Name.toLowerCase().includes(query.toLowerCase()),
				);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		const torrentFiles = files.filter((file) => file.name.endsWith(".torrent"));
		if (torrentFiles.length > 0) {
			setSelectedFiles((prev) => [...prev, ...torrentFiles]);
		}
		e.target.value = "";
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const files = Array.from(e.dataTransfer.files);
		const torrentFiles = files.filter((file) => file.name.endsWith(".torrent"));
		if (torrentFiles.length > 0) {
			setSelectedFiles((prev) => [...prev, ...torrentFiles]);
		}
	};

	const removeFile = (name: string) => {
		setSelectedFiles((prev) => prev.filter((f) => f.name !== name));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (selectedFiles.length === 0) return;

		setLoading(true);
		setError(null);

		try {
			const formData = new FormData();
			for (const file of selectedFiles) {
				formData.append("torrents", file);
			}
			formData.append("category", selectedCategory);

			const response = await fetch(getApiUrl("/uploadTorrent"), {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || "Upload failed");
			}

			setSelectedFiles([]);
			setSelectedCategory("");
			onClose();
		} catch (err) {
			console.error("Upload error:", err);
			setError(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onClose={onClose} className="relative z-50">
			<div className="fixed inset-0 bg-black/50" aria-hidden="true" />
			<div className="fixed inset-0 flex items-center justify-center">
				<DialogPanel className="bg-[var(--qbt-bg-secondary)] border border-[var(--qbt-border)] rounded-lg w-full max-w-md shadow-xl">
					<div className="flex items-center justify-between p-4 border-b border-[var(--qbt-border)]">
						<DialogTitle className="text-lg font-semibold text-[var(--qbt-text-primary)]">
							Upload Torrent
						</DialogTitle>
						<button
							type="button"
							onClick={onClose}
							className="p-1 hover:bg-[var(--qbt-bg-tertiary)] rounded transition-colors"
						>
							<X size={20} />
						</button>
					</div>

					{/* Body */}
					<form onSubmit={handleSubmit} className="p-4 space-y-4">
						{/* File Drop Zone */}
						<button
							type="button"
							className={`w-full border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
								isDragging
									? "border-[var(--qbt-accent)] bg-[var(--qbt-accent)]/10"
									: "border-[var(--qbt-border)] hover:border-[var(--qbt-accent)]/50"
							}`}
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
							onClick={() => fileInputRef.current?.click()}
						>
							<input
								ref={fileInputRef}
								type="file"
								multiple
								accept=".torrent"
								onChange={handleFileChange}
								className="hidden"
							/>
							<Upload
								size={48}
								className="mx-auto mb-4 text-[var(--qbt-text-secondary)]"
							/>
							{selectedFiles.length > 0 ? (
								<div className="space-y-2">
									{selectedFiles.map((file) => (
										<div
											key={file.name}
											className="flex items-center justify-between p-2 bg-[var(--qbt-bg-tertiary)] rounded"
										>
											<div className="text-left overflow-hidden">
												<p className="text-[var(--qbt-text-primary)] font-medium truncate">
													{file.name}
												</p>
												<p className="text-[var(--qbt-text-secondary)] text-xs">
													{(file.size / 1024).toFixed(2)} KB
												</p>
											</div>
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													removeFile(file.name);
												}}
												className="p-1 hover:text-red-400 transition-colors"
											>
												<X size={16} />
											</button>
										</div>
									))}
									<span className="text-[var(--qbt-accent)] text-sm block mt-2">
										Click or drop more files to add
									</span>
								</div>
							) : (
								<>
									<p className="text-[var(--qbt-text-primary)] mb-2">
										Drop torrent files here or click to browse
									</p>
									<p className="text-[var(--qbt-text-secondary)] text-sm">
										Only .torrent files are supported
									</p>
								</>
							)}
						</button>

						{/* Category Selection */}
						<div>
							<label
								htmlFor={categoryInputId}
								className="block text-sm font-medium text-[var(--qbt-text-primary)] mb-2"
							>
								Category (Optional)
							</label>
							<Combobox
								value={selectedCategory}
								onChange={(val) => setSelectedCategory(val ?? "")}
								onClose={() => setQuery("")}
							>
								<div className="relative">
									<ComboboxInput
										id={categoryInputId}
										displayValue={(val: string) => val}
										onChange={(e) => setQuery(e.target.value)}
										onClick={() => {
											if (
												!("open" in (comboButtonRef.current?.dataset ?? {}))
											) {
												comboButtonRef.current?.click();
											}
										}}
										placeholder="No Category"
										className="w-full px-3 py-2 pr-10 bg-[var(--qbt-bg-primary)] border border-[var(--qbt-border)] rounded text-[var(--qbt-text-primary)] placeholder:text-[var(--qbt-text-secondary)] focus:outline-none focus:border-[var(--qbt-accent)] transition-colors"
									/>
									<ComboboxButton
										ref={comboButtonRef}
										className="group absolute inset-y-0 right-0 flex items-center px-2"
									>
										<ChevronDown
											size={20}
											className="text-[var(--qbt-text-secondary)] transition-transform group-data-[open]:rotate-180"
										/>
									</ComboboxButton>
									<ComboboxOptions className="absolute z-10 w-full mt-1 bg-[var(--qbt-bg-secondary)] border border-[var(--qbt-border)] rounded-lg shadow-xl max-h-64 overflow-y-auto">
										<ComboboxOption
											value=""
											className="group px-3 py-2 flex items-center justify-between cursor-pointer data-[focus]:bg-[var(--qbt-bg-tertiary)]"
										>
											<span className="text-[var(--qbt-text-secondary)]">
												No Category
											</span>
											<Check
												size={18}
												className="text-[var(--qbt-accent)] invisible group-data-[selected]:visible"
											/>
										</ComboboxOption>
										{filteredCategories.length > 0 ? (
											filteredCategories.map((category) => (
												<ComboboxOption
													key={category.Name}
													value={category.Name}
													className="group px-3 py-2 flex items-center justify-between cursor-pointer data-[focus]:bg-[var(--qbt-bg-tertiary)]"
												>
													<span className="text-[var(--qbt-text-primary)]">
														{category.Name}
													</span>
													<Check
														size={18}
														className="text-[var(--qbt-accent)] invisible group-data-[selected]:visible"
													/>
												</ComboboxOption>
											))
										) : (
											<div className="px-3 py-4 text-center text-[var(--qbt-text-secondary)] text-sm">
												No categories found
											</div>
										)}
									</ComboboxOptions>
								</div>
							</Combobox>
						</div>

						{/* Error Message */}
						{error && (
							<div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
								{error}
							</div>
						)}

						{/* Footer */}
						<div className="flex justify-end gap-2 pt-2">
							<button
								type="button"
								onClick={onClose}
								className="px-4 py-2 bg-[var(--qbt-bg-tertiary)] hover:bg-[var(--qbt-bg-primary)] text-[var(--qbt-text-primary)] rounded transition-colors"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={selectedFiles.length === 0 || loading}
								className="px-4 py-2 bg-[var(--qbt-accent)] hover:bg-[var(--qbt-accent)]/80 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? "Uploading..." : "Upload"}
							</button>
						</div>
					</form>
				</DialogPanel>
			</div>
		</Dialog>
	);
}
