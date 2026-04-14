-- name: GetTorrentsByInfoHash :many
SELECT *
FROM torrents
WHERE info_hash_v1 = ?;

-- name: GetTorrents :many
SELECT *
FROM torrents;


-- name: CreateTorrent :exec
INSERT INTO torrents (info_hash_v1,
                      server_url,
                      name,
                      last_updated,
                      path)
VALUES (?, ?, ?, ?, ?)
on conflict (info_hash_v1,server_url) do update
    set name         = excluded.name,
        last_updated = excluded.last_updated,
        path         = excluded.path;