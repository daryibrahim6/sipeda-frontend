import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 } as const;

export const OG_CONTENT_TYPE = 'image/png';

export async function renderOgImage(opts: {
  title: string;
  description?: string;
  badge?: string;
}): Promise<ImageResponse> {
  const { title, description, badge } = opts;
  const desc = description ?? 'Portal informasi donor darah Kabupaten Indramayu.';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #C62828 0%, #8E1B1B 100%)',
          color: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
          padding: '72px',
          position: 'relative',
        }}
      >
        {/* Top-right badge */}
        {badge ? (
          <div
            style={{
              position: 'absolute',
              top: 48,
              right: 72,
              display: 'flex',
              alignItems: 'center',
              padding: '10px 20px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.18)',
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            {badge}
          </div>
        ) : null}

        {/* Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: 2,
            opacity: 0.92,
            marginBottom: 8,
          }}
        >
          <span style={{ marginRight: 16, fontSize: 40 }}>●</span>
          SIPEDA
        </div>
        <div style={{ fontSize: 22, opacity: 0.85, marginBottom: 32 }}>
          PMI Kabupaten Indramayu
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.1,
            marginTop: 'auto',
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            lineHeight: 1.4,
            opacity: 0.92,
            marginTop: 24,
            maxWidth: 1000,
          }}
        >
          {desc}
        </div>

        {/* Footer URL */}
        <div
          style={{
            display: 'flex',
            marginTop: 'auto',
            fontSize: 22,
            opacity: 0.75,
            letterSpacing: 0.5,
          }}
        >
          sipeda.id
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
