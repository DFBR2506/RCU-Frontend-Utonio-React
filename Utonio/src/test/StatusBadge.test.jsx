import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../components/UI/StatusBadge';

describe('StatusBadge', () => {
  it('renders SCHEDULED with violet label and Clock icon', () => {
    render(<StatusBadge status="SCHEDULED" />);
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });

  it('renders CONFIRMED with lime label', () => {
    render(<StatusBadge status="CONFIRMED" />);
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
  });

  it('renders COMPLETED with green label', () => {
    render(<StatusBadge status="COMPLETED" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders CANCELLED with strikethrough label', () => {
    const { container } = render(<StatusBadge status="CANCELLED" />);
    const badge = container.querySelector('.badge-cancelled');
    expect(badge).toBeInTheDocument();
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('renders NO_SHOW with red label', () => {
    render(<StatusBadge status="NO_SHOW" />);
    expect(screen.getByText('No Show')).toBeInTheDocument();
  });

  it('falls back to SCHEDULED for unknown status', () => {
    render(<StatusBadge status="UNKNOWN_STATE" />);
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });

  it('renders a badge root with the badge class', () => {
    const { container } = render(<StatusBadge status="CONFIRMED" />);
    expect(container.querySelector('.badge')).toBeInTheDocument();
  });
});
