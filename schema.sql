CREATE TABLE torrents
(
    info_hash_v1 text    not null,
    server_url   text    not null,
    name         text    NOT NULL,
    last_updated integer not null,
    path         text    not null,
    primary key (info_hash_v1, server_url)
);