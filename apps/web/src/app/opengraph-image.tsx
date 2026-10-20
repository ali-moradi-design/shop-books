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
      <div style={{ fontSize: 28, letterSpacing: 6, color: '#9bd0c0' }}>BOOKS</div>
      <div style={{ fontSize: 96, marginTop: 20, lineHeight: 1.05 }}>Bay Book Company</div>
      <div style={{ fontSize: 36, marginTop: 24, opacity: 0.85 }}>
        A bookshop for people who still browse.
      </div>
    </div>,
    size,
  );
}
