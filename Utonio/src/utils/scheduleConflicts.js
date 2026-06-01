export function findScheduleConflicts(appointments, doctorId, weeklySchedule) {
  if (!appointments || !Array.isArray(appointments) || !weeklySchedule) return [];
  const today = new Date().toISOString().split('T')[0];
  const activeStatuses = new Set(['SCHEDULED', 'CONFIRMED']);

  return appointments
    .filter((a) =>
      a.doctorId === doctorId
      && a.date >= today
      && activeStatuses.has(a.status)
    )
    .map((a) => {
      const day = new Date(a.date + 'T00:00:00').getDay();
      const daySlots = weeklySchedule[day] || [];
      const slot = daySlots.find((s) => s.time === a.time);
      const stillAvailable = slot && slot.available;
      return stillAvailable ? null : { appointment: a, day, time: a.time, reason: slot ? 'marked unavailable' : 'no longer in schedule' };
    })
    .filter(Boolean);
}
