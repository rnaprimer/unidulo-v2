"use client";

// The intro video with our own play and pause button instead of the browser's
// controls, so there is no dark shading over the bottom of the picture.
// Before this code runs (or if JavaScript is off) the page shows the
// browser's normal controls, so the video can always be played.
import { useRef, useState, useSyncExternalStore } from "react";

// True in the browser, false while the page is built on the server.
const noSubscribe = () => () => {};
const useInBrowser = () => useSyncExternalStore(noSubscribe, () => true, () => false);

export function IntroVideoPlayer({ src, poster }: { src: string; poster: string }) {
  const video = useRef<HTMLVideoElement>(null);
  // In the browser our own button takes over from the browser's controls.
  const ready = useInBrowser();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  return (
    <div className="group relative overflow-hidden rounded-[3px] border border-hair bg-band">
      <video
        ref={video}
        controls={!ready}
        playsInline
        preload="metadata"
        poster={poster}
        width={1920}
        height={1080}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          setProgress(v.duration ? v.currentTime / v.duration : 0);
        }}
        className="block aspect-video h-auto w-full"
      >
        <source src={src} type="video/mp4" />
      </video>

      {ready && (
        <>
          {/* One button over the whole picture: click anywhere to play or pause. */}
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause video" : "Play video"}
            className="absolute inset-0 flex cursor-pointer items-center justify-center focus-visible:outline-offset-[-4px]"
          >
            <span
              aria-hidden="true"
              className={`flex size-16 items-center justify-center rounded-full bg-charcoal text-lime shadow-md transition-opacity motion-reduce:transition-none ${
                playing ? "opacity-0 group-hover:opacity-100 [:focus-visible>&]:opacity-100" : "opacity-100"
              }`}
            >
              {playing ? (
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" className="ml-1">
                  <path d="M7 4.5v15l12.5-7.5z" />
                </svg>
              )}
            </span>
          </button>

          {/* A thin line along the bottom showing how far through the video it is. */}
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-charcoal/10">
            <span className="block h-full bg-charcoal" style={{ width: `${progress * 100}%` }} />
          </span>
        </>
      )}
    </div>
  );
}
