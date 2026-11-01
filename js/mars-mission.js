document.addEventListener('DOMContentLoaded', () => {
  const rovers = [
    {
      name: 'Sojourner',
      agency: 'NASA',
      year: '1997',
      mission: 'First successful wheeled rover to operate on another planet, validating rockers-bogie mobility on Mars.',
      image: 'https://images-assets.nasa.gov/image/PIA01120/PIA01120~orig.jpg'
    },
    {
      name: 'Spirit',
      agency: 'NASA',
      year: '2004',
      mission: 'Found evidence that ancient Mars had wet, possibly habitable environments in Gusev crater.',
      image: 'https://images-assets.nasa.gov/image/PIA15254/PIA15254~orig.jpg'
    },
    {
      name: 'Opportunity',
      agency: 'NASA',
      year: '2004',
      mission: 'Explored Meridiani Planum for 14 years and confirmed ancient acidic water once altered Martian rocks.',
      image: 'https://images-assets.nasa.gov/image/PIA19109/PIA19109~orig.jpg'
    },
    {
      name: 'Curiosity',
      agency: 'NASA',
      year: '2012',
      mission: 'Assesses habitability inside Gale Crater and studies Mars geology, climate and organic compounds.',
      image: 'https://images-assets.nasa.gov/image/PIA16239/PIA16239~orig.jpg'
    },
    {
      name: 'Perseverance',
      agency: 'NASA',
      year: '2021',
      mission: 'Explores Jezero Crater, seeks signs of ancient microbial life and prepares samples for future return.',
      image: 'https://images-assets.nasa.gov/image/PIA24401/PIA24401~orig.jpg'
    }
  ];

  const timeline = [
    ['1997', 'Sojourner', 'First rover mission: Pathfinder demonstrated Mars surface mobility.'],
    ['2004', 'Spirit', 'Entered Gusev Crater and found evidence of ancient water-altered minerals.'],
    ['2004', 'Opportunity', 'Reached Meridiani Planum and began its record-setting 14-year traverse.'],
    ['2012', 'Curiosity', 'Delivered laboratory-scale science to Gale Crater.'],
    ['2021', 'Perseverance', 'Began searching Jezero Crater for biosignatures and collecting samples.']
  ];

  const roverGrid = document.getElementById('mars-rover-grid');
  if (roverGrid) {
    roverGrid.innerHTML = rovers.map((rover, index) => `
      <article class="mars-rover-card ${index === 3 ? 'active' : ''}">
        <div class="mars-rover-image" style="background-image:url('${rover.image}')" role="img" aria-label="${rover.name} on Mars"></div>
        <div class="mars-rover-card-body">
          <div class="mars-rover-meta"><span>${rover.agency}</span><span>${rover.year}</span></div>
          <h4>${rover.name}</h4>
          <p>${rover.mission}</p>
          <div class="mars-card-footer">
            <span class="hud-pill"><span class="hud-pill-dot"></span><span>MISSION ARCHIVE</span></span>
          </div>
        </div>
      </article>
    `).join('');

    roverGrid.querySelectorAll('.mars-rover-card').forEach(card => {
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      const activate = () => {
        roverGrid.querySelectorAll('.mars-rover-card').forEach(item => item.classList.remove('active'));
        card.classList.add('active');
      };
      card.addEventListener('click', activate);
      card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
        }
      });
    });
  }

  const timelineGrid = document.getElementById('mars-timeline');
  if (timelineGrid) {
    timelineGrid.innerHTML = timeline.map(([year, name, description]) => `
      <article class="mars-timeline-item">
        <span class="mars-timeline-node"></span>
        <strong>${year}</strong>
        <h4>${name}</h4>
        <p>${description}</p>
      </article>
    `).join('');
  }
});
