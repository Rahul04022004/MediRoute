# MediRoute - Smart Ambulance Dispatch System

**MediRoute** is an intelligent ambulance dispatch and routing platform that uses AI-powered decision-making to optimize emergency response times. This web application provides real-time fleet tracking, smart ambulance allocation, and comprehensive analytics for emergency medical services.

This project is built with React, TypeScript, Vite, and Tailwind CSS, with AI integration via Google's Gemini API.

## Features

-  **Real-time Fleet Tracking** - Live GPS tracking of all ambulances on an interactive map
- **AI-Powered Dispatch** - Smart ambulance allocation using Google Gemini AI
- **Live Analytics Dashboard** - Performance metrics, response times, and incident analysis
- **Priority Incident Management** - Color-coded incident severity with automatic routing
- **Hospital Integration** - Automatic routing to nearest hospitals
- **Driver & Dispatcher Views** - Separate interfaces for drivers and dispatch coordinators
- **Route Optimization** - OSRM API integration for real-time routing
- **Real-time Notifications** - Audio and visual alerts for critical events
- **Simulation Mode** - Realistic EMS workflow simulation for testing and demo

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### 1. Setup API Key

This project uses a `.env` file to manage the Gemini API key.

1.  Create a new file named `.env` in the root directory of the project. You can do this by renaming the included `.env.example` file.
2.  Open the `.env` file and add your Gemini API key:

    ```
    VITE_GEMINI_API_KEY="YOUR_API_KEY_HERE"
    ```

3.  Replace `"YOUR_API_KEY_HERE"` with your actual API key obtained from [Google AI Studio](https://aistudio.google.com/app/apikey).

**Note:** The `.env` file is listed in `.gitignore` to prevent your API key from being committed to a public repository.

### 2. Install Dependencies

Open your terminal, navigate to the project's root directory, and run the following command to install all the necessary packages:

```bash
npm install
```

### 3. Run the Development Server

Once the installation is complete, you can start the local development server:

```bash
npm run dev
```

This will start the application, and you can view it in your browser at the local address provided in the terminal (usually `http://localhost:5173`). The server supports Hot Module Replacement (HMR), so any changes you make to the code will be reflected in the browser instantly without a full page reload.

## Available Scripts

-   `npm run dev`: Starts the development server.
-   `npm run build`: Bundles the application for production.
-   `npm run lint`: Lints the code for errors and style issues.
-   `npm run preview`: Serves the production build locally for testing.
