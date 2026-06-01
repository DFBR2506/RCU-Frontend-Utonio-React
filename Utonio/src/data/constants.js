export const SPECIALTIES = [
  { id: 'general', name: 'General Medicine', color: '#7B6EF6' },
  { id: 'psychology', name: 'Psychology', color: '#C8F55A' },
  { id: 'physiotherapy', name: 'Physiotherapy', color: '#00BCD4' },
  { id: 'nutrition', name: 'Nutrition', color: '#3DD68C' },
];

export const APPOINTMENT_TYPES = [
  { id: 'initial', name: 'Initial Consultation', duration: 60 },
  { id: 'followup', name: 'Follow-up', duration: 30 },
  { id: 'evaluation', name: 'Evaluation', duration: 45 },
  { id: 'emergency', name: 'Emergency', duration: 15 },
];

export const OFFICES = [
  { id: 1, name: 'Consultorio A', floor: '1st Floor', capacity: 1 },
  { id: 2, name: 'Consultorio B', floor: '1st Floor', capacity: 1 },
  { id: 3, name: 'Consultorio C', floor: '2nd Floor', capacity: 1 },
];

export const APPOINTMENT_STATUSES = [
  { id: 'ALL', label: 'All' },
  { id: 'SCHEDULED', label: 'Scheduled' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'CANCELLED', label: 'Cancelled' },
  { id: 'NO_SHOW', label: 'No Show' },
];

export const ACTIVE_STATUSES = new Set(['SCHEDULED', 'CONFIRMED']);

export const HOUR_BLOCKS = [8, 9, 10, 11, 14, 15, 16];

export const FULL_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

export const TIME_SLOTS = (() => {
  const slots = [];
  for (const h of HOUR_BLOCKS) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    if (h !== 11 && h !== 16) {
      slots.push(`${String(h).padStart(2, '0')}:30`);
    }
  }
  return slots;
})();
