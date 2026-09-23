# Realtime (event feed + polling)

DentaPulse does not run a long-lived WebSocket server on Vercel. The default transport is a **persisted MongoDB event feed** polled by the web app.

## Server layout

| Piece                                  | Role                                                                                         |
| -------------------------------------- | -------------------------------------------------------------------------------------------- |
| `packages/shared` `realtime/events.ts` | Typed event map (`stock.low`, `stock.updated`, `appointment.created`, `appointment.updated`) |
| `RealtimePublisher`                    | Writes events **after** the owning transaction commits                                       |
| `MongoEventFeedPublisher`              | Inserts `RealtimeEvent` rows (TTL ~24h)                                                      |
| `RealtimeFeedSubscriber`               | Reads the feed for polling                                                                   |
| `GET /events?after=&limit=`            | Authenticated; `clinicId` from JWT only                                                      |

### Polling contract

1. **Bootstrap** — `GET /events` with no `after`: `{ cursor, events: [] }`. `cursor` is the latest event id for the cabinet (or `null` if empty). No history is replayed.
2. **Poll** — `GET /events?after=<cursor>&limit=50`: returns events with `_id > after`, ascending, plus a new `cursor` (last event id in the page, or the feed head if the page is empty).

Indexes: `{ clinicId, _id }` for polls; TTL on `createdAt`.

## Publishing rules

- Never call `publish` inside `withTransaction`.
- Services publish once the transaction callback has resolved successfully.
- Payloads are validated with shared zod schemas before insert.

## Optional WebSocket upgrade (not implemented)

Vercel WebSocket support is beta; connections close at the function `maxDuration`, and instances do not share memory. A future **push adapter** would:

1. Implement `RealtimePushTransport.broadcast(clinicId, event)` beside the existing publisher.
2. On publish: write to Mongo (source of truth) **and** broadcast to connected clients on that instance.
3. Use **Redis pub/sub** (or similar) so every API instance receives publishes and can push to its local sockets.
4. Keep polling as fallback: clients reconnect with `after=<lastSeenId>` to fill gaps after disconnect.

The interfaces in `apps/api/src/realtime/types.ts` (`RealtimePublisher`, `RealtimeFeedSubscriber`, `RealtimePushTransport`) are the seams; only the Mongo feed is wired today.
