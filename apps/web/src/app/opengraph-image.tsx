import { ImageResponse } from 'next/og';

export const alt = 'Bay Book Company';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 80,
        background: '#174236',
        color: '#f5f1e8',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <svg width="72" height="72" viewBox="0 0 32 32">
          <path
            d="M16 9c-2.6-2-6.6-2.7-11-2v17c4.4-.7 8.4 0 11 2 2.6-2 6.6-2.7 11-2V7c-4.4-.7-8.4 0-11 2Z"
            fill="none"
            stroke="#f5f1e8"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M16 9v17" stroke="#f5f1e8" strokeWidth="1.6" />
          <path d="M20 7.6v7.6l1.75-1.4 1.75 1.4V7.3" fill="#ffc94d" />
        </svg>
        <div style={{ fontSize: 28, letterSpacing: 6, color: '#9bd0c0' }}>BOOKS</div>
      </div>
      <div style={{ fontSize: 96, marginTop: 20, lineHeight: 1.05 }}>Bay Book Company</div>
      <div style={{ fontSize: 36, marginTop: 24, opacity: 0.85 }}>
        A bookshop for people who still browse.
      </div>
    </div>,
    size,
  );
}
