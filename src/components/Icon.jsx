import React from 'react';
const paths = {
  bike: <><circle cx="5.5" cy="17" r="4"/><circle cx="18.5" cy="17" r="4"/><path d="m5.5 17 4-8 5 8h-9m4-8h6.5m2.5 8-3-11H13M8 9H5"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>,
  chart: <><path d="M3 3v18h18M6 15l5-5 4 3 6-8"/></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
  reset: <><path d="M3 12a9 9 0 1 1 3 7m-3-7V5m0 7h7"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/></>,
};
export default function Icon({ name, size = 20, ...props }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>{paths[name]}</svg>;
}
