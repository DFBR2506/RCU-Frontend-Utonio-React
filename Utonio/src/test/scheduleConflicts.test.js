import { describe, it, expect } from 'vitest';
import { findScheduleConflicts } from '../utils/scheduleConflicts';

const futureDate = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

function makeWeeklySchedule(overrides = {}) {
  return {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
    ...overrides,
  };
}

function makeAppt(doctorId, date, time, status = 'SCHEDULED') {
  return { id: Math.random(), doctorId, date, time, status };
}

describe('findScheduleConflicts', () => {
  it('returns an empty array when the schedule fully covers appointments (clean)', () => {
    const apptDate = futureDate(2);
    const dow = new Date(apptDate + 'T00:00:00').getDay();
    const schedule = makeWeeklySchedule({ [dow]: [{ time: '10:00', available: true }] });
    const appts = [makeAppt(1, apptDate, '10:00', 'SCHEDULED')];
    expect(findScheduleConflicts(appts, 1, schedule)).toEqual([]);
  });

  it('flags an appointment outside the new schedule (partial overlap)', () => {
    const apptDate = futureDate(3);
    const dow = new Date(apptDate + 'T00:00:00').getDay();
    const schedule = makeWeeklySchedule({ [dow]: [{ time: '14:00', available: true }] });
    const appts = [
      makeAppt(1, apptDate, '10:00', 'SCHEDULED'),
      makeAppt(1, apptDate, '14:00', 'CONFIRMED'),
    ];
    const conflicts = findScheduleConflicts(appts, 1, schedule);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].time).toBe('10:00');
    expect(conflicts[0].reason).toBe('no longer in schedule');
  });

  it('flags all appointments when the entire day is removed (fully removed day)', () => {
    const apptDate = futureDate(4);
    const dow = new Date(apptDate + 'T00:00:00').getDay();
    const schedule = makeWeeklySchedule({ [dow]: [] });
    const appts = [
      makeAppt(1, apptDate, '09:00', 'SCHEDULED'),
      makeAppt(1, apptDate, '10:00', 'CONFIRMED'),
      makeAppt(1, apptDate, '11:00', 'SCHEDULED'),
    ];
    const conflicts = findScheduleConflicts(appts, 1, schedule);
    expect(conflicts).toHaveLength(3);
    for (const c of conflicts) expect(c.reason).toBe('no longer in schedule');
  });

  it('flags slots that exist but are marked unavailable as "marked unavailable"', () => {
    const apptDate = futureDate(5);
    const dow = new Date(apptDate + 'T00:00:00').getDay();
    const schedule = makeWeeklySchedule({ [dow]: [{ time: '10:00', available: false }] });
    const appts = [makeAppt(1, apptDate, '10:00', 'CONFIRMED')];
    const conflicts = findScheduleConflicts(appts, 1, schedule);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].reason).toBe('marked unavailable');
  });

  it('ignores past appointments even if outside the schedule', () => {
    const pastDate = futureDate(-7);
    const dow = new Date(pastDate + 'T00:00:00').getDay();
    const schedule = makeWeeklySchedule({ [dow]: [] });
    const appts = [makeAppt(1, pastDate, '10:00', 'SCHEDULED')];
    expect(findScheduleConflicts(appts, 1, schedule)).toEqual([]);
  });

  it('ignores COMPLETED / CANCELLED / NO_SHOW appointments', () => {
    const apptDate = futureDate(2);
    const dow = new Date(apptDate + 'T00:00:00').getDay();
    const schedule = makeWeeklySchedule({ [dow]: [] });
    const appts = [
      makeAppt(1, apptDate, '10:00', 'COMPLETED'),
      makeAppt(1, apptDate, '10:00', 'CANCELLED'),
      makeAppt(1, apptDate, '10:00', 'NO_SHOW'),
    ];
    expect(findScheduleConflicts(appts, 1, schedule)).toEqual([]);
  });

  it('only flags appointments for the given doctor', () => {
    const apptDate = futureDate(2);
    const dow = new Date(apptDate + 'T00:00:00').getDay();
    const schedule = makeWeeklySchedule({ [dow]: [] });
    const appts = [
      makeAppt(1, apptDate, '10:00', 'SCHEDULED'),
      makeAppt(2, apptDate, '10:00', 'SCHEDULED'),
    ];
    const conflicts = findScheduleConflicts(appts, 1, schedule);
    expect(conflicts).toHaveLength(1);
  });

  it('returns [] for empty or invalid inputs', () => {
    expect(findScheduleConflicts(null, 1, {})).toEqual([]);
    expect(findScheduleConflicts([], 1, null)).toEqual([]);
    expect(findScheduleConflicts(undefined, 1, undefined)).toEqual([]);
  });
});
