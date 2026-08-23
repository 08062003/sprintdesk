# SprintDesk — Technical Assignment Submission

SprintDesk is a small, focused project management dashboard built with React, TypeScript and Vite. This README documents how to run and evaluate the application, architectural choices, what was implemented for the assignment, and known limitations.

---

## 1. Project setup / Getting started

Prerequisites
- Node.js 18+ (recommended)
- npm (or yarn)

Quickstart
1. Clone the repository

   git clone <REPO_URL>
   cd sprintdesk

2. Install dependencies

   npm install

3. Start development server (hot-reload)

   npm run dev

4. Run unit tests (Vitest)

   npm run test

5. Build production bundle

   npm run build

6. Preview production build

   npm run preview

Notes
- Tests run with Vitest. Some tests mock fetch and manipulate Zustand stores directly to keep them deterministic.

---

## 2. Tech stack & architecture decisions

Primary technologies
- React (v19) + TypeScript — UI layer with typed safety.
- Vite — fast dev server and build.
- Zustand — lightweight global state management.
- @tanstack/react-query — used for heavier async data fetching patterns where caching and background refresh are helpful.
- dnd-kit — drag-and-drop interactions for the board.
- Recharts — charts for the Dashboard analytics.
- Vitest + @testing-library/react — unit testing.

Why Zustand?
- Minimal API and boilerplate compared to Redux; easy to reason about and test.
- Fine-grained selector subscriptions avoid unnecessary re-renders and fit the small-to-medium app needs.
- Works well with TypeScript and integrates simply into components without provider boilerplate.

Why Recharts?
- Declarative and lightweight for common chart types (line, bar, pie).
- Good balance of developer ergonomics and features for the analytics required in this assignment.

Key architectural choices
- Stores (Zustand) hold app-wide state: auth, board (tasks/sprints/users/comments), notifications, toasts, theme.
- apiFetch (src/services/apiClient.ts) centralizes token attachment and refresh behavior with a single-refresh-in-flight pattern and queued retries.
- Components are memoized (React.memo) and use useMemo/useCallback in heavy render paths (task cards, board columns, and charts) to improve rendering performance.
- Pages are code-split with React.lazy + Suspense to reduce initial bundle size.

---

## 3. What was implemented for Task 6 (Global optimizations, testing, documentation)

- Theme switcher persisted in Zustand + localStorage.
- Dashboard page with active sprint summary, metrics, quick links, and a recent activity feed.
- Performance optimizations: React.memo, useMemo and useCallback applied to heavy components (TaskCard, BoardColumn, charts, toasts, modals, drawers).
- Accessibility: modal focus trapping, ARIA labels for interactive controls, keyboard handling for Escape and tab-trapping in modals.
- Auth interceptor: silent token refresh and auto-retry logic centralized in src/services/apiClient.ts.
- Unit tests (Vitest): tests added for useToast hook, board store operations, and apiFetch token refresh flow.
- README updated with setup, architecture overview, and key decisions.

---

## 4. Assumptions & Limitations

- Due to time constraints, the Real-Time Notification system (Task 5) was partially implemented. The UI and store architecture are present, but active polling was deprioritized in favor of core analytics, global UI optimizations, and stability.

- Authentication endpoints use dummyjson for demo purposes. Replace those endpoints with a real API for production.

- Persistence is localStorage-based for the board and theme. This is sufficient for a single-user demo but must be replaced with server-side persistence for multi-user real-world usage.

- Drag-and-drop keyboard accessibility: dnd-kit provides primitives; a full keyboard-first DnD experience is not completed and remains a recommended next step.

---

## 5. Testing

- Run unit tests:

  npm run test

- Tests included in the repository cover:
  - useToast hook (adding/removing toasts)
  - board store (add / move / delete tasks)
  - apiFetch auth interceptor (silent refresh and retry)

---

## 6. File locations of interest

- src/services/apiClient.ts — central fetch wrapper with token refresh and retry.
- src/store/* — Zustand stores (authStore, boardStore, toastStore, themeStore, notificationStore).
- src/components/* — UI components and charts.
- src/pages/Dashboard.tsx — dashboard page with charts and summary.
- src/__tests__ — Vitest unit tests.

---

## 7. Next steps (recommended)

- Implement production-ready persistence and multi-user APIs.
- Add E2E tests (Playwright/Cypress) covering login, token refresh and board operations.
- Improve keyboard accessibility for drag-and-drop interactions.
- Add CI pipeline to run lint/test/build on pull requests.

If you'd like, I can open a draft PR with these changes and attach the test/build logs.
