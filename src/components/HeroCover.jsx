import React from 'react';
import Spline from '@splinetool/react-spline';

export default function HeroCover() {
  return (
    <section className="relative h-[70vh] w-full overflow-hidden" aria-label="Hero">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/zhZFnwyOYLgqlLWk/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Soft gradient overlay for readable text without blocking interaction */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/70 via-white/40 to-white/70" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-semibold text-gray-900 sm:text-5xl md:text-6xl">
          Design Together in Your Browser
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
          A minimalist, real‑time editor for vector graphics and UI layouts. Smooth, fast, and collaborative — inspired by the tools you love.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <a
            href="#editor"
            className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black/30"
          >
            Start Designing
          </a>
          <a
            href="#about"
            className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}
