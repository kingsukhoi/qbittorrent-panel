import {Check, ChevronDown, Search, Upload, X} from "lucide-react";
import {useEffect, useId, useRef, useState} from "react";
import {useQuery} from "@apollo/client/react";
import {GET_CATEGORIES} from "../queries";
import {Category} from "../types";
import {getApiUrl} from "../lib/api";

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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const categoryId = useId();

    const {data: categoriesData} = useQuery<{ Categories: Category[] }>(
        GET_CATEGORIES,
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter categories based on search query
    const filteredCategories =
        categoriesData?.Categories.filter((category) =>
            category.Name.toLowerCase().includes(searchQuery.toLowerCase()),
        ) || [];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
                setSearchQuery("");
            }
        };

        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isDropdownOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isDropdownOpen]);

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
        setIsDropdownOpen(false);
        setSearchQuery("");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const torrentFiles = files.filter((file) => file.name.endsWith(".torrent"));
        if (torrentFiles.length > 0) {
            setSelectedFiles((prev) => [...prev, ...torrentFiles]);
        }
        // Reset the input value so the same file can be selected again
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

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
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
            if (selectedCategory) {
                formData.append("category", selectedCategory);
            } else {
                formData.append("category", "");
            }

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

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div
                className="bg-[var(--qbt-bg-secondary)] border border-[var(--qbt-border)] rounded-lg w-full max-w-md shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--qbt-border)]">
                    <h2 className="text-lg font-semibold text-[var(--qbt-text-primary)]">
                        Upload Torrent
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 hover:bg-[var(--qbt-bg-tertiary)] rounded transition-colors"
                    >
                        <X size={20}/>
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
                        onClick={handleBrowseClick}
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
                                {selectedFiles.map((file, index) => (
                                    <div
                                        key={`${file.name}-${index}`}
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
                                                removeFile(index);
                                            }}
                                            className="p-1 hover:text-red-400 transition-colors"
                                        >
                                            <X size={16}/>
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
                            htmlFor={categoryId}
                            className="block text-sm font-medium text-[var(--qbt-text-primary)] mb-2"
                        >
                            Category (Optional)
                        </label>
                        <div ref={dropdownRef} className="relative">
                            {/* Dropdown Button */}
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full px-3 py-2 bg-[var(--qbt-bg-primary)] border border-[var(--qbt-border)] rounded text-[var(--qbt-text-primary)] focus:outline-none focus:border-[var(--qbt-accent)] transition-colors flex items-center justify-between"
                            >
								<span
                                    className={
                                        selectedCategory ? "" : "text-[var(--qbt-text-secondary)]"
                                    }
                                >
									{selectedCategory || "No Category"}
								</span>
                                <ChevronDown
                                    size={20}
                                    className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div
                                    className="absolute z-10 w-full mt-1 bg-[var(--qbt-bg-secondary)] border border-[var(--qbt-border)] rounded-lg shadow-xl max-h-64 overflow-hidden flex flex-col">
                                    {/* Search Input */}
                                    <div className="p-2 border-b border-[var(--qbt-border)]">
                                        <div className="relative">
                                            <Search
                                                size={18}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--qbt-text-secondary)]"
                                            />
                                            <input
                                                ref={searchInputRef}
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search categories..."
                                                className="w-full pl-10 pr-3 py-2 bg-[var(--qbt-bg-primary)] border border-[var(--qbt-border)] rounded text-[var(--qbt-text-primary)] placeholder:text-[var(--qbt-text-secondary)] focus:outline-none focus:border-[var(--qbt-accent)] transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Options List */}
                                    <div className="overflow-y-auto">
                                        {/* No Category Option */}
                                        <button
                                            type="button"
                                            onClick={() => handleCategorySelect("")}
                                            className="w-full px-3 py-2 text-left hover:bg-[var(--qbt-bg-tertiary)] transition-colors flex items-center justify-between group"
                                        >
											<span className="text-[var(--qbt-text-secondary)]">
												No Category
											</span>
                                            {!selectedCategory && (
                                                <Check size={18} className="text-[var(--qbt-accent)]"/>
                                            )}
                                        </button>

                                        {/* Category Options */}
                                        {filteredCategories.length > 0 ? (
                                            filteredCategories.map((category) => (
                                                <button
                                                    key={category.Name}
                                                    type="button"
                                                    onClick={() => handleCategorySelect(category.Name)}
                                                    className="w-full px-3 py-2 text-left hover:bg-[var(--qbt-bg-tertiary)] transition-colors flex items-center justify-between group"
                                                >
													<span className="text-[var(--qbt-text-primary)]">
														{category.Name}
													</span>
                                                    {selectedCategory === category.Name && (
                                                        <Check
                                                            size={18}
                                                            className="text-[var(--qbt-accent)]"
                                                        />
                                                    )}
                                                </button>
                                            ))
                                        ) : (
                                            <div
                                                className="px-3 py-4 text-center text-[var(--qbt-text-secondary)] text-sm">
                                                No categories found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
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
            </div>
        </div>
    );
}
