import { Dancing_Script } from "next/font/google";

const dancingScript = Dancing_Script({ subsets: ['latin'] });

export default function Tagline() {
  return (
    <h2 className={`${dancingScript.className} text-3xl text-gray-700 text-center`}>
      Beautiful educational videos on any topic
    </h2>
  );
}
