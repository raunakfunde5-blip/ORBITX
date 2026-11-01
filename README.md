# 🚀 ORBITX — Premium Space Exploration Platform

## Public Static Deployment

The ORBITX frontend can be deployed on Netlify, GitHub Pages, or another static host:

1. Upload or connect the project directory.
2. Set the publish directory to the project root.
3. No build command is required.
4. The NASA APOD section uses its curated offline archive if the Python API proxy is not available.
5. Add a public domain through the hosting provider, then register the domain in Google Search Console.

ORBITX is a space exploration and astrophysical research web platform built with a futuristic glassmorphic UI, accurate NASA scientific datasets, an interactive solar system orbital simulator, NASA APOD daily telemetry imagery, and real-time live International Space Station (ISS) satellite tracking.

---

## 🌌 Features Overview

### 1. 🪐 Solar System Explorer
* **Planetary Mechanics:** Interactive simulation of the Sun, all eight major planets (Mercury, Venus, Earth with Moon, Mars, Jupiter, Saturn with rings, Uranus, Neptune), and the main asteroid belt.
* **Complete Scene & Camera Modes:** Opens on a complete-system overview and includes a focused Earth satellite camera mode with simulated ISS, observation, and navigation objects.
* **Integrated Satellite Labels:** Earth satellites and the Moon are clearly labeled within the Solar System scene; simulated satellite motion is not presented as live tracking.
* **Kinematics Engine:** Scaled orbital velocities governed by Keplerian proportional motion.
* **Interactive Controls:**
  * Play / Pause orbital motion.
  * Orbital Speed multiplier slider (0.1x to 5.0x).
  * Smooth Pan & Wheel-to-Zoom camera.
  * Toggle Orbit Paths and Planet Labels.
  * Hover over any planet to inspect real-time orbital velocity and distance.
  * Click any planet to focus the camera and view a quick telemetry card with a "Deep Dive in Planet Explorer" button.

### 2. 🌍 Planet Explorer
* **Scientific Accuracy:** Complete astronomical telemetry sourced directly from NASA Planetary Fact Sheets.
* **Physical Properties:**
  * Mean Diameter (km and ratio to Earth).
  * Distance from Sun (AU and million km).
  * Orbital & Rotational periods.
  * Mean Surface Temperatures (°C and Kelvin).
  * Surface Gravity (m/s² and g-force).
  * Confirmed Natural Satellites / Moons count.
* **Visual Presentation:** 3D CSS planetary sphere with custom gradient textures, rotating animation, atmospheric halo glow, and Saturn's rings.
* **Atmospheric Chemistry:** Color-coded percentage breakdown of gases.
* **Side-by-Side Comparison Matrix:** Compare any two planets in real-time across key astronomical metrics.

### 3. 📸 NASA Data Explorer (APOD)
* **Real NASA Imagery:** Integrated with NASA's Astronomy Picture of the Day API.
* **Cosmic Date Picker:** Select any historical observation date from June 16, 1995 to today.
* **Quick Navigation:** Instant buttons for *Today*, *Yesterday*, and *Random Discovery*.
* **Full-Resolution Lightbox:** Click on any photo to open the fullscreen HD modal.
* **Voice Briefing:** Built-in audio speech synthesizer reads NASA scientific explanations aloud.
* **Curated Offline Highlights:** Pre-cached legendary astronomical observations (JWST Carina Nebula, Pillars of Creation, Andromeda Galaxy, Mars Perseverance) ensure the site never fails even when offline or rate-limited.
* **API Security:** The frontend never handles or exposes your `NASA_API_KEY`. All requests are proxied securely through the Python backend.

### 4. 🛰️ ISS Space Station Live Tracker
* **Real-Time Satellite Telemetry:** Connects to live orbital tracking APIs (`wheretheiss.at` and `open-notify.org`).
* **Interactive Leaflet Map:** High-contrast Dark Cosmic world map with custom animated ISS marker, pulsing radar ping, orbital ground track trail, and ~4,400 km visibility footprint.
* **Live Flight Metrics:**
  * Orbital Velocity (~27,600 km/h / 17,150 mph / 7.66 km/s) with gauge bar.
  * Orbital Altitude (~420 km / 261 miles above Earth) with gauge bar.
  * Real-time Sub-Satellite Point (Latitude & Longitude coordinates).
  * Solar State: Indicates whether the station is in direct sunlight or eclipsed in Earth's shadow.
  * Expedition Crew: Live roster of astronauts currently aboard the ISS.
* **Reliability & Offline Fallback:** When internet or live satellite APIs are unreachable, the system automatically activates a mathematical orbital propagation model (~51.64° inclination, 92.9 min period) and clearly flags **"OFFLINE / SIMULATION MODE"**.

