import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { getOfficeOccupancy, getDoctorProductivity, getNoShowPatients } from '../api/reportsApi';
import ErrorBoundary from '../components/UI/ErrorBoundary';
import './Reports.css';

const TABS = [
  { id: 'occupancy', label: 'Office Occupancy', Icon: TrendingUp },
  { id: 'productivity', label: 'Doctor Productivity', Icon: Users },
  { id: 'no-shows', label: 'No-Show Patients', Icon: AlertTriangle },
];

const today = new Date();
const pad = (n) => String(n).padStart(2, '0');
const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromDate = fmtDate(new Date(today.getFullYear(), today.getMonth(), 1));
const toDate = fmtDate(today);

function ReportsInner() {
  const [activeTab, setActiveTab] = useState('occupancy');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setLoading(true);
    });
    const loaders = {
      occupancy: () => getOfficeOccupancy(fromDate, toDate),
      productivity: () => getDoctorProductivity(),
      'no-shows': () => getNoShowPatients(fromDate, toDate),
    };
    loaders[activeTab]().then(d => {
      if (cancelled) return;
      setData(Array.isArray(d) ? d : []);
      setLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setData([]);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [activeTab]);

  return (
    <div className="app-layout fade-in">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Operational insights and analytics for the health center.</p>
      </div>

      <div className="reports-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`reports-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.Icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="reports-content card">
        {loading ? (
          <div className="skeleton" style={{ height: '320px' }} />
        ) : activeTab === 'occupancy' ? (
          <OccupancyChart data={data} />
        ) : activeTab === 'productivity' ? (
          <ProductivityChart data={data} />
        ) : (
          <NoShowTable data={data} />
        )}
      </div>
    </div>
  );
}

function OccupancyChart({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="chart-empty">
        <h3 className="chart-title">Office Occupancy Rate</h3>
        <p className="chart-subtitle">No occupancy data available yet.</p>
      </div>
    );
  }
  return (
    <div>
      <h3 className="chart-title">Office Occupancy Rate</h3>
      <p className="chart-subtitle">Percentage of available slots booked per office</p>
      <div style={{ width: '100%', height: 320, marginTop: 24 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <XAxis dataKey="code" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
            <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text-primary)',
              }}
              cursor={{ fill: 'var(--accent-violet-dim)' }}
            />
            <Bar dataKey="totalAppointments" radius={[8, 8, 0, 0]}>
              {(data ?? []).map((entry, i) => (
                <Cell key={i} fill="var(--accent-violet)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ProductivityChart({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="chart-empty">
        <h3 className="chart-title">Completed Appointments per Doctor</h3>
        <p className="chart-subtitle">No completed appointments yet.</p>
      </div>
    );
  }
  return (
    <div>
      <h3 className="chart-title">Completed Appointments per Doctor</h3>
      <p className="chart-subtitle">Total completed appointments ranked by doctor</p>
      <div style={{ width: '100%', height: 320, marginTop: 24 }}>
        <ResponsiveContainer>
          <BarChart data={data.map(d => ({ ...d, doctorName: `${d.firstName} ${d.lastName}` }))} layout="vertical" margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
            <XAxis type="number" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
            <YAxis type="category" dataKey="doctorName" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={140} />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text-primary)',
              }}
              cursor={{ fill: 'var(--accent-lime-dim)' }}
            />
            <Bar dataKey="completedAppointments" radius={[0, 8, 8, 0]}>
              {(data ?? []).map((entry, i) => (
                <Cell key={i} fill="var(--accent-lime)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function NoShowTable({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="chart-empty">
        <h3 className="chart-title">No-Show Patients</h3>
        <p className="chart-subtitle">No patients with no-shows recorded. Great work!</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="chart-title">Patients with No-Show History</h3>
      <p className="chart-subtitle">Highlighted in red: patients with 3+ no-shows</p>
      <div className="table-wrapper" style={{ marginTop: 24 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Document</th>
              <th>No-Show Count</th>
              <th>Last No-Show</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row, i) => (
              <tr key={i} style={row.noShowCount >= 3 ? { background: 'var(--accent-red-dim)' } : {}}>
                <td style={{ color: row.noShowCount >= 3 ? 'var(--accent-red)' : 'var(--text-primary)', fontWeight: row.noShowCount >= 3 ? 600 : 500 }}>
                  {`${row.firstName || ''} ${row.lastName || ''}`.trim()}
                </td>
                <td>—</td>
                <td>
                  <span className={`badge ${row.noShowCount >= 3 ? 'badge-no_show' : 'badge-scheduled'}`}>
                    {row.noShowCount}
                  </span>
                </td>
                <td>—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Reports() {
  return (
    <ErrorBoundary>
      <ReportsInner />
    </ErrorBoundary>
  );
}