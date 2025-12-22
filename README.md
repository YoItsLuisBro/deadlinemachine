# DEADLINE MACHINE — Task & Focus Board

A brutalist to-do + timer app that behaves like a cold, unforgiving machine.

- Heavy black + off-white + warning red palette  
- Hard grids, chunky borders, unapologetic labels: **OVERDUE**, **DO IT NOW**  
- Columns: **TODAY / THIS WEEK / DUMPING GROUND**  
- Massive numeric timer, tiny labels  
- Email/password login backed by **Supabase**  
- Deployed easily on **Vercel**

---

## Tech Stack

- **Frontend:** React + Vite
- **Styling:** Custom CSS (brutalist / neo-brutalist)
- **Auth & DB:** Supabase (email/password auth + row-level security)
- **Deployment:** Vercel

---

## Features

- **Authentication**
  - Email + password signup and login (Supabase Auth)
  - Brutalist login screen with harsh copy and bold layout
  - Auth state persisted via Supabase session

- **Task Board**
  - 3 lanes: `TODAY`, `THIS WEEK`, `DUMPING GROUND`
  - Tasks have: title, description (placeholder for now), lane, due date (optional), urgent flag, done flag
  - Visual tags:
    - `OVERDUE` (past due, not done)
    - `DO IT NOW` (urgent or due today)
    - `DONE` (completed tasks)
  - Move tasks between lanes with “MOVE → TODAY / WEEK / DUMP”
  - Brutal delete confirmation modal:
    - Giant “YES, OBLITERATE”
    - Tiny “no, keep it”

- **Timer Panel (Focus Engine)**
  - Large MM:SS display with tiny `MIN` / `SEC` labels
  - Adjustable duration in minutes
  - Start / Pause / Reset controls
  - Harsh end-of-timer message: “TIME’S UP. STOP HESITATING.”

---

## Project Structure

Example structure (simplified):

```text
src/
├─ App.jsx
├─ main.jsx
├─ styles.css
├─ supabaseClient.js
├─ components/
│  ├─ AuthPage.jsx
│  ├─ TaskColumn.jsx
│  ├─ TaskCard.jsx
│  ├─ TimerPanel.jsx
│  └─ DeleteModal.jsx
└─ utils/
   ├─ dateUtils.js
   └─ taskUtils.js
```

---

