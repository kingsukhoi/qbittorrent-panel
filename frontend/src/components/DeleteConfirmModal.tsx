import {Dialog, DialogPanel, DialogTitle} from "@headlessui/react";
import {useState} from "react";
import {useDeleteTorrents} from "../hooks/useTorrentMutations";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    torrents: { Server: string; InfoHashV1: string; Name: string }[];
    onDeleted: () => void;
}

export default function DeleteConfirmModal({
                                               isOpen,
                                               onClose,
                                               torrents,
                                               onDeleted,
                                           }: DeleteConfirmModalProps) {
    const [deleteFiles, setDeleteFiles] = useState(false);
    const {mutateAsync: deleteTorrents, isPending} = useDeleteTorrents();

    const handleConfirm = async () => {
        await deleteTorrents({
            Torrents: torrents.map((t) => ({Server: t.Server, Hash: t.InfoHashV1})),
            DeleteFiles: deleteFiles,
        });
        setDeleteFiles(false);
        onDeleted();
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/50" aria-hidden="true"/>
            <div className="fixed inset-0 flex items-center justify-center">
                <DialogPanel
                    className="bg-[var(--qbt-bg-secondary)] border border-[var(--qbt-border)] rounded-lg w-full max-w-sm shadow-xl p-6 space-y-4">
                    <DialogTitle className="text-lg font-semibold text-[var(--qbt-text-primary)]">
                        Delete {torrents.length} torrent{torrents.length > 1 ? "s" : ""}?
                    </DialogTitle>
                    <div
                        className="max-h-40 overflow-y-auto rounded border border-[var(--qbt-border)] bg-[var(--qbt-bg-primary)]">
                        {torrents.map((t) => (
                            <div
                                key={t.InfoHashV1}
                                className="px-3 py-1.5 text-sm text-[var(--qbt-text-primary)] border-b border-[var(--qbt-border)] last:border-0 truncate"
                                title={t.Name}
                            >
                                {t.Name}
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-[var(--qbt-text-secondary)]">
                        This cannot be undone.
                    </p>
                    <label className="flex items-center gap-2 text-sm text-[var(--qbt-text-primary)] cursor-pointer">
                        <input
                            type="checkbox"
                            checked={deleteFiles}
                            onChange={(e) => setDeleteFiles(e.target.checked)}
                            className="accent-red-500 cursor-pointer"
                        />
                        Also delete files from disk
                    </label>
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-[var(--qbt-bg-tertiary)] hover:bg-[var(--qbt-bg-primary)] text-[var(--qbt-text-primary)] rounded transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isPending}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50"
                        >
                            {isPending ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
