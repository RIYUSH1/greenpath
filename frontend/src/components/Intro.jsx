import { useEffect } from "react";
import introVideo from "../assets/intro.mp4";

export default function Intro({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 4000); // match video duration

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-black z-50">
      <video
        src={introVideo}
        autoPlay
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
