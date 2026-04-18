-- name: GetTorrentsByInfoHash :many
SELECT *
FROM torrents
WHERE info_hash_v1 = ?;

-- name: GetTorrents :many
SELECT *
FROM torrents
order by server_url;

-- name: CreateCategory :exec
insert into categories (name, save_path, server_url)
values (?, ?, ?)
on conflict do update
    SET save_path = excluded.save_path;

-- name: CreateServer :exec
insert into qb_servers (url, last_seen)
values (?, ?)
on conflict do nothing;

-- name: CreateTorrent :exec
INSERT INTO torrents (info_hash_v1,
                      server_url,
                      name,
                      last_updated,
                      path,
                      category,
                      ratio,
                      comment,
                      rootPath,
                      savePath,
                      sizeBytes,
                      addedOn,
                      state)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
on conflict (info_hash_v1, server_url) do update
    set name         = excluded.name,
        last_updated = excluded.last_updated,
        path      = excluded.path,
        category  = excluded.category,
        ratio     = excluded.ratio,
        comment   = excluded.comment,
        rootPath  = excluded.rootPath,
        savePath  = excluded.savePath,
        sizeBytes = excluded.sizeBytes,
        addedOn   = excluded.addedOn,
        state     = excluded.state;

-- name: CreateTorrentFile :exec
INSERT INTO torrent_files (info_hash_v1,
                           server_url,
                           availability,
                           name,
                           file_index,
                           piece_range_start,
                           piece_range_end,
                           priority,
                           progress,
                           size,
                           is_seed)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT (info_hash_v1, server_url, name) DO UPDATE
    SET availability      = excluded.availability,
        file_index        = excluded.file_index,
        piece_range_start = excluded.piece_range_start,
        piece_range_end   = excluded.piece_range_end,
        priority          = excluded.priority,
        progress          = excluded.progress,
        size              = excluded.size,
        is_seed           = excluded.is_seed;

-- name: CreateTrackerTorrent :exec
INSERT INTO trackers_torrents (info_hash_v1,
                               server_url,
                               url,
                               tier,
                               status,
                               num_peers,
                               num_seeds,
                               num_leeches,
                               num_downloaded,
                               msg)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT (url, info_hash_v1, server_url) DO UPDATE
    SET tier           = excluded.tier,
        status         = excluded.status,
        num_peers      = excluded.num_peers,
        num_seeds      = excluded.num_seeds,
        num_leeches    = excluded.num_leeches,
        num_downloaded = excluded.num_downloaded,
        msg            = excluded.msg;