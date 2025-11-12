export default function PropertyCard({ title, price, img }) {
  return (
    <div className="quantum-card">
      <img
        src={`/static/images/properties/${img}`}
        alt={title}
        style={{ width: "100%", height: "220px", objectFit: "cover" }}
      />

      <div style={{ padding: "16px" }}>
        <h3 style={{ fontSize: "1.2rem", marginBottom: "4px" }}>{title}</h3>
        <p className="text-xl font-bold">${price}/night</p>

        <button
          className="neural-btn mt-2 w-full"
          onClick={() => (window.location = "/payments/checkout.html")}
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
