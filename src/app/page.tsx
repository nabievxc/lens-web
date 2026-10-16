import { RentalRoom } from "@/components/room/RentalRoom";

export default function Home() {
  return (
    <>
      <RentalRoom />
      <noscript>
        <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", background: "#040f0f", color: "#e7d7c1", padding: 24, textAlign: "center" }}>
          <p>
            The rental shop is a 3D space and needs JavaScript and WebGL. You can still{" "}
            <a href="/lenses" style={{ textDecoration: "underline" }}>
              browse every lens as a list
            </a>
            .
          </p>
        </div>
      </noscript>
    </>
  );
}
