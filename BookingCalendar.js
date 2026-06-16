import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  const beschikbareSlots = ["09:00 - 10:00", "10:00 - 11:00", "14:00 - 15:00", "19:00 - 20:00"];

  const handleBoeking = async () => {
    if (!selectedDate || !selectedSlot) return alert('Kies eerst een datum en tijdstip.');

    const stripe = await stripePromise;
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: selectedDate, slot: selectedSlot }),
    });

    const session = await response.json();
    await stripe.redirectToCheckout({ sessionId: session.id });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md mx-auto">
      <label className="block mb-2 font-semibold">1. Kies een datum:</label>
      <input 
        type="date" 
        className="w-full p-3 rounded-lg border dark:bg-gray-700 mb-4"
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      <label className="block mb-2 font-semibold">2. Kies een tijdstip:</label>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {beschikbareSlots.map((slot) => (
          <button
            key={slot}
            onClick={() => setSelectedSlot(slot)}
            className={`p-3 rounded-lg border transition ${selectedSlot === slot ? 'bg-padelGreen text-black font-bold' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            {slot}
          </button>
        ))}
      </div>

      <button onClick={handleBoeking} className="w-full bg-padelGreen text-black font-bold py-4 rounded-xl hover:bg-opacity-90 transition">
        Afrekenen via Stripe
      </button>
    </div>
  );
}