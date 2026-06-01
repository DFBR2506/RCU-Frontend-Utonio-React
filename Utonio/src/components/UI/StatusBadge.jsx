import { Clock, CheckCircle, CheckCheck, XCircle, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  SCHEDULED: { className: 'badge-scheduled', Icon: Clock, label: 'Scheduled' },
  CONFIRMED: { className: 'badge-confirmed', Icon: CheckCircle, label: 'Confirmed' },
  COMPLETED: { className: 'badge-completed', Icon: CheckCheck, label: 'Completed' },
  CANCELLED: { className: 'badge-cancelled', Icon: XCircle, label: 'Cancelled' },
  NO_SHOW: { className: 'badge-no_show', Icon: AlertCircle, label: 'No Show' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.SCHEDULED;
  return (
    <span className={`badge ${config.className}`}>
      <config.Icon size={12} strokeWidth={2.5} />
      {config.label}
    </span>
  );
}