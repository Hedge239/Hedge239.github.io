var projects = projects || [];
var selectedTags = selectedTags || new Set();

loadProjectsData();

// Data Population
function loadProjectsData()
{
  fetch('projects.json')
    .then(response => {
      if(!response.ok){ throw new Error("HTTP error " + response.status) }
      return response.json();
    })
    .then(data => {
      projects = data;
      initData();
    })
    .catch(error => {
      console.warn('Could not load projects.json. Check file path or format.', error);
    });
}

function initData()
{
  populateDropdowns(projects);
  filterProjects();
}

function populateDropdowns(projectData)
{
  const tagSet = new Set();
  const licenseSet = new Set();
  const osSet = new Set();

  projectData.forEach(proj => {
    if(proj.tags){ proj.tags.forEach(tag => tagSet.add(tag)); }
    if(proj.license){ licenseSet.add(proj.license); }
    if(proj.os){ proj.os.forEach(o => osSet.add(o)); }
  })

  const tagSelect = document.getElementById('tagSelect');
  if (tagSelect) 
  {
    tagSelect.innerHTML = '<option value="">+ Add Tag Filter...</option>';
    Array.from(tagSet).sort().forEach(tag => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = tag;
      tagSelect.appendChild(option);
    });
  }

  const licenseSelect = document.getElementById('licenseSelect');
  if (licenseSelect) 
  {
    licenseSelect.innerHTML = '<option value="">All Licenses</option>';
    Array.from(licenseSet).sort().forEach(license => {
      const option = document.createElement('option');
      option.value = license;
      option.textContent = license;
      licenseSelect.appendChild(option);
    });
  }

  const osSelect = document.getElementById('osSelect');
  if (osSelect) {
    osSelect.innerHTML = '<option value="">All OS</option>';
    Array.from(osSet).sort().forEach(os => {
      const option = document.createElement('option');
      option.value = os;
      option.textContent = os;
      osSelect.appendChild(option);
    });
  }
}

// Tags
function addTagFromSelect()
{
  const select = document.getElementById('tagSelect');
  const value = select ? select.value : '';
  if (value) {
    addTagFilter(value);
    select.value = "";
  }
}

function addTagFilter(tag) 
{
  selectedTags.add(tag);
  renderActiveTags();
  filterProjects();
}

function removeTagFilter(tag) 
{
  selectedTags.delete(tag);
  renderActiveTags();
  filterProjects();
}

function renderActiveTags() 
{
  const container = document.getElementById('selectedTagsContainer');
  if(!container){ return; }

  container.innerHTML = '';
  selectedTags.forEach(tag => {
    const pill = document.createElement('span');
    pill.className = 'active-tag-pill';
    pill.innerHTML = `
      ${tag}
      <button onclick="removeTagFilter('${tag}')">&times;</button>
    `;
    container.appendChild(pill);
  });
}

// Rendering
function filterProjects()
{
  const queryInput = document.getElementById('searchInput');
  const query = queryInput ? queryInput.value.toLowerCase() : '';

  const licenseSelect = document.getElementById('licenseSelect');
  const selectedLicense = licenseSelect ? licenseSelect.value : '';

  const osSelect = document.getElementById('osSelect');
  const selectedOS = osSelect ? osSelect.value : '';

  const filtered = projects.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query)) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(query))) ||
      (p.os && p.os.some(o => o.toLowerCase().includes(query)));

    const matchesLicense = !selectedLicense || p.license === selectedLicense;
    const matchesOS = !selectedOS || (p.os && p.os.includes(selectedOS));
    const matchesTags = Array.from(selectedTags).every(tag => p.tags && p.tags.includes(tag));

    return matchesSearch && matchesLicense && matchesOS && matchesTags;
  });

  renderProjects(filtered);
}

function renderProjects(projectData)
{
  const grid = document.getElementById('projectGrid');
  if(!grid){ return; }

  grid.innerHTML = '';
  if (projects.length === 0) 
  {
    grid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">No projects match your current filters.</p>';
    return;
  }

  projectData.forEach(proj => {
    const card = document.createElement('div');
    card.className = 'project-card';

    // Information
    const isProprietary = proj.license && proj.license.toLowerCase().includes('proprietary');
    const licenseClass = isProprietary ? 'license-badge proprietary' : 'license-badge standard';
    const licenseText = proj.license || 'Unlicensed';
    
    const osHTML = (proj.os || []).map(os => `<span class="os-badge">${os}</span>`).join('');
    const tagsHTML = (proj.tags || []).map(t => `<span class="tag-pill" onclick="addTagFilter('${t}')">${t}</span>`).join('');

    // Links
    let linksHTML = '';
    if (proj.links && proj.links.length > 0) 
    {
      linksHTML = `<div class="project-links-group">` + proj.links.map(link => `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="project-link">${link.label || 'View'}</a>`).join('') + `</div>`;
    } else { linksHTML = `<div class="project-links-group"><span class="no-link-badge">Private / No Link</span></div>`; }

    // Per-Project Card
    card.innerHTML = `
      <div>
        <div class="project-header">
          <h3 class="project-title">${proj.name}</h3>
          <span class="${licenseClass}">${licenseText}</span>
        </div>
        <div class="project-meta">
          <span>v${proj.version || '0.0.0'}</span>
          <span>${proj.status || 'Unknown'}</span>
        </div>
        ${osHTML ? `<div class="os-container">${osHTML}</div>` : ''}
        <p>${proj.description || ''}</p>
        <div class="tags">${tagsHTML}</div>
      </div>
      ${linksHTML}
    `;

    grid.appendChild(card);
  });
}