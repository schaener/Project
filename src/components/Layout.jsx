import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authThunks.js';
import { selectUser } from '../features/auth/authSlice.js';
import { Avatar, Spinner, Toasts } from './ui.jsx';

const NAV = [
  { to: '/', icon: '📊', label: 'Dashboard', end: true },
  { to: '/transactions', icon: '💸', label: 'Transaksi' },
  { to: '/search', icon: '🔎', label: 'Cari' },
  { to: '/reports', icon: '📄', label: 'Laporan' },
  { to: '/split', icon: '🧾', label: 'Split Bill' },
  { to: '/chat', icon: '💬', label: 'Chat' },
  { to: '/feed', icon: '🌐', label: 'Feed' },
];

export default function Layout() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-logo">Rp</span>
          <span>Catatan Keuangan</span>
        </div>
        <nav>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className="nav-link">
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <Avatar name={user.displayName} src={user.photoURL} size={34} />
          <div className="sidebar-user-info">
            <strong>{user.displayName}</strong>
            <small className="muted">{user.email}</small>
          </div>
          <button className="icon-btn" title="Keluar" onClick={() => dispatch(logout())}>
            🚪
          </button>
        </div>
      </aside>
      <main className="content">
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>
      <Toasts />
    </div>
  );
}
