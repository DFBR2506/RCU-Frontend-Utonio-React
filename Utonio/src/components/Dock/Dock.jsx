import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { LayoutDashboard, Users, Stethoscope, CalendarCheck, Clock, BarChart2, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dock.css';

const NAV_ITEMS = [
  { path: '/',              label: 'Dashboard',     Icon: LayoutDashboard, bg: '#1A1A2E', tint: '#7B6EF6' },
  { path: '/patients',      label: 'Patients',      Icon: Users,           bg: '#1A2E1A', tint: '#3DD68C' },
  { path: '/doctors',       label: 'Doctors',       Icon: Stethoscope,     bg: '#1A2428', tint: '#00BCD4' },
  { path: '/appointments',  label: 'Appointments',  Icon: CalendarCheck,   bg: '#2E1A1A', tint: '#F25C5C' },
  { path: '/availability',  label: 'Availability',  Icon: Clock,           bg: '#2E2A1A', tint: '#C8F55A' },
  { path: '/reports',       label: 'Reports',       Icon: BarChart2,       bg: '#1A1A2E', tint: '#7B6EF6' },
  { path: '/settings',      label: 'Settings',      Icon: SettingsIcon,    bg: '#1E1E1E', tint: '#EEEEF0' },
];

const DESKTOP = { base: 52, max: 76 };
const MOBILE  = { base: 40, max: 52 };

function DockIcon({ item, dockMouseX, dockRef, sizes }) {
  const ref = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === item.path;

  const distance = useTransform(dockMouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect()
      ?? dockRef.current?.getBoundingClientRect()
      ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [sizes.base, sizes.max, sizes.base]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });
  const iconSize = Math.round(sizes.base * 0.54);

  return (
    <button
      ref={ref}
      className="dock-item"
      onClick={() => navigate(item.path)}
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
      type="button"
    >
      <motion.div
        className="dock-icon-wrap"
        style={{
          width,
          height: width,
          background: item.bg,
          boxShadow: isActive ? `0 0 16px ${item.tint}55` : '0 0 0px transparent',
        }}
      >
        <item.Icon size={iconSize} color={item.tint} strokeWidth={2} />
      </motion.div>
      {isActive && <span className="dock-dot" />}
      <span className="dock-tooltip">{item.label}</span>
    </button>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 600px)');
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

export default function Dock() {
  const dockRef = useRef(null);
  const mouseX = useMotionValue(0);
  const isMobile = useIsMobile();
  const sizes = isMobile ? MOBILE : DESKTOP;

  function handleMouseMove(e) {
    mouseX.set(e.clientX);
  }

  function handleMouseLeave() {
    mouseX.set(99999);
  }

  return (
    <div
      ref={dockRef}
      className="dock"
      onMouseMove={isMobile ? undefined : handleMouseMove}
      onMouseLeave={isMobile ? undefined : handleMouseLeave}
    >
      {NAV_ITEMS.map((item) => (
        <DockIcon
          key={item.path}
          item={item}
          dockMouseX={mouseX}
          dockRef={dockRef}
          sizes={sizes}
        />
      ))}
    </div>
  );
}
