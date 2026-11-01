/**
 * ORBITX - NASA Scientific Planetary Dataset
 * Accurate astronomical metrics based on NASA Planetary Fact Sheets
 */

const PLANETS_DATA = {
  sun: {
    id: "sun",
    name: "The Sun",
    category: "Yellow Dwarf Star (G2V)",
    tagline: "The blazing thermonuclear heart of our solar system",
    color: "#FDB813",
    secondaryColor: "#FF6200",
    glowColor: "rgba(253, 184, 19, 0.6)",
    diameterKm: 1392700,
    diameterRelativeEarth: 109.2,
    massKg: "1.989 × 10³⁰",
    massRelativeEarth: "333,000x",
    surfaceTempC: 5500,
    coreTempC: 15000000,
    distanceFromSunKm: 0,
    distanceFromSunAu: 0,
    orbitalPeriodDays: 0,
    orbitalSpeedKmS: 0,
    rotationPeriodHours: 648, // ~27 Earth days at equator
    gravityMs2: 274.0,
    gravityRelativeEarth: 27.9,
    moonsCount: 8, // Major planets
    atmosphere: [
      { element: "Hydrogen", percentage: 73.46 },
      { element: "Helium", percentage: 24.85 },
      { element: "Oxygen", percentage: 0.77 },
      { element: "Carbon", percentage: 0.29 },
      { element: "Iron / Others", percentage: 0.63 }
    ],
    scientificSummary: "The Sun contains 99.86% of all mass in the Solar System. Through nuclear fusion in its core, it fuses 600 million tons of hydrogen into helium every second, generating solar wind, electromagnetic radiation, and sustaining all life on Earth.",
    keyFacts: [
      "Light takes approximately 8 minutes and 20 seconds to travel from the Sun to Earth.",
      "The Sun's core produces energy through proton-proton thermonuclear fusion at 15,000,000 °C.",
      "Every second, the Sun converts 4.26 million metric tons of matter into energy.",
      "Its magnetic cycle flips polarities every 11 years, driving sunspot cycles and coronal mass ejections."
    ],
    explorationMissions: [
      { name: "Parker Solar Probe", agency: "NASA", year: 2018, status: "Active (closest approach to Sun)" },
      { name: "Solar Orbiter", agency: "ESA/NASA", year: 2020, status: "Active" },
      { name: "SOHO", agency: "ESA/NASA", year: 1995, status: "Active" }
    ],
    image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80",
    textureStyle: "radial-gradient(circle at 35% 35%, #FFF7D6 0%, #FFB703 30%, #FB8500 60%, #9E2A2B 100%)",
    orbitVisual: {
      relativeRadius: 0,
      renderSize: 34,
      orbitalDurationSec: 0
    }
  },

  mercury: {
    id: "mercury",
    name: "Mercury",
    category: "Terrestrial Planet",
    tagline: "The swift, scorched, iron-rich messenger world",
    color: "#A8A29E",
    secondaryColor: "#78716C",
    glowColor: "rgba(168, 162, 158, 0.4)",
    diameterKm: 4879,
    diameterRelativeEarth: 0.383,
    massKg: "3.301 × 10²³",
    massRelativeEarth: "0.055x",
    surfaceTempC: 167, // Mean, swings -180C to +430C
    minTempC: -180,
    maxTempC: 430,
    distanceFromSunKm: 57909000,
    distanceFromSunAu: 0.387,
    orbitalPeriodDays: 87.97,
    orbitalSpeedKmS: 47.36,
    rotationPeriodHours: 1407.6, // 58.65 Earth days
    gravityMs2: 3.7,
    gravityRelativeEarth: 0.38,
    moonsCount: 0,
    atmosphere: [
      { element: "Oxygen", percentage: 42.0 },
      { element: "Sodium", percentage: 29.0 },
      { element: "Hydrogen", percentage: 22.0 },
      { element: "Helium", percentage: 6.0 },
      { element: "Potassium / Other", percentage: 1.0 }
    ],
    scientificSummary: "Mercury is the smallest planet in the solar system and closest to the Sun. It experiences extreme temperature swings from 430°C in direct sunlight to -180°C in shadowed craters. Its enormous metallic core makes up about 85% of its radius.",
    keyFacts: [
      "A day-night cycle on Mercury takes 176 Earth days due to 3:2 spin-orbit resonance.",
      "Despite being closest to the Sun, water ice exists in permanently shadowed craters at its poles.",
      "Mercury has a dense metallic core with a radius of approximately 2,000 km.",
      "It has no significant atmosphere, only an extremely tenuous surface-boundary exosphere."
    ],
    explorationMissions: [
      { name: "MESSENGER", agency: "NASA", year: 2004, status: "Orbited 2011–2015, mapped 100% surface" },
      { name: "Mariner 10", agency: "NASA", year: 1973, status: "First flybys (1974–1975)" },
      { name: "BepiColombo", agency: "ESA/JAXA", year: 2018, status: "En route, orbital insertion 2025/2026" }
    ],
    image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80",
    textureStyle: "radial-gradient(circle at 35% 35%, #D6D3D1 0%, #A8A29E 40%, #78716C 70%, #292524 100%)",
    textureImage: "https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/mercurymap.jpg",
    orbitVisual: {
      relativeRadius: 52,
      renderSize: 8,
      orbitalDurationSec: 8.8
    }
  },

  venus: {
    id: "venus",
    name: "Venus",
    category: "Terrestrial Planet",
    tagline: "The volcanic inferno shrouded in sulfuric clouds",
    color: "#EAB308",
    secondaryColor: "#CA8A04",
    glowColor: "rgba(234, 179, 8, 0.4)",
    diameterKm: 12104,
    diameterRelativeEarth: 0.949,
    massKg: "4.867 × 10²⁴",
    massRelativeEarth: "0.815x",
    surfaceTempC: 464, // 737 K
    minTempC: 438,
    maxTempC: 480,
    distanceFromSunKm: 108200000,
    distanceFromSunAu: 0.723,
    orbitalPeriodDays: 224.7,
    orbitalSpeedKmS: 35.02,
    rotationPeriodHours: -5832.5, // 243 Earth days retrograde
    gravityMs2: 8.87,
    gravityRelativeEarth: 0.91,
    moonsCount: 0,
    atmosphere: [
      { element: "Carbon Dioxide", percentage: 96.5 },
      { element: "Nitrogen", percentage: 3.5 },
      { element: "Sulfur Dioxide", percentage: 0.015 },
      { element: "Water Vapor", percentage: 0.002 }
    ],
    scientificSummary: "Often termed Earth's 'twin' in size and density, Venus is the hottest planet in the Solar System due to a catastrophic runaway greenhouse effect. Atmospheric surface pressure is 92 times that of Earth—equivalent to being 900 meters underwater.",
    keyFacts: [
      "Venus rotates backwards (retrograde) compared to most other planets in the solar system.",
      "Its day (243 Earth days) is longer than its year (224.7 Earth days).",
      "Surface temperatures reach 464 °C (867 °F)—hot enough to melt lead.",
      "Clouds of corrosive sulfuric acid whip around the planet at 360 km/h in super-rotation."
    ],
    explorationMissions: [
      { name: "Magellan", agency: "NASA", year: 1989, status: "Radar-mapped 98% of planet" },
      { name: "Venera 13 & 14", agency: "Soviet Union", year: 1981, status: "Landed on surface and sent color photos" },
      { name: "DAVINCI & VERITAS", agency: "NASA", year: 2029, status: "Planned atmospheric and mapping probes" }
    ],
    image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80",
    textureStyle: "radial-gradient(circle at 35% 35%, #FEF08A 0%, #EAB308 45%, #B45309 80%, #451A03 100%)",
    textureImage: "https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/venusmap.jpg",
    orbitVisual: {
      relativeRadius: 78,
      renderSize: 13,
      orbitalDurationSec: 14.2
    }
  },

  earth: {
    id: "earth",
    name: "Earth",
    category: "Terrestrial Planet",
    tagline: "The vibrant blue oasis of life, liquid oceans and oxygen",
    color: "#38BDF8",
    secondaryColor: "#2563EB",
    glowColor: "rgba(56, 189, 248, 0.5)",
    diameterKm: 12742,
    diameterRelativeEarth: 1.0,
    massKg: "5.972 × 10²⁴",
    massRelativeEarth: "1.000x",
    surfaceTempC: 15,
    minTempC: -89.2, // Antarctica Vostok
    maxTempC: 56.7,  // Death Valley
    distanceFromSunKm: 149600000,
    distanceFromSunAu: 1.000,
    orbitalPeriodDays: 365.256,
    orbitalSpeedKmS: 29.78,
    rotationPeriodHours: 23.934,
    gravityMs2: 9.807,
    gravityRelativeEarth: 1.0,
    moonsCount: 1, // Luna
    atmosphere: [
      { element: "Nitrogen", percentage: 78.08 },
      { element: "Oxygen", percentage: 20.95 },
      { element: "Argon", percentage: 0.93 },
      { element: "Carbon Dioxide", percentage: 0.04 },
      { element: "Water Vapor", percentage: 1.0 }
    ],
    scientificSummary: "Earth is the third planet from the Sun and the only astronomical object known to harbor life. Approximately 71% of Earth's surface is covered by liquid water oceans, protected from lethal cosmic radiation by an active iron-nickel core geodynamo magnetic field.",
    keyFacts: [
      "Earth's atmosphere and magnetosphere shield surface life from lethal solar radiation and galactic cosmic rays.",
      "The Moon stabilizes Earth's axial tilt (23.4°), producing stable climate seasons over billions of years.",
      "Earth is the only place in the known universe with active plate tectonics recycling carbon.",
      "Circumference at the equator is 40,075 kilometers (24,901 miles)."
    ],
    explorationMissions: [
      { name: "International Space Station", agency: "NASA/ESA/JAXA/CSA/Roscosmos", year: 1998, status: "Continuously inhabited orbital laboratory" },
      { name: "Landsat & Earth Observation", agency: "NASA / USGS", year: 1972, status: "50+ years of satellite earth monitoring" },
      { name: "Artemis Program", agency: "NASA & Partners", year: 2022, status: "Lunar return mission architecture" }
    ],
    image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80",
    textureStyle: "radial-gradient(circle at 35% 35%, #93C5FD 0%, #38BDF8 30%, #1D4ED8 70%, #0B192C 100%)",
    textureImage: "https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/earthmap1k.jpg",
    orbitVisual: {
      relativeRadius: 108,
      renderSize: 14,
      orbitalDurationSec: 20.0
    }
  },

  mars: {
    id: "mars",
    name: "Mars",
    category: "Terrestrial Planet",
    tagline: "The oxidized red desert with colossal canyons and dormant volcanoes",
    color: "#EF4444",
    secondaryColor: "#B91C1C",
    glowColor: "rgba(239, 68, 68, 0.4)",
    diameterKm: 6779,
    diameterRelativeEarth: 0.532,
    massKg: "6.417 × 10²³",
    massRelativeEarth: "0.107x",
    surfaceTempC: -63,
    minTempC: -140,
    maxTempC: 30,
    distanceFromSunKm: 227900000,
    distanceFromSunAu: 1.524,
    orbitalPeriodDays: 686.98,
    orbitalSpeedKmS: 24.07,
    rotationPeriodHours: 24.623,
    gravityMs2: 3.72,
    gravityRelativeEarth: 0.38,
    moonsCount: 2, // Phobos & Deimos
    atmosphere: [
      { element: "Carbon Dioxide", percentage: 95.32 },
      { element: "Nitrogen", percentage: 2.6 },
      { element: "Argon", percentage: 1.9 },
      { element: "Oxygen", percentage: 0.13 },
      { element: "Carbon Monoxide", percentage: 0.08 }
    ],
    scientificSummary: "Mars is known as the Red Planet due to ubiquitous iron oxide (rust) dust on its surface. It hosts Olympus Mons, the largest volcano in the Solar System (21.9 km tall—nearly 3x Everest), and Valles Marineris, an immense rift canyon extending over 4,000 km.",
    keyFacts: [
      "Mars has two small irregular captured asteroidal moons named Phobos and Deimos.",
      "Liquid water once carved massive outflow channels, lakes, and deltas across the Martian surface 3.8 billion years ago.",
      "A Martian day is called a 'sol' and is 24 hours, 39 minutes, and 35 seconds long.",
      "Subsurface water ice is abundant across both polar caps and mid-latitudes."
    ],
    explorationMissions: [
      { name: "Perseverance Rover & Ingenuity", agency: "NASA", year: 2020, status: "Active in Jezero Crater seeking biosignatures" },
      { name: "Curiosity Rover", agency: "NASA", year: 2011, status: "Active in Gale Crater studying ancient habitability" },
      { name: "Mars Express & TGO", agency: "ESA", year: 2003, status: "Active atmospheric and mineral mapping" }
    ],
    image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80",
    textureStyle: "radial-gradient(circle at 35% 35%, #FCA5A5 0%, #EF4444 40%, #B91C1C 75%, #450A0A 100%)",
    textureImage: "https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/marsmap1k.jpg",
    orbitVisual: {
      relativeRadius: 142,
      renderSize: 10,
      orbitalDurationSec: 28.5
    }
  },

  jupiter: {
    id: "jupiter",
    name: "Jupiter",
    category: "Gas Giant",
    tagline: "The king of planets, storm-carved behemoth and shield of Earth",
    color: "#F97316",
    secondaryColor: "#C2410C",
    glowColor: "rgba(249, 115, 22, 0.45)",
    diameterKm: 139820,
    diameterRelativeEarth: 10.97,
    massKg: "1.898 × 10²⁷",
    massRelativeEarth: "317.8x",
    surfaceTempC: -110, // 1-bar atmospheric level
    minTempC: -145,
    maxTempC: 24, // deeper atmospheric tiers
    distanceFromSunKm: 778500000,
    distanceFromSunAu: 5.204,
    orbitalPeriodDays: 4332.59, // 11.86 Earth years
    orbitalSpeedKmS: 13.07,
    rotationPeriodHours: 9.925, // Fastest rotation in solar system
    gravityMs2: 24.79,
    gravityRelativeEarth: 2.53,
    moonsCount: 95, // Official IAU confirmed
    atmosphere: [
      { element: "Hydrogen", percentage: 89.8 },
      { element: "Helium", percentage: 10.2 },
      { element: "Methane", percentage: 0.3 },
      { element: "Ammonia", percentage: 0.026 }
    ],
    scientificSummary: "Jupiter contains more than two and a half times the mass of all other planets in the Solar System combined. It features the Great Red Spot—an anticyclonic storm larger than Earth raging for over 350 years. Its magnetosphere is the largest structure in the Solar System.",
    keyFacts: [
      "Jupiter completes a rotation in under 10 hours, creating pronounced equatorial flattening.",
      "The four Galilean moons (Io, Europa, Ganymede, Callisto) are planetary-scale worlds in their own right.",
      "Ganymede is the largest moon in the solar system, even larger than the planet Mercury.",
      "Europa conceals a global liquid ocean beneath its icy crust containing twice the water of all Earth's oceans."
    ],
    explorationMissions: [
      { name: "Juno", agency: "NASA", year: 2011, status: "Active polar orbiter probing deep atmosphere & core" },
      { name: "Galileo", agency: "NASA", year: 1989, status: "First orbiter (1995–2003)" },
      { name: "JUICE & Europa Clipper", agency: "ESA & NASA", year: 2023, status: "En route to explore icy Galilean moons" }
    ],
    image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80",
    textureStyle: "radial-gradient(circle at 35% 35%, #FED7AA 0%, #FB923C 35%, #C2410C 70%, #431407 100%)",
    textureImage: "https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/jupitermap.jpg",
    orbitVisual: {
      relativeRadius: 188,
      renderSize: 24,
      orbitalDurationSec: 42.0
    }
  },

  saturn: {
    id: "saturn",
    name: "Saturn",
    category: "Gas Giant",
    tagline: "The crowned jewel with majestic ice-and-rock ring architecture",
    color: "#FDE047",
    secondaryColor: "#CA8A04",
    glowColor: "rgba(253, 224, 71, 0.4)",
    diameterKm: 116460,
    diameterRelativeEarth: 9.14,
    massKg: "5.683 × 10²⁶",
    massRelativeEarth: "95.2x",
    surfaceTempC: -140,
    minTempC: -178,
    maxTempC: -130,
    distanceFromSunKm: 1434000000,
    distanceFromSunAu: 9.582,
    orbitalPeriodDays: 10759.22, // 29.45 Earth years
    orbitalSpeedKmS: 9.69,
    rotationPeriodHours: 10.656,
    gravityMs2: 10.44,
    gravityRelativeEarth: 1.07,
    moonsCount: 146, // Most confirmed moons in solar system
    atmosphere: [
      { element: "Hydrogen", percentage: 96.3 },
      { element: "Helium", percentage: 3.25 },
      { element: "Methane", percentage: 0.45 },
      { element: "Ammonia", percentage: 0.01 }
    ],
    scientificSummary: "Saturn is famed for its ring system, spanning over 282,000 kilometers yet measuring only tens of meters thick on average. Composed of 99% pure water ice, the rings reflect solar glare brilliantly. Saturn is also the least dense planet—it could float in water.",
    keyFacts: [
      "Saturn's mean density (0.687 g/cm³) is lower than liquid water.",
      "Titan, Saturn's largest moon, has a thick nitrogen atmosphere and liquid methane-ethane rain and lakes.",
      "Enceladus shoots continuous geysers of salty water from deep hydrothermal vents into space.",
      "A persistent hexagonal jet stream storm system locks onto Saturn's north pole."
    ],
    explorationMissions: [
      { name: "Cassini-Huygens", agency: "NASA/ESA/ASI", year: 1997, status: "13-year historic orbital study (2004–2017)" },
      { name: "Voyager 1 & 2", agency: "NASA", year: 1977, status: "Revolutionary 1980–1981 flybys" },
      { name: "Dragonfly", agency: "NASA", year: 2028, status: "Planned autonomous rotorcraft to explore Titan" }
    ],
    image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80",
    textureStyle: "radial-gradient(circle at 35% 35%, #FEF9C3 0%, #FDE047 35%, #CA8A04 70%, #713F12 100%)",
    textureImage: "https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/saturnmap.jpg",
    hasRings: true,
    ringColor: "rgba(234, 179, 8, 0.65)",
    orbitVisual: {
      relativeRadius: 236,
      renderSize: 20,
      orbitalDurationSec: 58.0
    }
  },

  uranus: {
    id: "uranus",
    name: "Uranus",
    category: "Ice Giant",
    tagline: "The tilted cyan realm rolling on its side in freezing tranquility",
    color: "#22D3EE",
    secondaryColor: "#0891B2",
    glowColor: "rgba(34, 211, 238, 0.45)",
    diameterKm: 50724,
    diameterRelativeEarth: 3.98,
    massKg: "8.681 × 10²⁵",
    massRelativeEarth: "14.5x",
    surfaceTempC: -195,
    minTempC: -224, // Coldest planetary atmosphere recorded
    maxTempC: -190,
    distanceFromSunKm: 2871000000,
    distanceFromSunAu: 19.22,
    orbitalPeriodDays: 30687.15, // 84.02 Earth years
    orbitalSpeedKmS: 6.81,
    rotationPeriodHours: -17.24, // Retrograde rotation
    gravityMs2: 8.69,
    gravityRelativeEarth: 0.89,
    moonsCount: 28,
    atmosphere: [
      { element: "Hydrogen", percentage: 82.5 },
      { element: "Helium", percentage: 15.2 },
      { element: "Methane", percentage: 2.3 },
      { element: "Hydrogen Deuteride", percentage: 0.01 }
    ],
    scientificSummary: "Uranus is an Ice Giant with an extreme 97.77° axial tilt—it effectively rolls around the Sun on its side. Atmospheric methane absorbs red light, giving Uranus its serene cyan tint. It holds the record for the lowest recorded atmospheric temperature (-224°C).",
    keyFacts: [
      "Due to its 98-degree axial tilt, each pole experiences 42 continuous years of sunlight followed by 42 years of darkness.",
      "Uranus possesses 13 faint, dark planetary rings discovered in 1977.",
      "Unlike gas giants, its mantle is dominated by dense icy fluids of water, ammonia, and methane.",
      "Its magnetic field is tilted 59 degrees from its rotational axis and offset from the center."
    ],
    explorationMissions: [
      { name: "Voyager 2", agency: "NASA", year: 1977, status: "Only spacecraft to fly by Uranus (Jan 1986)" },
      { name: "Uranus Orbiter & Probe (UOP)", agency: "NASA Flagship", year: 2031, status: "Top priority planetary decadal survey mission" }
    ],
    image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80",
    textureStyle: "radial-gradient(circle at 35% 35%, #CFFAFE 0%, #22D3EE 40%, #0891B2 75%, #164E63 100%)",
    textureImage: "https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/uranusmap.jpg",
    orbitVisual: {
      relativeRadius: 284,
      renderSize: 15,
      orbitalDurationSec: 76.0
    }
  },

  neptune: {
    id: "neptune",
    name: "Neptune",
    category: "Ice Giant",
    tagline: "The deep cobalt frontier battered by supersonic supersonic winds",
    color: "#60A5FA",
    secondaryColor: "#1D4ED8",
    glowColor: "rgba(96, 165, 250, 0.5)",
    diameterKm: 49244,
    diameterRelativeEarth: 3.86,
    massKg: "1.024 × 10²⁶",
    massRelativeEarth: "17.1x",
    surfaceTempC: -200,
    minTempC: -218,
    maxTempC: -190,
    distanceFromSunKm: 4495000000,
    distanceFromSunAu: 30.05,
    orbitalPeriodDays: 60190.03, // 164.79 Earth years
    orbitalSpeedKmS: 5.43,
    rotationPeriodHours: 16.11,
    gravityMs2: 11.15,
    gravityRelativeEarth: 1.14,
    moonsCount: 16,
    atmosphere: [
      { element: "Hydrogen", percentage: 80.0 },
      { element: "Helium", percentage: 19.0 },
      { element: "Methane", percentage: 1.5 },
      { element: "Ethane / Acetylene", percentage: 0.01 }
    ],
    scientificSummary: "Neptune is the most distant major planet in the Solar System. Despite receiving only 0.1% of the sunlight Earth receives, it features the most violent weather with supersonic winds reaching 2,160 km/h (1,340 mph) and dark storm vortices.",
    keyFacts: [
      "Neptune was the first planet located via mathematical prediction (by Urbain Le Verrier) before being seen.",
      "Triton, Neptune's largest moon, orbits backward (retrograde) and shoots liquid nitrogen geysers.",
      "Neptune completed its first full orbit since discovery (1846) in 2011.",
      "It has 5 faint rings composed of dark radiation-processed organic compounds."
    ],
    explorationMissions: [
      { name: "Voyager 2", agency: "NASA", year: 1977, status: "Historic flyby in August 1989 discovered Great Dark Spot" },
      { name: "Hubble & JWST", agency: "NASA/ESA", year: 2022, status: "Capturing clear infrared images of rings and clouds" }
    ],
    image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80",
    textureStyle: "radial-gradient(circle at 35% 35%, #BFDBFE 0%, #3B82F6 40%, #1D4ED8 75%, #0B192C 100%)",
    textureImage: "https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/neptunemap.jpg",
    orbitVisual: {
      relativeRadius: 330,
      renderSize: 15,
      orbitalDurationSec: 94.0
    }
  }
};

// Export for module use or window attach
if (typeof module !== "undefined" && module.exports) {
  module.exports = PLANETS_DATA;
} else if (typeof window !== "undefined") {
  window.PLANETS_DATA = PLANETS_DATA;
}
