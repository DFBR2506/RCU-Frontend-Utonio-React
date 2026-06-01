import { describe, it, expect, beforeEach } from 'vitest';
import { mockApi } from '../services/mockData';

describe('mockApi.patients', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('list returns an array of patients', async () => {
    const list = await mockApi.patients.list();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

  it('create adds a patient and returns it with an id and ACTIVE status', async () => {
    const before = (await mockApi.patients.list()).length;
    const created = await mockApi.patients.create({
      firstName: 'Test',
      lastName: 'User',
      email: 't@u.edu',
      phone: '+1-555-0000',
      birthDate: '2000-01-01',
      studentId: 'STU-0000',
    });
    expect(created.id).toBeDefined();
    expect(created.status).toBe('ACTIVE');
    const after = (await mockApi.patients.list()).length;
    expect(after).toBe(before + 1);
  });

  it('update mutates an existing patient and returns the updated record', async () => {
    const list = await mockApi.patients.list();
    const target = list[0];
    const updated = await mockApi.patients.update(target.id, { firstName: 'Renamed' });
    expect(updated.id).toBe(target.id);
    expect(updated.firstName).toBe('Renamed');
    const fresh = await mockApi.patients.list();
    expect(fresh.find(p => p.id === target.id).firstName).toBe('Renamed');
  });

  it('update rejects when the patient is not found', async () => {
    await expect(mockApi.patients.update(99999, { firstName: 'x' })).rejects.toThrow(/not found/);
  });
});

describe('mockApi.appointments', () => {
  it('list returns appointments', async () => {
    const list = await mockApi.appointments.list();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

  it('create assigns SCHEDULED status and an id', async () => {
    const before = (await mockApi.appointments.list()).length;
    const created = await mockApi.appointments.create({
      patientId: 1,
      doctorId: 1,
      officeId: 1,
      typeId: 'followup',
      date: '2099-01-01',
      time: '10:00',
      duration: 30,
    });
    expect(created.id).toBeDefined();
    expect(created.status).toBe('SCHEDULED');
    const after = (await mockApi.appointments.list()).length;
    expect(after).toBe(before + 1);
  });

  it('update changes appointment status', async () => {
    const list = await mockApi.appointments.list();
    const target = list.find(a => a.status !== 'COMPLETED');
    const updated = await mockApi.appointments.update(target.id, { status: 'CANCELLED' });
    expect(updated.status).toBe('CANCELLED');
  });
});

describe('mockApi.availability', () => {
  it('returns the doctor’s day-of-week slots minus already-booked times', async () => {
    const slots = await mockApi.availability.get(1, '2099-06-02');
    expect(Array.isArray(slots)).toBe(true);
    const bookedTimes = new Set();
    const appts = await mockApi.appointments.list();
    for (const a of appts) {
      if (a.doctorId === 1 && a.date === '2099-06-02') bookedTimes.add(a.time);
    }
    for (const s of slots) {
      if (bookedTimes.has(s.time)) expect(s.available).toBe(false);
    }
  });

  it('respects the doctor’s weekly schedule', async () => {
    const futureDate = '2099-06-03';
    const appts = await mockApi.appointments.list();
    const doctor1Appts = appts.filter(a => a.doctorId === 1 && a.date === futureDate);
    const slots = await mockApi.availability.get(1, futureDate);
    const schedule = (await mockApi.doctors.getSchedule(1)).weeklySchedule;
    const dayOfWeek = new Date(futureDate + 'T00:00:00').getDay();
    const daySlots = schedule[dayOfWeek] || [];
    expect(slots.length).toBe(daySlots.length);
    const bookedTimes = new Set(doctor1Appts.map(a => a.time));
    for (const s of slots) {
      const expectedAvailable = !!s.available && !bookedTimes.has(s.time);
      expect(s.available).toBe(expectedAvailable);
    }
  });
});
