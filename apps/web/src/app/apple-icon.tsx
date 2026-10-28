import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** Home-screen icon: the open-book mark on the brand green. */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#174236',
      }}
    >
      <svg width="132" height="132" viewBox="0 0 32 32">
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
    </div>,
    size,
  );
}
