# Makerere Timetable Calendar Integration

A seamless full-stack web application designed to integrate Makerere University student timetables directly into personal calendar applications (Google Calendar, Outlook, Apple Calendar) via dynamic iCalendar (`.ics`) subscription feeds.

This system provides a mocked frontend experience mirroring the Makerere portal, streamlining the scheduling experience for students.

## 🚀 Features

- **Dynamic `.ics` Feed Generation**: Generates live, subscribable calendar feeds.
- **Integrated Architecture**: Runs both the React frontend and Express backend simultaneously on a single port for simplified deployments and zero CORS issues.
- **Dynamic Weekly Mock Data**: Automatically adjusts presentation mock data (BIST program schedules) to anchor to the *current week*, preventing outdated events during live presentations.
- **Fail-Safe Database Strategy**: Configured for PostgreSQL but includes an automatic in-memory fallback, allowing the system to run locally without an active database connection.

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React (Vanilla JS/JSX).
- **Backend**: Node.js, Express.
- **Database**: PostgreSQL (`pg`) with automatic in-memory mocking.

## 📂 Project Structure

```text
├── backend/                  # Server-side environment
│   ├── database/             # PostgreSQL connection & fallbacks
│   ├── middleware/           # Express middleware (Error handling)
│   ├── repositories/         # Data access layer (DB/Memory queries)
│   ├── routes/               # API route definitions
│   ├── services/             # Core business logic (Syncing, Timetable fetching)
│   ├── utils/                # Helpers (ICS string generation)
│   └── server.js             # Main Express entry point
├── src/                      # Client-side React environment
│   ├── components/           # Reusable UI components (Sidebar, Header, etc.)
│   ├── hooks/                # Custom React hooks (useSubscription)
│   ├── pages/                # Page views (DashboardPage)
│   ├── App.jsx               # Main React component
│   └── main.jsx              # Vite frontend entry point
├── package.json              # Node dependencies & scripts
└── vite.config.js            # Vite bundler configuration
```

## ⚙️ Prerequisites

- **Node.js** (v18.0.0 or higher recommended)
- **npm** (Node Package Manager)

## 💻 Getting Started (Local Setup)

1. **Install Dependencies**
   Navigate inside the project directory and run:
   ```bash
   npm install
   ```

2. **Start the Application**
   You do not need to start the frontend and backend separately. Run:
   ```bash
   npm run dev
   ```
   *This command starts the Node.js/Express server and dynamically mounts the Vite frontend middleware.*

3. **Access the Portal**
   Open your browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

## 📡 API Endpoints

- `POST /api/calendar/subscribe` 
  - Generates a unique secure token for the requesting authenticated student.
  - Returns the generated `.ics` feed URL.
- `GET /api/calendar/feed/:token`
  - The actual `.ics` subscription endpoint. Calendar applications regularly ping this URL to pull the latest timetable state.

## 📝 Presentation & Mock Data Notes

**Database Considerations:**
Currently, you do not need to spin up a local PostgreSQL database for your presentation. If the `DATABASE_URL` environment variable is not detected, `backend/database/db.js` automatically routes all data requests to robust "In-Memory Maps". 

**Demonstrating the Demo classes:**
The backend `TimetableService.js` is programmed to output 6 realistic BIST classes anchored dynamically to whoever is presenting that week (Monday through Friday). 

When you click **GENERATE CALENDAR FEED URL**, the URL is connected to the mockup student registration context (`23/U/16751/PS`). You can download or copy the ICS URL locally to demonstrate it populating a desktop calendar app instantly.
