# Axiora Money Tracker

A complete, offline-first money management web application built for Axiora's Development and Marketing agencies. The application runs entirely in your browser using local storage, ensuring your financial data remains private and secure on your own device.

## Features
- **Offline-First & Local Storage**: Data is stored securely on your local device using IndexedDB (Dexie.js). No cloud database is required.
- **Agency Separation**: Manage Development and Marketing finances completely separately.
- **Client & Project Hierarchy**: Clients have projects, and projects have revenue and expenses.
- **Automated Calculations**: Totals are automatically computed dynamically from transactions.
- **Combined Overview**: See combined totals for all of Axiora.
- **Automated Backups**: Intelligent backup reminder system to ensure your data is regularly exported and safely preserved.
- **Export/Import**: Full system JSON backup export and restoration functionality.
- **Responsive Design**: Works smoothly on desktop, tablet, and mobile.

## Technology Stack
- Next.js 15 (App Router) + React 19
- TypeScript
- Tailwind CSS v4
- Dexie.js (IndexedDB wrapper)
- Lucide React (Icons)

---

## Setup Instructions

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/urj2258/axiora-finance.git
cd money_mangment
npm install
```

### 3. Running the App Locally
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The app will automatically initialize the local database with the default "Development" and "Marketing" agencies.

### 4. Building for Production
To create an optimized production build:
```bash
npm run build
npm start
```

## Data Management & Backups
Because this application is **offline-first**, your data lives entirely in your browser.
- **Do not clear your browser data** without taking a backup first.
- Navigate to the **Settings** page within the dashboard to export your data as a JSON file.
- You can restore your data on any device by importing that JSON file.
