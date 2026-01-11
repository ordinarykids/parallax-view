import { ParallaxScene } from "@/components/ParallaxScene";

export default function Experiment1() {
  return (
    <>
      <ParallaxScene />
      {/* Route label */}
      <div className="absolute right-4 top-4 font-mono text-sm text-white/50">
        /experiment-1
      </div>
    </>
  );
}
