// Every section from the old WordPress nav, rebuilt as either:
//  - "log":    real data entry, backed by the `entries` Supabase table
//  - "static": a reference/guide page (content left for you to fill in)

export const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { slug: '', title: 'Dashboard', type: 'dashboard' },
      { slug: 'about', title: 'About Brandon\u2019s Care', type: 'static' },
      { slug: 'todays-schedule', title: '\u200bToday\u2019s Schedule', type: 'log' },
      { slug: 'history', title: 'History', type: 'history' },
    ],
  },
  {
    label: 'Daily Care',
    items: [
      { slug: 'daily-checklist-form', title: 'Daily Checklist Form', type: 'log' },
      { slug: 'weekend-daily-checklist', title: 'Weekend Daily Checklist', type: 'log' },
      { slug: 'caretaker-daily-summary', title: 'Caretaker Daily Summary', type: 'log' },
      { slug: 'daily-mood-check', title: 'Daily Mood Check', type: 'log' },
      { slug: 'caregiver-notes-logs', title: 'Caregiver Notes / Logs', type: 'log' },
    ],
  },
  {
    label: 'Medical',
    items: [
      { slug: 'medications', title: 'Medication', type: 'log' },
      { slug: 'feeding-guide', title: 'PEG Feeding Guide (Gravity)', type: 'static' },
      { slug: 'peg-tube-care', title: 'PEG Tube Care', type: 'static' },
      { slug: 'check-gastric-residual-volume', title: 'Check Gastric Residual Volume', type: 'static' },
      { slug: 'incontinence-skin-care', title: 'Incontinence & Skin Care', type: 'static' },
      { slug: 'therapy', title: 'Therapy', type: 'log' },
    ],
  },
  {
    label: 'Supplies & Schedule',
    items: [
      { slug: 'supplies-inventory', title: 'Supplies & Inventory', type: 'log' },
      { slug: 'supplies-order-list', title: 'Supplies Order List', type: 'log' },
      { slug: 'calendar-appointments', title: 'Calendar & Appointments', type: 'log' },
    ],
  },
];

// Field schema per "log" section. Drives the add-entry form + table columns.
// Field types: text | textarea | number | date | datetime-local | select
export const LOG_FIELDS = {
  'todays-schedule': [
    { key: 'time', label: 'Time', type: 'text', placeholder: 'e.g. 8:00 AM' },
    { key: 'item', label: 'Item', type: 'text', placeholder: 'What\u2019s happening' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
  'daily-checklist-form': [
    { key: 'task', label: 'Task', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: ['Done', 'Skipped', 'Not yet'] },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
  'weekend-daily-checklist': [
    { key: 'task', label: 'Task', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: ['Done', 'Skipped', 'Not yet'] },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
  'caretaker-daily-summary': [
    { key: 'summary', label: 'Summary', type: 'textarea', placeholder: 'How the day went overall' },
  ],
  'daily-mood-check': [
    { key: 'mood', label: 'Mood', type: 'select', options: ['Great', 'Good', 'Okay', 'Low', 'Difficult'] },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
  'caregiver-notes-logs': [
    { key: 'note', label: 'Note', type: 'textarea' },
  ],
  medications: [
    { key: 'medication', label: 'Medication', type: 'text' },
    { key: 'dose', label: 'Dose', type: 'text', placeholder: 'e.g. 5mg' },
    { key: 'given_at', label: 'Given at', type: 'datetime-local' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
  therapy: [
    { key: 'session_type', label: 'Session type', type: 'text' },
    { key: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g. 30 min' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
  'supplies-inventory': [
    { key: 'item', label: 'Item', type: 'text' },
    { key: 'quantity', label: 'Quantity on hand', type: 'number' },
    { key: 'threshold', label: 'Low-stock threshold', type: 'number' },
  ],
  'supplies-order-list': [
    { key: 'item', label: 'Item', type: 'text' },
    { key: 'quantity', label: 'Quantity to order', type: 'number' },
    { key: 'status', label: 'Status', type: 'select', options: ['Needed', 'Ordered', 'Received'] },
  ],
  'calendar-appointments': [
    { key: 'title', label: 'Appointment', type: 'text' },
    { key: 'when', label: 'Date & time', type: 'datetime-local' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
};

// Placeholder copy for static/guide pages — replace with the real
// content from your current site (these are intentionally left blank
// rather than guessed, since it's care-instruction content).
export const STATIC_CONTENT = {
  about: {
    intro: 'A short introduction to Brandon and this care dashboard goes here.',
  },
  'feeding-guide': {
    intro: 'Step-by-step PEG (gravity) feeding instructions go here.',
  },
  'peg-tube-care': {
    intro: 'PEG tube site care and maintenance instructions go here.',
  },
  'check-gastric-residual-volume': {
    intro: 'Instructions for checking gastric residual volume go here.',
  },
  'incontinence-skin-care': {
    intro: 'Incontinence and skin care routine and product notes go here.',
  },
};

export function findSection(slug) {
  for (const group of NAV_GROUPS) {
    const item = group.items.find((i) => i.slug === slug);
    if (item) return item;
  }
  return null;
}
