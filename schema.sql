create table qb_servers
(
    url       text    not null,
    last_seen integer not null,
    primary key (url)
);

CREATE table categories
(
    name       text not null,
    save_path  text not null,
    server_url text not null,
    primary key (name, server_url),
    foreign key (server_url) references qb_servers (url)

);

CREATE TABLE torrents
(
    info_hash_v1 text    not null,
    server_url   text    not null,
    name         text    NOT NULL,
    last_updated integer not null,
    path         text    not null,
    category  text,
    ratio     real    not null,
    comment   text    not null,
    rootPath  text    not null,
    savePath  text    not null,
    sizeBytes integer not null,
    addedOn   integer not null,
    state     text    not null,

    primary key (info_hash_v1, server_url),
    foreign key (category, server_url) references categories (name, server_url),
    foreign key (server_url) references qb_servers (url)
);

CREATE TABLE trackers_torrents
(
    info_hash_v1   text    not null,
    server_url     text    not null,
    url            text    not null,
    tier           integer not null,
    status         integer not null,
    num_peers      integer not null,
    num_seeds      integer not null,
    num_leeches    integer not null,
    num_downloaded integer not null,
    msg            text    not null,

    foreign key (info_hash_v1, server_url) references torrents (info_hash_v1, server_url),
    primary key (url, info_hash_v1, server_url)
);


CREATE TABLE torrent_files
(
    info_hash_v1      text    not null,
    server_url        text    not null,
    availability      real    not null,
    name              text    not null,
    file_index        integer not null,
    piece_range_start integer not null,
    piece_range_end   integer not null,
    priority          integer not null,
    progress          real    not null,
    size              integer not null,
    is_seed           INTEGER NOT NULL DEFAULT 0, -- boolean
    foreign key (info_hash_v1, server_url) references torrents (info_hash_v1, server_url),
    primary key (info_hash_v1, server_url, name)
);