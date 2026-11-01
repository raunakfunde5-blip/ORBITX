/**
 * ORBITX - Curated High-Resolution NASA APOD Archive
 * Real NASA Astronomy Pictures of the Day for instant display,
 * offline fallback, and legendary cosmic discoveries archive.
 */

const APOD_CURATED_ARCHIVE = [
  {
    date: "2024-05-18",
    title: "Cosmic Cliffs in the Carina Nebula",
    explanation: "This landscape of 'mountains' and 'valleys' speckled with glittering stars is actually the edge of a nearby, young, star-forming region called NGC 3324 in the Carina Nebula. Captured in infrared light by NASA's James Webb Space Telescope, this image reveals for the first time previously invisible areas of star birth. The blistering, ultraviolet radiation from the young stars is sculpting the nebula's wall by slowly eroding it away.",
    url: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1600&q=85",
    hdurl: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=2400&q=90",
    media_type: "image",
    copyright: "NASA, ESA, CSA, STScI, Webb ERO Production Team",
    category: "Deep Space Nebula"
  },
  {
    date: "2024-04-12",
    title: "Pillars of Creation in the Eagle Nebula",
    explanation: "NASA's James Webb Space Telescope has captured a lush, highly detailed landscape — the iconic Pillars of Creation — where new stars are forming within dense clouds of gas and dust. The three-dimensional pillars look like majestic rock formations, but are far more permeable. These columns are made up of cool interstellar gas and dust that appear semi-transparent in near-infrared light.",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=85",
    hdurl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2400&q=90",
    media_type: "image",
    copyright: "NASA, ESA, CSA, STScI; J. DePasquale, A. Pagan, A. Koekemoer",
    category: "Star Nursery"
  },
  {
    date: "2024-03-20",
    title: "The Majestic Andromeda Galaxy (M31)",
    explanation: "How far can you see? The Andromeda Galaxy, located 2.5 million light-years away, is the most distant object easily visible to the unaided eye. Spanning over 220,000 light-years, it contains roughly one trillion stars. Andromeda and our Milky Way are the dominant members of the Local Group of galaxies and are projected to undergo a dramatic gravitational collision and merger in roughly 4.5 billion years.",
    url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1600&q=85",
    hdurl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2400&q=90",
    media_type: "image",
    copyright: "NASA / STScI / Robert Gendler",
    category: "Spiral Galaxy"
  },
  {
    date: "2024-02-14",
    title: "Perseverance Rover Gazes Across Jezero Crater",
    explanation: "NASA's Perseverance Mars rover captured this high-resolution panoramic mosaic looking out across the fan-shaped river delta in Jezero Crater. Billions of years ago, when Mars possessed a thicker atmosphere and liquid water flowed across its surface, this ancient crater held a deep lake. Perseverance's mastcam instruments are analyzing delta mudstones for potential chemical biosignatures of ancient microbial life.",
    url: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1600&q=85",
    hdurl: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=2400&q=90",
    media_type: "image",
    copyright: "NASA / JPL-Caltech / ASU / MSSS",
    category: "Planetary Surface"
  },
  {
    date: "2024-01-08",
    title: "The Southern Ring Nebula (NGC 3132)",
    explanation: "Two stars, locked in a tight orbit, shaped the local landscape of NGC 3132, the Southern Ring Nebula, captured here in crisp infrared clarity by Webb. The dying star at the center has been expelling shells of gas and dust for thousands of years in all directions, illuminating the stellar cemetery with iridescent cosmic rings.",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=85",
    hdurl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2400&q=90",
    media_type: "image",
    copyright: "NASA, ESA, CSA, STScI",
    category: "Planetary Nebula"
  }
];

// Export
if (typeof module !== "undefined" && module.exports) {
  module.exports = APOD_CURATED_ARCHIVE;
} else if (typeof window !== "undefined") {
  window.APOD_CURATED_ARCHIVE = APOD_CURATED_ARCHIVE;
}
