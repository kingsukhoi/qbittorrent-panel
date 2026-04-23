import {Dialog, DialogPanel, DialogTitle} from "@headlessui/react";
import {ChevronDown, Search, X} from "lucide-react";
import {useEffect, useRef, useState} from "react";
import {useCreateCategory} from "../hooks/useTorrentMutations";
import {useTorrents} from "../hooks/useTorrents";

interface CreateCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateCategoryModal({
                                                isOpen,
                                                onClose,
                                            }: CreateCategoryModalProps) {
    const [name, setName] = useState("");
    const [path, setPath] = useState("");
    const [server, setServer] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);
    const [serverSearch, setServerSearch] = useState("");
    const serverDropdownRef = useRef<HTMLDivElement>(null);
    const serverSearchRef = useRef<HTMLInputElement>(null);

    const {data: torrentsData} = useTorrents();
    const {mutateAsync: createCategory, isPending} = useCreateCategory();

    const torrents = torrentsData?.Torrents ?? [];
    const serverCounts = new Map<string, number>();
    for (const t of torrents) {
        if (t.Server)
            serverCounts.set(t.Server, (serverCounts.get(t.Server) ?? 0) + 1);
    }
    const servers = [...serverCounts.keys()]
        .sort()
        .filter((s) => s.toLowerCase().includes(serverSearch.toLowerCase()));

    useEffect(() => {
        if (!isServerDropdownOpen) return;
        const handler = (e: MouseEvent) => {
            if (
                serverDropdownRef.current &&
                !serverDropdownRef.current.contains(e.target as Node)
            ) {
                setIsServerDropdownOpen(false);
                setServerSearch("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isServerDropdownOpen]);

    useEffect(() => {
        if (isServerDropdownOpen) serverSearchRef.current?.focus();
    }, [isServerDropdownOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !server) return;
        setError(null);
        try {
            await createCategory({Name: name, Path: path, Server: server});
            setName("");
            setPath("");
            setServer("");
            onClose();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to create category",
            );
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/50" aria-hidden="true"/>
            <div className="fixed inset-0 flex items-center justify-center">
                <DialogPanel
                    className="bg-[var(--qbt-bg-secondary)] border border-[var(--qbt-border)] rounded-lg w-full max-w-sm shadow-xl">
                    <div className="flex items-center justify-between p-4 border-b border-[var(--qbt-border)]">
                        <DialogTitle className="text-lg font-semibold text-[var(--qbt-text-primary)]">
                            Create Category
                        </DialogTitle>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1 hover:bg-[var(--qbt-bg-tertiary)] rounded transition-colors"
                        >
                            <X size={20}/>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        <div>
                            <label
                                htmlFor="category-name"
                                className="block text-sm font-medium text-[var(--qbt-text-primary)] mb-1"
                            >
                                Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                id="category-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-[var(--qbt-bg-primary)] border border-[var(--qbt-border)] rounded text-[var(--qbt-text-primary)] placeholder:text-[var(--qbt-text-secondary)] focus:outline-none focus:border-[var(--qbt-accent)] transition-colors"
                                placeholder="Category name"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="category-path"
                                className="block text-sm font-medium text-[var(--qbt-text-primary)] mb-1"
                            >
                                Path
                            </label>
                            <input
                                id="category-path"
                                type="text"
                                value={path}
                                onChange={(e) => setPath(e.target.value)}
                                className="w-full px-3 py-2 bg-[var(--qbt-bg-primary)] border border-[var(--qbt-border)] rounded text-[var(--qbt-text-primary)] placeholder:text-[var(--qbt-text-secondary)] focus:outline-none focus:border-[var(--qbt-accent)] transition-colors"
                                placeholder="/optional/save/path"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="category-server"
                                className="block text-sm font-medium text-[var(--qbt-text-primary)] mb-1"
                            >
                                Server <span className="text-red-400">*</span>
                            </label>
                            <div ref={serverDropdownRef} className="relative">
                                <button
                                    id="category-server"
                                    type="button"
                                    onClick={() => setIsServerDropdownOpen((v) => !v)}
                                    className="w-full px-3 py-2 bg-[var(--qbt-bg-primary)] border border-[var(--qbt-border)] rounded text-[var(--qbt-text-primary)] focus:outline-none focus:border-[var(--qbt-accent)] transition-colors flex items-center justify-between"
                                >
									<span
                                        className={server ? "" : "text-[var(--qbt-text-secondary)]"}
                                    >
										{server
                                            ? `${server} (${serverCounts.get(server) ?? 0})`
                                            : "Select server"}
									</span>
                                    <ChevronDown
                                        size={20}
                                        className={`transition-transform ${isServerDropdownOpen ? "rotate-180" : ""}`}
                                    />
                                </button>
                                {isServerDropdownOpen && (
                                    <div
                                        className="absolute z-10 w-full mt-1 bg-[var(--qbt-bg-secondary)] border border-[var(--qbt-border)] rounded-lg shadow-xl max-h-56 overflow-hidden flex flex-col">
                                        <div className="p-2 border-b border-[var(--qbt-border)]">
                                            <div className="relative">
                                                <Search
                                                    size={18}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--qbt-text-secondary)]"
                                                />
                                                <input
                                                    ref={serverSearchRef}
                                                    type="text"
                                                    value={serverSearch}
                                                    onChange={(e) => setServerSearch(e.target.value)}
                                                    placeholder="Search servers..."
                                                    className="w-full pl-10 pr-3 py-2 bg-[var(--qbt-bg-primary)] border border-[var(--qbt-border)] rounded text-[var(--qbt-text-primary)] placeholder:text-[var(--qbt-text-secondary)] focus:outline-none focus:border-[var(--qbt-accent)] transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="overflow-y-auto">
                                            {servers.length > 0 ? (
                                                servers.map((s) => (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onClick={() => {
                                                            setServer(s);
                                                            setIsServerDropdownOpen(false);
                                                            setServerSearch("");
                                                        }}
                                                        className="w-full px-3 py-2 text-left hover:bg-[var(--qbt-bg-tertiary)] transition-colors flex items-center justify-between"
                                                    >
														<span className="text-[var(--qbt-text-primary)]">
															{s}
														</span>
                                                        <span className="text-[var(--qbt-text-secondary)] text-xs">
															{serverCounts.get(s)} torrents
														</span>
                                                    </button>
                                                ))
                                            ) : (
                                                <div
                                                    className="px-3 py-4 text-center text-[var(--qbt-text-secondary)] text-sm">
                                                    No servers found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
                                {error}
                            </div>
                        )}

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
                                disabled={!name || !server || isPending}
                                className="px-4 py-2 bg-[var(--qbt-accent)] hover:bg-[var(--qbt-accent)]/80 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? "Creating..." : "Create"}
                            </button>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
