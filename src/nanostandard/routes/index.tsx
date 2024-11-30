import Home from "../islands/Home.tsx";

export default function IndexApp() {
  if (Deno.env.get("BUILD_STEP") === "true") {
    return <div></div>
  }
  return (
    <div>
        <Home />
    </div>
  );
}
