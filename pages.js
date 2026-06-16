import Head from 'next/head';
import Navbar from '../components/Navbar';
import BookingCalendar from '../components/BookingCalendar';

export default function Home() {
  const tarieven = [
    { privé: "Privéles", prijs: "€60", beschrijving: "1-op-1 intensieve training" },
    { privé: "Duo-les", prijs: "€35 p.p.", beschrijving: "Train samen met je padelpartner" },
    { privé: "Groepsles", prijs: "€20 p.p.", beschrijving: "Gezellig en leerzaam (4 personen)" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Head>
        <title>Julian Padel | Professionele Padeltraining</title>
      </Head>
      <Navbar />
      
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-b from-padelGreen/20 to-transparent">
        <h1 className="text-5xl font-black mb-4">Julian Padel</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Breng jouw padelspel naar een hoger niveau.</p>
        <a href="#boeken" className="bg-padelGreen text-black font-bold px-8 py-4 rounded-full shadow-lg hover:scale-105 transition">Boek Nu Een Les</a>
      </section>

      {/* Boekingssysteem */}
      <section id="boeken" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Plan je Les</h2>
        <BookingCalendar />
      </section>

      {/* Tarieven */}
      <section className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Tarieven</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {tarieven.map((t, i) => (
              <div key={i} className="bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-md border-t-4 border-padelGreen">
                <h3 className="text-2xl font-bold mb-2">{t.privé}</h3>
                <p className="text-4xl font-black text-padelGreen mb-4">{t.prijs}</p>
                <p className="text-gray-500 dark:text-gray-300">{t.beschrijving}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Info */}
      <footer className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 border-t border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-2xl font-bold mb-4">Contactgegevens</h3>
          <p>📞 Telefoon: +31 6 12345678</p>
          <p>📧 E-mail: info@julianpadel.nl</p>
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-4">Locatie</h3>
          <p>Padel Club Amsterdam / Utrecht</p>
        </div>
      </footer>
    </div>
  );
}