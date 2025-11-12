import PropertyCard from "./PropertyCard.jsx";

export default function App() {
  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <div className="neural-grid">
        <PropertyCard
          title="Luxury Villa Dubai"
          price="299"
          img="villa.jpg"
        />
      </div>
    </div>
  );
}
