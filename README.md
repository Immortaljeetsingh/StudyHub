# StudyHub

A modern course management and study platform for tracking courses, deadlines, and study progress.

## Project Structure

```
StudyHub/
├── src/                  # Source files
│   └── script.js        # Main application script
├── dist/                # Build output (generated)
├── assets/              # Static assets
├── study-hub.html       # Main HTML file
├── package.json         # Project configuration
└── README.md            # This file
```

## Features

- Course management with progress tracking
- Dark/light theme toggle
- Local storage persistence
- Responsive design

## Setup

1. Ensure you have a modern browser with ES6+ support
2. Open `study-hub.html` in your browser
3. No build step required for basic usage

## Development

```bash
# Build all phases
npm run build

# Build specific phase
npm run build:05
npm run build:06

# Analyze with graphify
npm run analyze
```

## Code Analysis

Run graphify on the source code:
```bash
graphify src/script.js
```

Output will be generated in `.openclaw/workspace/graphify-out/`