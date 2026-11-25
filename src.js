import '@fontsource-variable/inter';
import '@phosphor-icons/web/regular';
import '@phosphor-icons/web/fill';
import './style.css';

const chart = document.querySelector('canvas');
const chartContext = chart.getContext('2d');
const center = chart.width / 2;
const segments = [
  { share: 60, color: '#084e50' },
  { share: 24, color: '#5b9b92' },
  { share: 16, color: '#a7c6b1' },
];

let start = -Math.PI / 2;
for (const segment of segments) {
  const end = start + segment.share / 100 * Math.PI * 2;
  chartContext.beginPath();
  chartContext.arc(center, center, center * .85, start + .006, end - .006);
  chartContext.strokeStyle = segment.color;
  chartContext.lineWidth = center * .3;
  chartContext.stroke();
  start = end;
}

const teams = [
  { name: 'Product', spend: [18420, 7200, 4360], previous: [17220, 6900, 3860], usage: [128, 144, 23000], budget: 32000, owner: 'Product Operations' },
  { name: 'Engineering', spend: [15780, 6400, 5120], previous: [16410, 6200, 4520], usage: [172, 128, 31700], budget: 30000, owner: 'Engineering Operations' },
  { name: 'Operations', spend: [6930, 3100, 2090], previous: [6180, 3000, 1720], usage: [61, 62, 14600], budget: 13000, owner: 'Business Operations' },
  { name: 'Finance', spend: [3170, 1500, 740], previous: [2870, 1400, 710], usage: [27, 30, 4200], budget: 6000, owner: 'Finance Operations' },
  { name: 'Shared services', spend: [8000, 3200, 1410], previous: [7500, 2900, 2300], usage: [54, 64, 12400], budget: 15000, owner: 'IT Operations' },
];
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const quantity = new Intl.NumberFormat('en-US');
const period = document.querySelector('#period');
const viewButtons = document.querySelectorAll('[data-view]');
const heading = document.querySelector('#table-title');
const table = document.querySelector('table');
let view = 'spend';

function spendBar(amounts) {
  return '<div class="spend-bar" aria-hidden="true">' +
    amounts.map(amount => '<span style="width:' + (amount / 320) + '%"></span>').join('') +
    '</div>';
}

const views = {
  spend: {
    title: 'Spend by Team',
    columns: ['Team', '', 'Models', 'Licenses', 'Agents', 'Total'],
    cells: (team, amounts, total) => [spendBar(amounts), ...amounts.map(value => money.format(value)), money.format(total)],
  },
  usage: {
    title: 'Usage by Team',
    columns: ['Team', 'Model runs (k)', 'Seats in use', 'Agent runs'],
    cells: (team, amounts, total, previous) => team.usage.map(value => quantity.format(previous ? Math.round(value * .91) : value)),
  },
  budgets: {
    title: 'Team Budgets',
    columns: ['Team', 'Spend', 'Budget', 'Remaining'],
    cells: (team, amounts, total) => [money.format(total), money.format(team.budget), money.format(team.budget - total)],
  },
  teams: {
    title: 'Team Owners',
    columns: ['Team', 'Budget owner', 'Spend'],
    cells: (team, amounts, total) => [team.owner, money.format(total)],
  },
};

function renderDashboard() {
  const { title, columns, cells } = views[view];
  const previous = period.value === 'previous';
  heading.textContent = title;
  table.tHead.innerHTML = '<tr>' + columns.map(label => '<th scope="col">' + label + '</th>').join('') + '</tr>';
  table.tBodies[0].innerHTML = teams.map(team => {
    const amounts = previous ? team.previous : team.spend;
    const total = amounts.reduce((sum, value) => sum + value, 0);
    return '<tr><th scope="row">' + team.name + '</th>' +
      cells(team, amounts, total, previous).map(value => '<td>' + value + '</td>').join('') + '</tr>';
  }).join('');
}

for (const button of viewButtons) {
  button.addEventListener('click', () => {
    view = button.dataset.view;
    for (const candidate of viewButtons) {
      candidate.setAttribute('aria-pressed', String(candidate === button));
    }
    renderDashboard();
  });
}
period.addEventListener('change', renderDashboard);
renderDashboard();

const navLinks = [...document.querySelectorAll('.site-header nav a')];
function syncNavigation() {
  const current = navLinks.find(link => link.hash === location.hash) ?? navLinks[0];
  for (const link of navLinks) {
    link.classList.toggle('active', link === current);
    if (link === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
window.addEventListener('hashchange', syncNavigation);
syncNavigation();

const dialog = document.querySelector('#consultation');
const form = document.querySelector('#consult-form');
const status = form.querySelector('.form-status');
for (const button of document.querySelectorAll('[data-consult]')) {
  button.addEventListener('click', () => {
    status.textContent = '';
    dialog.showModal();
    form.elements.namedItem('name').focus();
  });
}
form.querySelector('.close').addEventListener('click', () => dialog.close());
form.addEventListener('submit', event => {
  event.preventDefault();
  const fields = new FormData(form);
  const draft = [
    'ABHEDIT AI cost optimization consultation',
    '',
    'Name: ' + fields.get('name'),
    'Work email: ' + fields.get('email'),
    'Company: ' + fields.get('company'),
    '',
    fields.get('message'),
  ].join('\n');

  const file = new Blob([draft], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(file);
  const download = document.createElement('a');
  download.href = url;
  download.download = 'abhedit-consultation-request.txt';
  download.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = 'Your request draft is ready to download. You can share it with your ABHEDIT contact.';
});
