import { useSignal } from "@preact/signals";
import Counter from "../islands/Counter.tsx";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1>Nano Standard</h1>
      <p>Nano is the most advanced form of money.</p>
    </div>
  );
}
