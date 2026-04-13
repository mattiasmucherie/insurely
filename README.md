# Investment Collection — Insurely case study

Simulated BankID login flow that collects mock investment holdings from a provider (Avanza). React + Vite frontend, Hono backend, TypeScript throughout.

## Prerequisites

- Node.js 18+ but I used Node 24.10.0

## Setup

```bash
cd server && npm install
cd ../client && npm install
```
or
```bash
npm run install:all
```

## Running

Two terminals:

```bash
# Terminal 1 — backend (port 3001)
cd server && npm run dev

# Terminal 2 — frontend (port 5173)
cd client && npm run dev
```

Open http://localhost:5173

## Tests

Backend has unit + HTTP tests covering validation, session store, QR rotation, and all endpoints.

```bash
cd server && npm test
```

## How it works

1. Enter a Swedish personal identity number (validated with Luhn checksum on both client and server)
2. Backend creates a session and starts generating rotating QR tokens
3. Frontend polls every 1.5s for status + QR data, rendering the QR with `qrcode.react`
4. Click "Mock successful login" to simulate BankID authentication
5. Backend transitions session: `PENDING → AUTHENTICATED → COMPLETED`
6. Frontend fetches and displays mock investment data — accounts, holdings, allocation bar, totals

## Architecture

```
client/    React + Vite frontend
server/    Hono backend (in-memory session store)
shared/    TypeScript types shared between FE & BE
```

### API

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/sessions | Create session (body: `{ ssn }`) |
| GET | /api/sessions/:id | Poll status + QR data |
| POST | /api/sessions/:id/authenticate | Mock BankID login |
| GET | /api/sessions/:id/investments | Get holdings (requires `COMPLETED`) |

### State machine

```
PENDING ──(POST /authenticate)──► AUTHENTICATED ──(auto, ~1s)──► COMPLETED
```

QR tokens rotate every second via `sha256(sessionId + timeslot)` — no timers needed on the server.

## Test personal numbers

Any 10 or 12-digit number that passes the Luhn checksum works. Example: `198507099805`.

## Limitations

- In-memory storage — sessions lost on server restart
- No real BankID integration — QR codes encode mock hash data
- No persistent database
- No client-side routing (single-page state machine)
- No frontend tests

## AI usage
- Using claude code
- Using [`compound engineering`](https://github.com/EveryInc/compound-engineering-plugin)
- Extra skills: [`grill-me`](https://github.com/mattpocock/skills/blob/main/grill-me/SKILL.md)

## What I'd improve if I would put more time:
- Having a proper memory solution and not storing the ssn in plain text
- WebSocket / SSE instead of polling for push-based updates
- Session expiry and cleanup.
- Some more test, maybe some FE unit but most importantly some E2E tests (Playwright)
- Improve the design.
- Accessibility eventhough semantic HTML takes us long (aria attributes, keyboard navigation, focus management)
- More robust SSN validation. I kept it minimal here but could investigate in how a lib like [`personnummer`](https://www.npmjs.com/package/personnummer) does it.
- And so much more :)
