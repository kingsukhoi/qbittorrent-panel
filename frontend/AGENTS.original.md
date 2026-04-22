# qbittorrent-panel — Frontend

Multi-server qBittorrent management panel. React frontend consuming a Go GraphQL backend.

## Rules

- **Do not touch any Go code.** Frontend only.
- **Always run `pnpm build` after making changes to verify no type errors.**
- **Always run `pnpm format --write` before you report when you're done**
- `graphql-request` v7 requires absolute URLs. Never pass relative paths (e.g. `"/query"`) to `GraphQLClient` — use
  `window.location.origin` as fallback.
- All modals use Headless UI `Dialog` — not raw divs.

## Stack

- React 19, Vite
- TanStack Router (routing)
- TanStack Query v5 (data fetching)
- graphql-request v7 (GraphQL client)
- Tailwind CSS v4
- Headless UI v2 (modals/dialogs)
- Lucide React (icons)

## Key files

```
src/
  lib/api.ts                   — getApiUrl(), uses VITE_API_BASE_URL || window.location.origin
  lib/graphqlClient.ts         — GraphQL client instance
  lib/queryClient.ts           — TanStack Query client (staleTime: 0, retry: 1)
  hooks/useTorrents.ts         — polls every 2s
  hooks/useCategories.ts       — polls every 5s
  hooks/useTorrentMutations.ts — pause / resume / createCategory mutations
  queries.ts                   — all GraphQL query/mutation strings
  components/
    Toolbar.tsx                — top bar; plus button dropdown (add torrent / add category)
    Sidebar.tsx                — filter panel (category / server / tracker), sticky clear button
    TorrentTable.tsx           — main torrent list
    DetailsPanel.tsx           — torrent details + trackers
    UploadTorrentModal.tsx     — headlessui Dialog
    CreateCategoryModal.tsx    — headlessui Dialog; server dropdown with torrent counts
```

## GraphQL schema

See `../graph/*.graphqls` for all queries and mutations.

## Dev workflow

```bash
# From repo root
make dev      # Vite dev server + Go server (VITE_API_BASE_URL=http://localhost:8080)
```

Backend serves frontend from `./frontend/dist`. In production, `VITE_API_BASE_URL` is unset — `window.location.origin`
is used so requests go to the same origin.
