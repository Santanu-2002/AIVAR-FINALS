# Autonomous Test Orchestration Agent — Backend

Backend prototype for the Bessemer Tech Catalyst **Autonomous Test Orchestration Agent** challenge. The supplied problem statement requires a URL-driven autonomous pipeline with Planner, Generator, Healer, coverage evaluation, and a final quality report. The implementation here provides those backend stages and REST APIs.

## Stack
- Node.js 20+
- Express
- Playwright / Chromium
- Zod validation
- Optional OpenAI-compatible LLM endpoint via environment variables

## Setup
```bash
npm install
npm run install:browsers
cp .env.example .env
# add LLM_API_KEY if using the LLM-powered planner/generator/healer
npm start
```

Server: `http://localhost:5000`

## Main flow
1. `POST /api/test-runs` with a web app URL.
2. Backend explores the live application.
3. Planner produces a structured test plan.
4. Coverage evaluator identifies gaps.
5. Generator produces Playwright test source.
6. Browser execution checks the generated scenarios.
7. Healer classifies failures and proposes repairs.
8. Final report is available through the report endpoint.

## Important prototype note
The execution stage currently performs a baseline live-browser navigation for each generated test and stores the generated Playwright source. For a competition-ready version, replace `executeTests()` with a Playwright Test runner invocation so the generated source is actually executed step-by-step. This keeps the prototype safe and easy to run while leaving the orchestration boundary clean.

## API examples
### Start a run
```bash
curl -X POST http://localhost:5000/api/test-runs \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","intent":"focus on authentication and checkout"}'
```

### Poll status
```bash
curl http://localhost:5000/api/test-runs/<RUN_ID>
```

### Get report
```bash
curl http://localhost:5000/api/test-runs/<RUN_ID>/report
```

### Get generated tests
```bash
curl http://localhost:5000/api/test-runs/<RUN_ID>/tests
```

### Attach PRD
```bash
curl -X POST http://localhost:5000/api/test-runs/<RUN_ID>/prd \
  -F "prd=@requirements.txt"
```

## Environment
- `PORT` — API port, default 5000
- `LLM_API_KEY` — optional LLM API key
- `LLM_BASE_URL` — OpenAI-compatible `/v1` base URL
- `LLM_MODEL` — model name
- `HEADLESS` — browser headless mode
- `MAX_PAGES` — exploration limit
- `MAX_HEAL_ATTEMPTS` — reserved for iterative healing
