// src/components/VideoSection.tsx
'use client';

import VideoWindow from './VideoWindow';

export default function Intro() {

    return (

        <div className="h-full w-full items-center overflow-y-auto max-h-screen scrollbar-hide">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <section className="flex flex-col lg:flex-row w-full gap-8 px-4 lg:px-8 py-24 h-full items-center">
                    <div className="w-full flex flex-col lg:flex-row gap-8">
                        <VideoWindow title={'Trial Video Test'}
                            poster={'/empty_img.png'}
                            src={'https://res.cloudinary.com/din1gp1kc/video/upload/v1717846177/samples/cld-sample-video.mp4'}
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}
