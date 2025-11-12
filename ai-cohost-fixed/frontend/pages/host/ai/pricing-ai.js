// pages/host/ai/pricing-ai.js
async function aiPricing() {
  const location = document.querySelector('input[name="location"]').value;
  const basePrice = document.querySelector('input[name="price"]').value;

  if (!location || !basePrice) {
    return alert("Please fill Location and Base Price first");
  }

  document.getElementById('ai-price-result').innerHTML = "AI is optimizing price...";

  try {
    const res = await fetch(`${API_URL}/api/ai-pricing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location, base_price: parseFloat(basePrice) })
    });
    const data = await res.json();
    document.querySelector('input[name="price"]').value = data.price;
    document.getElementById('ai-price-result').innerHTML = 
      `<strong class="text-green-400">AI Suggested Price: $${data.price}/night</strong>`;
  } catch (err) {
    document.getElementById('ai-price-result').innerHTML = 
      `<span class="text-red-400">AI unavailable. Using your price.</span>`;
  }
}