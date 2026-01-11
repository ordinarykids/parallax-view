import Link from "next/link";

const experiments = [
  {
    id: 1,
    title: "Product Viewer",
    description:
      "3D product display with perspective grid. Move your head to rotate and explore the object in space.",
    href: "/experiment-1",
    color: "from-amber-500 to-orange-600",
    features: [
      "3D cube rotation",
      "Perspective grid room",
      "Gaze tracking indicator",
    ],
  },
  {
    id: 2,
    title: "Face Sketch",
    description:
      "Real-time face landmark detection rendered as a minimalist line drawing that responds to your movement.",
    href: "/experiment-2",
    color: "from-violet-500 to-purple-600",
    features: [
      "Live face mesh",
      "Line art rendering",
      "Perspective transformation",
    ],
  },
  {
    id: 3,
    title: "Depth Field",
    description:
      "Ambient floating orbs and particles with multi-layer parallax. A meditative exploration of depth.",
    href: "/experiment-3",
    color: "from-cyan-500 to-blue-600",
    features: ["Multi-layer parallax", "Gradient orbs", "Particle field"],
  },
  {
    id: 4,
    title: "Spring Physics",
    description:
      "Card stack with spring-based physics. Each card responds with different stiffness and damping for natural motion.",
    href: "/experiment-4",
    color: "from-indigo-500 to-violet-600",
    features: ["Spring dynamics", "Stacked cards", "3D rotation"],
  },
  {
    id: 5,
    title: "Kinetic Cards",
    description:
      "Floating emoji cards scattered across the screen. Bouncy physics make them feel alive and playful.",
    href: "/experiment-5",
    color: "from-fuchsia-500 to-pink-600",
    features: ["Bounce physics", "Hover interactions", "Depth layers"],
  },
  {
    id: 6,
    title: "3D Carousel",
    description:
      "Rotating card carousel with momentum. Head movement controls rotation with natural inertia.",
    href: "/experiment-6",
    color: "from-emerald-500 to-teal-600",
    features: ["Momentum rotation", "3D perspective", "Active indicators"],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-neutral-950 to-cyan-950/30" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <div className="mb-4 font-mono text-sm tracking-wider text-white/40">
            PARALLAX VIEW EXPERIMENTS
          </div>
          <h1 className="text-5xl font-light tracking-tight md:text-7xl">
            Face-Tracking
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Parallax
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">
            Exploring depth perception through webcam-based face and gaze
            tracking. Each experiment demonstrates different approaches to
            creating immersive parallax effects using head movement.
          </p>

          <div className="mt-8 flex items-center gap-4 text-sm text-white/40">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Webcam required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Best in good lighting</span>
            </div>
          </div>
        </div>
      </div>

      {/* Experiments grid */}
      <div className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-light text-white/70">All Experiments</h2>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/50">
            {experiments.length} experiments
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {experiments.map((experiment) => (
            <Link
              key={experiment.id}
              href={experiment.href}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:scale-[1.02] hover:border-white/20 hover:bg-white/10"
            >
              {/* Gradient accent */}
              <div
                className={`absolute -right-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br ${experiment.color} opacity-20 blur-3xl transition-opacity group-hover:opacity-40`}
              />

              <div className="relative">
                {/* Experiment number */}
                <div className="mb-3 font-mono text-xs text-white/30">
                  EXPERIMENT {experiment.id.toString().padStart(2, "0")}
                </div>

                {/* Title */}
                <h2 className="mb-2 text-xl font-medium tracking-tight">
                  {experiment.title}
                </h2>

                {/* Description */}
                <p className="mb-4 text-sm leading-relaxed text-white/50">
                  {experiment.description}
                </p>

                {/* Features */}
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {experiment.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/60"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 text-sm font-medium text-white/80 transition-colors group-hover:text-white">
                  <span>Launch</span>
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-6">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between text-sm text-white/30">
            <div className="font-mono">parallax-view</div>
            <div>Built with Framer Motion + MediaPipe</div>
          </div>
        </div>
      </div>
    </div>
  );
}
