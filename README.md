# Sortify — Algorithm Learning Platform

## Setup (2 steps)
1. Start backend:
   - Windows: Double-click start_backend.bat
   - Mac/Linux: Run ./start_backend.sh
2. Open frontend/index.html in your browser

## No Scrolling Architecture
- Landing Page → Click "Get Started" or "Try as Guest"
- Auth Page → Login/Register → Goes to Dashboard
- Dashboard/App → Sidebar navigation between all views
- Each view is a fixed-height panel, no page scrolling

## Features
- Sorting Visualizer (7 algorithms, step-by-step)
- Tree Visualizer (Red-Black, B-Tree, 2-3, KD-Tree)
- Side-by-side Compare Mode
- Practice Quiz with rotating questions + Next button
- XP, Levels, Badges gamification
- Session persistence (resume where you left off)
- Dark/Light mode

## Tech Stack
- Frontend: Vanilla HTML/CSS/JavaScript (self-contained)
- Backend: Python Flask + SQLite
