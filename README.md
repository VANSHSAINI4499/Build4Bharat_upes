# SparshGyan — Accessibility Without Limits

> An AI-powered, multi-modal accessibility platform that makes digital education reachable for users with visual, hearing, and motor disabilities — through voice navigation, live captions, and haptic Braille feedback.

Built for the **Build4Bharat Hackathon** by Team UPES.

---

## Overview

SparshGyan combines a modern web frontend with hardware modules to deliver three accessibility modes:

| Mode | What It Does |
|---|---|
| **Voice Navigation** | A floating voice assistant lets visually impaired users navigate the platform hands-free using spoken commands (e.g., *"open captions"*, *"go home"*). |
| **Live Captions** | Real-time speech-to-text converts microphone input into a rolling on-screen transcript for deaf and hard-of-hearing learners. |
| **Haptic Braille** | An Arduino-based 6-dot Braille controller translates on-screen text into tactile vibration patterns so blind users can "feel" letters in real time. |

Additional features include accessible video lessons with live caption overlays, an inclusive courses catalogue, and a **parental dashboard** with real-time analytics (weekly activity charts, skill proficiency bars, achievements, and activity feeds) powered by Firebase.

---

## Tech Stack

### Frontend — `sparshgyan-next/`

| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | Server & client components, API routes |
| React 18 + TypeScript 5 | UI framework |
| Tailwind CSS 3 | Utility-first styling |
| Framer Motion 11 | Page transitions & micro-animations |
| Firebase 12 | Authentication (email/password) & Cloud Firestore |
| Zustand 4 | Lightweight global state management |
| Radix UI | Accessible primitives (Switch, Toast, Badge) |
| Lucide React | Icon library |
| Three.js + React Three Fiber | 3D decorative scenes |
| Web Speech API | Speech recognition & synthesis |
| Web Serial API | Browser ↔ Arduino communication |

### Hardware — `AdrinoCodes/`

| Technology | Purpose |
|---|---|
| Arduino (C++) | 6-dot Braille vibration motor driver |
| Serial @ 9600 baud | Communication with browser via Web Serial |

---

## Repository Structure

```
Build4Bharat_upes/
├── README.md
├── documentation.txt
├── proposed.txt
├── sparshgyan-next/          ← Next.js 14 frontend (primary)
│   ├── app/
│   │   ├── page.tsx          ← Landing page
│   │   ├── (routes)/
│   │   │   ├── captions/     ← Live speech-to-text captions
│   │   │   ├── video/        ← Video lessons + caption overlay
│   │   │   ├── product/      ← Accessible courses catalogue
│   │   │   ├── vision/       ← Webcam vision page
│   │   │   ├── login/        ← Firebase auth (login/signup)
│   │   │   └── dashboard/    ← Parental analytics dashboard
│   │   └── api/
│   │       └── captions/     ← Caption processing endpoint
│   ├── components/           ← UI, accessibility, layout, 3D, magic
│   ├── lib/                  ← Hooks, Firebase config, utilities
│   ├── store/                ← Zustand global store
│   └── public/my_model/      ← Teachable Machine models
├── AdrinoCodes/
│   └── bil369/bil369.ino     ← Arduino Braille haptic sketch
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 and **npm** (or yarn/pnpm)
- **Arduino IDE** (to flash the Braille sketch)
- A modern Chromium-based browser (required for Web Serial & Web Speech APIs)

### 1. Frontend Setup

```bash
cd sparshgyan-next
npm install
npm run dev
```

The app starts at **http://localhost:3000**.

### 2. Arduino Setup

1. Open `AdrinoCodes/bil369/bil369.ino` in the Arduino IDE.
2. Connect the vibration motor to **PWM pin 9**.
3. Upload the sketch to your board.
4. In the web app, use the **Arduino Panel** sidebar to connect via Web Serial (9600 baud).

---

## Environment Variables

Create a `.env.local` file inside `sparshgyan-next/` if you want to override the default Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## Team Details

| Name | Role |
|---|---|
| **Vansh Saini** | Full-Stack Developer / UI |
| **Akshat Gupta** | Hardware Integration / Embedded |
| **Vardaan Grover** | Backend / Quality Assurance |
| **Shreya Kumari** | Project Manager / Developer |

---

## License

This project was built for the **Build4Bharat Hackathon** at UPES.
