import {useState} from 'react';
import {FileText, Info, List} from 'lucide-react';
import type {Torrent} from '../types';

type Tab = 'general' | 'files' | 'trackers';

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
}

export default function DetailsPanel({torrent, height}: { torrent: Torrent | null; height: number }) {
    const [activeTab, setActiveTab] = useState<Tab>('general');

    if (!torrent) {
        return (
            <div
                className="bg-(--qbt-bg-secondary) border-t border-(--qbt-border) flex items-center justify-center text-(--qbt-text-secondary)"
                style={{height: `${height}px`}}>
                Select a torrent to view details
            </div>
        );
    }

    return (
        <div className="bg-(--qbt-bg-secondary) border-t border-(--qbt-border) flex flex-col"
             style={{height: `${height}px`}}>
            {/* Tabs */}
            <div className="flex border-b border-(--qbt-border)">
                <button
                    type="button"
                    onClick={() => setActiveTab('general')}
                    className={`px-4 py-2 flex items-center gap-2 text-sm transition-colors ${
                        activeTab === 'general'
                            ? 'bg-(--qbt-bg-primary) text-white border-b-2 border-(--qbt-accent)'
                            : 'text-(--qbt-text-secondary) hover:text-white hover:bg-(--qbt-bg-tertiary)'
                    }`}
                >
                    <Info size={16}/>
                    General
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('files')}
                    className={`px-4 py-2 flex items-center gap-2 text-sm transition-colors ${
                        activeTab === 'files'
                            ? 'bg-(--qbt-bg-primary) text-white border-b-2 border-(--qbt-accent)'
                            : 'text-(--qbt-text-secondary) hover:text-white hover:bg-(--qbt-bg-tertiary)'
                    }`}
                >
                    <FileText size={16}/>
                    Files ({torrent.Files.length})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('trackers')}
                    className={`px-4 py-2 flex items-center gap-2 text-sm transition-colors ${
                        activeTab === 'trackers'
                            ? 'bg-(--qbt-bg-primary) text-white border-b-2 border-(--qbt-accent)'
                            : 'text-(--qbt-text-secondary) hover:text-white hover:bg-(--qbt-bg-tertiary)'
                    }`}
                >
                    <List size={16}/>
                    Trackers
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto p-4">
                {activeTab === 'general' && (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                        <div>
                            <div className="text-(--qbt-text-secondary) mb-1">Name:</div>
                            <div className="break-all">{torrent.Name}</div>
                        </div>
                        <div>
                            <div className="text-(--qbt-text-secondary) mb-1">Hash:</div>
                            <div className="font-mono text-xs break-all">{torrent.InfoHashV1}</div>
                        </div>
                        <div>
                            <div className="text-(--qbt-text-secondary) mb-1">Size:</div>
                            <div>{formatBytes(torrent.SizeBytes)}</div>
                        </div>
                        <div>
                            <div className="text-(--qbt-text-secondary) mb-1">Ratio:</div>
                            <div>{torrent.Ratio.toFixed(3)}</div>
                        </div>
                        <div>
                            <div className="text-(--qbt-text-secondary) mb-1">Category:</div>
                            <div>{torrent.Category || 'None'}</div>
                        </div>
                        <div>
                            <div className="text-(--qbt-text-secondary) mb-1">Server:</div>
                            <div>{torrent.Server}</div>
                        </div>
                        <div className="col-span-2">
                            <div className="text-(--qbt-text-secondary) mb-1">Save Path:</div>
                            <div className="font-mono text-xs break-all">{torrent.SavePath}</div>
                        </div>
                        {torrent.Comment && (
                            <div className="col-span-2">
                                <div className="text-(--qbt-text-secondary) mb-1">Comment:</div>
                                <div className="text-xs">{torrent.Comment}</div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'files' && (
                    <div className="overflow-auto">
                        <table className="w-full text-sm">
                            <thead
                                className="sticky top-0 bg-(--qbt-bg-secondary) border-b border-(--qbt-border)">
                            <tr>
                                <th className="text-left px-2 py-1.5 font-medium">Name</th>
                                <th className="text-left px-2 py-1.5 font-medium">Size</th>
                                <th className="text-left px-2 py-1.5 font-medium">Progress</th>
                                <th className="text-left px-2 py-1.5 font-medium">Priority</th>
                            </tr>
                            </thead>
                            <tbody>
                            {torrent.Files.map((file) => (
                                <tr key={file.Index}
                                    className="border-b border-(--qbt-border) hover:bg-(--qbt-bg-tertiary)">
                                    <td className="px-2 py-1.5 truncate max-w-md" title={file.Name}>
                                        {file.Name}
                                    </td>
                                    <td className="px-2 py-1.5 whitespace-nowrap">{formatBytes(file.SizeBytes)}</td>
                                    <td className="px-2 py-1.5">
                                        <div
                                            className="relative bg-(--qbt-bg-tertiary) rounded-full h-3 overflow-hidden max-w-32">
                                            <div
                                                className="bg-(--qbt-accent) h-full transition-all"
                                                style={{width: `${file.Progress * 100}%`}}
                                            />
                                            <span
                                                className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                          {(file.Progress * 100).toFixed(1)}%
                        </span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-1.5">{file.Priority}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'trackers' && (
                    <div className="text-sm">
                        <div className="mb-2 text-(--qbt-text-secondary)">Tracker:</div>
                        <div className="font-mono text-xs break-all bg-(--qbt-bg-tertiary) p-2 rounded">
                            {torrent.TrackerUrl || 'No tracker'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
