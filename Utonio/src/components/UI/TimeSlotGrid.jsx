import './TimeSlotGrid.css';

export default function TimeSlotGrid({ slots, selected, onSelect, stagger = false, gridKey }) {
  if (!slots || slots.length === 0) {
    return (
      <div className="time-slot-empty">
        <p>No slots available for this date.</p>
      </div>
    );
  }

  return (
    <div className="time-slot-grid">
      {slots.map((slot, i) => {
        const isSelected = selected === slot.time;
        const isAvailable = slot.available;
        const animationDelay = stagger ? `${i * 35}ms` : '0ms';
        const classes = [
          'time-slot',
          stagger ? 'stagger' : '',
          isSelected ? 'selected' : '',
          !isAvailable ? 'unavailable' : '',
        ].filter(Boolean).join(' ');
        const key = gridKey ? `${gridKey}-${slot.time}` : slot.time;

        return (
          <button
            key={key}
            type="button"
            className={classes}
            onClick={() => isAvailable && onSelect && onSelect(slot.time)}
            disabled={!isAvailable}
            style={{ animationDelay }}
          >
            {slot.time}
          </button>
        );
      })}
    </div>
  );
}
