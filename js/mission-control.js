document.addEventListener('DOMContentLoaded', () => {
  const missions = [
    {
      id: 'artemis-i',
      program: 'Artemis',
      name: 'Artemis I',
      date: '16 Nov 2022',
      spacecraft: 'Orion / SLS',
      objective: 'Uncrewed lunar-orbit flight test validating Orion and the Space Launch System.',
      status: 'completed',
      image: 'https://images-assets.nasa.gov/image/as17-134-20425/as17-134-20425~orig.jpg'
    },
    {
      id: 'artemis-ii',
      program: 'Artemis',
      name: 'Artemis II',
      date: 'Crewed lunar flyby',
      spacecraft: 'Orion / SLS',
      objective: 'Crewed test flight planned to fly around the Moon before future lunar-landing missions.',
      status: 'planned',
      image: 'https://images-assets.nasa.gov/image/as17-134-20425/as17-134-20425~orig.jpg'
    },
    {
      id: 'apollo-11',
      program: 'Apollo',
      name: 'Apollo 11',
      date: '16 Jul 1969',
      spacecraft: 'Columbia / Eagle',
      objective: 'First crewed lunar landing; Armstrong and Aldrin spent more than 21 hours on the lunar surface.',
      status: 'completed',
      image: 'https://images-assets.nasa.gov/image/as11-40-5903/as11-40-5903~orig.jpg'
    },
    {
      id: 'voyager-1',
      program: 'Voyager',
      name: 'Voyager 1',
      date: '5 Sep 1977',
      spacecraft: 'Voyager spacecraft',
      objective: 'Outer-planet flybys and ongoing interstellar exploration through the heliospheric boundary.',
      status: 'ongoing',
      image: 'https://images-assets.nasa.gov/image/PIA17002/PIA17002~orig.jpg'
    },
    {
      id: 'voyager-2',
      program: 'Voyager',
      name: 'Voyager 2',
      date: '20 Aug 1977',
      spacecraft: 'Voyager spacecraft',
      objective: 'The only spacecraft to visit Uranus and Neptune; remains an ongoing interstellar mission.',
      status: 'ongoing',
      image: 'https://images-assets.nasa.gov/image/PIA17002/PIA17002~orig.jpg'
    },
    {
      id: 'dragon',
      program: 'SpaceX Dragon',
      name: 'Crew Dragon',
      date: 'Operational program',
      spacecraft: 'Crew Dragon',
      objective: 'Crew transportation to and from the International Space Station under NASA commercial crew operations.',
      status: 'ongoing',
      image: 'https://images-assets.nasa.gov/image/S69-31741/S69-31741~orig.jpg'
    }
  ];

  const timeline = [
    ['1969', 'apollo-11', 'Apollo 11 lands astronauts on the Moon.'],
    ['1977', 'voyager-1', 'Voyager 1 launches toward Jupiter and beyond.'],
    ['1977', 'voyager-2', 'Voyager 2 begins the outer-planet grand tour.'],
    ['2020', 'dragon', 'Crew Dragon Demo-2 restores crewed orbital launches from the United States.'],
    ['2022', 'artemis-i', 'Artemis I completes the first SLS/Orion lunar flight test.'],
    ['NEXT', 'artemis-ii', 'Artemis II is planned as the first crewed Artemis lunar flyby.']
  ];

  const grid = document.getElementById('mission-grid');
  const timelineGrid = document.getElementById('mission-timeline');

  const renderMissions = filter => {
    if (!grid) return;
    const visible = filter === 'all' ? missions : missions.filter(mission => mission.status === filter);
    grid.innerHTML = visible.map(mission => `
      <article class="mission-card" data-mission-id="${mission.id}">
        <div class="mission-card-media" style="background-image:url('${mission.image}')" role="img" aria-label="${mission.name} mission"></div>
        <div class="mission-card-body">
          <div class="mission-card-top">
            <span class="mission-card-program">${mission.program}</span>
            <span class="mission-status ${mission.status}">${mission.status}</span>
          </div>
          <h3>${mission.name}</h3>
          <p>${mission.objective}</p>
          <div class="mission-card-meta">
            <span>Date / Phase<strong>${mission.date}</strong></span>
            <span>Spacecraft<strong>${mission.spacecraft}</strong></span>
          </div>
        </div>
      </article>
    `).join('');
  };

  document.querySelectorAll('.mission-filter').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.mission-filter').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      renderMissions(button.dataset.filter);
    });
  });

  if (timelineGrid) {
    timelineGrid.innerHTML = timeline.map(([date, id, description]) => `
      <button class="mission-timeline-item" data-mission-id="${id}">
        <strong>${date}</strong>
        <span>${missions.find(mission => mission.id === id)?.name || id}</span>
        <small>${description}</small>
      </button>
    `).join('');

    timelineGrid.addEventListener('click', event => {
      const item = event.target.closest('.mission-timeline-item');
      if (!item) return;
      const card = grid?.querySelector(`[data-mission-id="${item.dataset.missionId}"]`);
      document.querySelectorAll('.mission-card.highlighted').forEach(element => element.classList.remove('highlighted'));
      if (card) {
        card.classList.add('highlighted');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  renderMissions('all');
});
