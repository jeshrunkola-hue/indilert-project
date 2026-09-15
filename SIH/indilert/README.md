# INDILERT

INDILERT is a public-facing civilian interface designed to connect with a government disaster-intelligence and emergency-warning platform. 

The core philosophy of INDILERT is radical simplicity. During high-stress situations or in areas with poor digital literacy, users shouldn't be overwhelmed with complex GIS layers or technical analytics. Instead, they need immediate, actionable answers to five key questions:
1. Am I safe?
2. What is happening?
3. What should I do?
4. Where can I go?
5. How do I get help?

## Key Features

- **Dynamic Risk State**: The UI dynamically adapts based on the active risk level (Safe, Advisory, Emergency), transforming color schemes and instructions immediately to fit the context.
- **Live Safety Mapping**: Interactive maps utilizing real-time browser geolocation to pinpoint user locations and provide routing to the nearest safe emergency shelters using OpenStreetMap and Leaflet.
- **Multilingual Support**: Built-in support for 11 regional languages (including English, Hindi, Assamese, Bengali, Bodo, Khasi, and more) to ensure widespread accessibility across the Northeastern Region (NER).
- **Hazard Reporting**: A streamlined reporting tool enabling civilians to quickly send ground-truth data (photos, video, and GPS coordinates) back to the governance platform.
- **Offline-First Design Language**: Lightweight interface optimized for high readability during poor network connectivity.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI/Styling**: [Tailwind CSS](https://tailwindcss.com/), Lucide React (Icons)
- **Maps**: [Leaflet](https://leafletjs.com/) via `react-leaflet` & Open-Meteo Geocoding API

## Setup & Installation

### Prerequisites
- Python 3.x
- Node.js (v18+)
- npm

### Running the Application

We have provided a convenient Python script to automatically verify dependencies, install them if necessary, and boot the local server.

```bash
# Ensure you are in the project root
cd indilert

# Run the automated startup script
python3 run_indilert.py
```

### Manual Installation

If you prefer standard npm commands:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Once the server is running, open [http://localhost:3000](http://localhost:3000) in your web browser.