### 5. 🚀 NASA Mission & Spacecraft Explorer
* **Interactive Mission Archive:** Explore Voyager 1, Voyager 2, JWST, Hubble, Perseverance, and Curiosity from the Mission Control dashboard.
* **Educational Models:** Lightweight canvas reconstruction of spacecraft and mission trajectories, with selectable craft and camera rotation, zoom, and reset controls.
* **Curated Mission Facts:** Launch, destination, status, and objective information is maintained as conservative static archive data.
* **Simulation Transparency:** Models and paths are explicitly identified as educational simulations rather than live telemetry.
* **Provider-Ready Architecture:** The spacecraft controller accepts normalized mission records for future NASA-backed data providers without exposing API credentials.

### 6. 🌍 Earth & Planet Observation System
* **Enhanced Earth Globe:** Continents, cloud bands, atmospheric glow, day/night shading, and a simulated Moon orbit are integrated into Satellite Explorer.
* **Location Observation Dashboard:** Select Tokyo, Nairobi, New York, Sydney, London, or Cape Town to inspect coordinates and simulated sunrise/sunset values.
* **Planetary Observation:** The existing Planet Explorer provides scientific facts for all eight planets and the Sun, including moons, atmospheres, physical properties, and comparison tools.
* **Data Transparency:** Location conditions, Earth lighting, Moon motion, and orbital objects are clearly identified as simulations until verified live providers are added.

### 7. 🚀 3D Space Travel Simulator
* **Educational Flight:** Pilot a lightweight Canvas spacecraft toward Earth, Moon, Mars, Jupiter, or Saturn.
* **Flight Controls:** Accelerate, brake, rotate, pause, reset, change external/cockpit camera, and follow journey progress.
* **Scaled Journey Data:** Distances and durations are compressed and clearly labeled as educational simulations.
* **Performance:** No 3D library dependency; stars, asteroid fields, destination lighting, and engine effects use a responsive canvas renderer.

---

## 🎨 Design System

| Element | Specification | Hex / Font |
|---|---|---|
| **Canvas Background** | Midnight Space | `#070B18` |
| **Card & Panel Surfaces** | Deep Navy (Glassmorphic) | `#10182B` (Alpha `0.75`) |
| **Primary Accents** | Electric Blue | `#2563EB` |
| **Telemetry & Glows** | Cyan | `#38BDF8` |
| **Deep Space Highlights** | Nebula Purple | `#8B5CF6` |
| **Typography (Headings)** | Space Grotesk | Geometric, futuristic |
| **Typography (Body)** | Inter | High legibility |
| **Typography (Telemetry)** | JetBrains Mono | Monospace coordinates & gauges |

---

## 💻 Architecture & Quick Start

The project is structured with a zero-dependency frontend and a clean Python 3 backend using Python's built-in standard library.

### Folder Structure
```
orbitx/
├── index.html                 # Main single-page application shell
├── server.py                  # Python backend & secure NASA API proxy
├── .env                       # Local secrets (stores NASA_API_KEY)
├── .env.example               # Template for environment configuration
├── css/
│   ├── orbitx-theme.css       # Design tokens, reset, typography, header, hero
│   ├── solar-system.css       # Solar System canvas and HUD styles
│   ├── planet-explorer.css    # Planet Explorer 3D visualizer and compare tool
│   ├── nasa-apod.css          # NASA APOD showcase, date picker, lightbox modal
│   └── iss-tracker.css        # Leaflet map, radar ping, telemetry gauges
├── js/
│   ├── data/
│   │   ├── planets-data.js    # NASA-verified scientific planetary metrics
│   │   └── apod-curated.js    # Pre-cached curated NASA APOD entries
│   ├── starfield.js           # Multi-layer canvas starfield with shooting stars
│   ├── solar-system.js        # Canvas orbital simulation engine
│   ├── planet-explorer.js     # Planet Explorer controller & comparison tool
│   ├── nasa-apod.js           # APOD fetcher, audio reader, and modal lightbox
│   ├── iss-tracker.js         # Leaflet live tracking and fallback ephemeris
│   └── app.js                 # App coordinator, UTC mission clock, smooth scroll
└── README.md                  # Documentation and setup guide
```

---

## 🛠️ How to Run

### Step 1: Start the Python Backend Server
Open your terminal in the `orbitx` directory and run:

```bash
python server.py
```
*(No pip packages required! Runs out-of-the-box on Python 3.7+).*

### Step 2: Open in Your Browser
Visit:
```
http://localhost:8000
```

### (Optional) Configure Your Free NASA API Key
1. Get a free API key at [api.nasa.gov](https://api.nasa.gov/).
2. Open the `.env` file in the project folder.
3. Update the key:
   ```env
   NASA_API_KEY=your_actual_key_here
   PORT=8000
   ```
4. Restart `python server.py`. Your API key is kept completely secret on the backend and is never sent to the client browser!
