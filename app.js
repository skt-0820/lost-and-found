(() => {
  const seed = [];
  const storageKey = 'lostfound-reports-v1';
  const config = window.LF_CONFIG || {};
  const supabaseReady = !!(config.supabaseUrl && config.supabaseAnonKey && window.supabase);
  const client = supabaseReady ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey) : null;
  const cards = document.querySelector('#cards');
  const empty = document.querySelector('#empty-state');
  const dialog = document.querySelector('#report-dialog');
  const form = document.querySelector('#report-form');
  let reports = [];
  let filter = 'all';

  const safe = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const niceDate = value => {
    if (!value) return 'DATE NOT SET';
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? 'DATE NOT SET' : date.toLocaleDateString(undefined, {month:'short',day:'numeric',year:'numeric'}).toUpperCase();
  };
  const localLoad = () => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
  };
  async function loadReports() {
    if (client) {
      const { data, error } = await client.from('reports').select('*').order('created_at', { ascending: false });
      if (!error) { reports = data || []; render(); return; }
      toast('Could not reach the shared board. Showing saved reports on this device.');
    }
    reports = [...seed, ...localLoad()];
    render();
  }
  function render() {
    const query = document.querySelector('#search').value.trim().toLowerCase();
    const shown = reports.filter(item => (filter === 'all' || item.type === filter) && (!query || `${item.title} ${item.location} ${item.category} ${item.description}`.toLowerCase().includes(query)));
    cards.innerHTML = shown.map(item => {
      const type = item.type === 'found' ? 'found' : 'lost';
      const contact = String(item.contact || '').trim();
      const href = /^https?:\/\//i.test(contact) ? safe(contact) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ? `mailto:${safe(contact)}` : `tel:${safe(contact).replace(/[^+\d]/g,'')}`;
      return `<article class="report-card"><div class="card-top"><span class="badge ${type === 'lost' ? 'lost' : ''}">${type === 'found' ? 'FOUND' : 'LOST'} · ${safe(item.category || 'OTHER').toUpperCase()}</span><span class="card-date">${niceDate(item.date)}</span></div><h3>${safe(item.title)}</h3><p class="card-description">${safe(item.description || 'No extra details added.')}</p><div class="card-bottom"><span class="card-location"><span>⌖</span>${safe(item.location)}</span><a class="contact-link" href="${href}" ${href.startsWith('mailto:') ? '' : 'target="_blank" rel="noreferrer"'}>Get in touch ↗</a></div></article>`;
    }).join('');
    empty.classList.toggle('show', shown.length === 0);
    document.querySelector('#stat-count').textContent = reports.length;
    document.querySelector('#all-count').textContent = reports.length;
  }
  function toast(message) {
    const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 3200);
  }
  document.querySelectorAll('[data-open-form]').forEach(button => button.addEventListener('click', () => {
    const type = button.dataset.openForm;
    document.querySelector('#report-type').value = type;
    document.querySelector('#form-title').textContent = type === 'lost' ? 'Report a lost item' : 'Report a found item';
    document.querySelector('#form-kicker').textContent = type === 'lost' ? 'NEED A HAND FINDING IT?' : 'ADD A LITTLE GOOD NEWS';
    form.elements.date.value = new Date().toISOString().slice(0, 10);
    dialog.showModal();
  }));
  document.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
    document.querySelector('.filter.active').classList.remove('active'); button.classList.add('active'); filter = button.dataset.filter; render();
  }));
  document.querySelector('#search').addEventListener('input', render);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const report = { ...data, created_at: new Date().toISOString() };
    const submit = form.querySelector('[type="submit"]'); submit.disabled = true; submit.textContent = 'Posting…';
    if (client) {
      const { error } = await client.from('reports').insert([report]);
      if (error) { toast('Could not post to the shared board. Please try again.'); submit.disabled = false; submit.innerHTML = 'Post to the board <span>↗</span>'; return; }
    } else {
      const previous = localLoad(); previous.unshift({ ...report, id: crypto.randomUUID() }); localStorage.setItem(storageKey, JSON.stringify(previous));
    }
    form.reset(); dialog.close(); submit.disabled = false; submit.innerHTML = 'Post to the board <span>↗</span>';
    toast(client ? 'Posted to the community board!' : 'Posted on this device. Connect Supabase to share it with everyone.');
    await loadReports();
  });
  loadReports();
})();
