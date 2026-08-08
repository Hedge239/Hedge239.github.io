var allProjects = allProjects || [];
var selectedTags = selectedTags || new Set();

loadProjectsData();

function loadProjectsData() {
  fetch('projects.json')
    .then(response => {
      if (!response.ok) throw new Error("HTTP error " + response.status);
      return response.json();
    })
    .then(data => {
      allProjects = data;
      initData();
    })
    .catch(error => {
      console.warn('Could not load projects.json. Check file path or format.', error);
    });
}

function initData() {
  populateDropdown(allProjects);
  filterProjects();
}

function populateDropdown(projects) {
  const tagSet = new Set();
  projects.forEach(p => p.tags.forEach(t => tagSet.add(t)));

  const select = document.getElementById('tagSelect');
  select.innerHTML = '<option value="">+ Add Tag Filter...</option>';

  Array.from(tagSet).sort().forEach(tag => {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    select.appendChild(option);
  });
}

function addTagFromSelect() {
  const select = document.getElementById('tagSelect');
  const value = select.value;
  if (value) {
    addTagFilter(value);
    select.value = "";
  }
}

function addTagFilter(tag) {
  selectedTags.add(tag);
  renderActiveTags();
  filterProjects();
}

function removeTagFilter(tag) {
  selectedTags.delete(tag);
  renderActiveTags();
  filterProjects();
}

function renderActiveTags() {
  const container = document.getElementById('selectedTagsContainer');
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

function filterProjects() {
  const query = document.getElementById('searchInput').value.toLowerCase();

  const filtered = allProjects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
    const matchesTags = Array.from(selectedTags).every(tag => p.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  renderProjects(filtered);
}

function renderProjects(projects) {
  const grid = document.getElementById('projectGrid');
  grid.innerHTML = '';

  if (projects.length === 0) {
    grid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">No projects match your current filters.</p>';
    return;
  }

  projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div>
        <h3 class="project-title">${p.name}</h3>
        <div class="project-meta">
          <span>v${p.version}</span>
          <span>${p.status}</span>
        </div>
        <p>${p.description}</p>
        <div class="tags">
          ${p.tags.map(t => `<span class="tag-pill" onclick="addTagFilter('${t}')">${t}</span>`).join('')}
        </div>
      </div>
      <a href="${p.link}" target="_blank" class="project-link">View Project</a>
    `;
    grid.appendChild(card);
  });
}