"use client";

const IS_DEV = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

export default function DevBanner() {
  if (!IS_DEV) return null;

  return (
    <div style={{
      background: '#FEF3C7',
      borderBottom: '2px solid #F59E0B',
      padding: '6px 16px',
      fontSize: 12,
      color: '#92400E',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'var(--font-mono)',
      zIndex: 9999,
    }}>
      <span style={{ fontWeight: 700 }}>⚠ DEV MODE</span>
      <span>—</span>
      <span>Razorpay: mock (confirm dialog) · Email: console.log · Redis: in-memory</span>
      <span style={{ marginLeft: 'auto', opacity: 0.7 }}>bloodexchange.in</span>
    </div>
  );
}
