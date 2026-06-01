import { useEffect } from 'react';
import { X } from 'lucide-react';
import './SlideOver.css';

export default function SlideOver({ isOpen, onClose, title, children, width = 480, loading = false, skeleton = 'form' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="slideover-overlay" onClick={onClose}>
      <div
        className="slideover-panel"
        style={{ width: `${width}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="slideover-header">
          <h2 className="slideover-title">{title}</h2>
          <button className="slideover-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="slideover-content">
          {loading ? (
            <div className="slideover-skeleton" aria-busy="true" aria-live="polite">
              {skeleton === 'form' ? (
                <>
                  <div className="skeleton" style={{ height: '52px', marginBottom: '16px' }} />
                  <div className="skeleton" style={{ height: '52px', marginBottom: '16px' }} />
                  <div className="skeleton" style={{ height: '52px', marginBottom: '16px' }} />
                  <div className="skeleton" style={{ height: '52px', marginBottom: '16px' }} />
                  <div className="skeleton" style={{ height: '52px', marginBottom: '24px' }} />
                  <div className="skeleton" style={{ height: '44px', width: '60%' }} />
                </>
              ) : skeleton === 'detail' ? (
                <>
                  <div className="skeleton" style={{ height: '24px', width: '60%', marginBottom: '12px' }} />
                  <div className="skeleton" style={{ height: '14px', width: '40%', marginBottom: '24px' }} />
                  <div className="skeleton" style={{ height: '80px', marginBottom: '16px' }} />
                  <div className="skeleton" style={{ height: '80px', marginBottom: '16px' }} />
                  <div className="skeleton" style={{ height: '44px', width: '40%' }} />
                </>
              ) : (
                <div className="skeleton" style={{ height: '200px' }} />
              )}
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}