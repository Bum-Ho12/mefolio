import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/site';

// Default share image for every route. A route can override it with its own
// opengraph-image file or openGraph.images (journeys use their cover).
export const alt = `${SITE_NAME} — Software Engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '0 96px',
                    background: 'black',
                    color: 'white',
                }}
            >
                <div style={{ fontSize: 88, fontWeight: 700 }}>{SITE_NAME}</div>
                <div style={{ fontSize: 40, marginTop: 24, color: '#a3a3a3' }}>
                    Mobile & full-stack software engineer
                </div>
                <div style={{ fontSize: 28, marginTop: 48, color: '#737373' }}>
                    Flutter · React · Kotlin Multiplatform · Node.js
                </div>
            </div>
        ),
        size,
    );
}
