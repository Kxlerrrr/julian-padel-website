import Navbar from '../components/Navbar';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function Dashboard() {
  const statistieken = { totaalBoekingen: 142, omzet: "€ 8.520", urenGeleverd: 110 };

  const exporteerPDF = () => {
    const doc = new jsPDF();
    doc.text("Julian Padel - Financieel & Boekingen Rapport", 14, 16);
    doc.autoTable({
      startY: 24,
      head: [['Metriek', 'Waarde']],
      body: [
        ['Totaal Aantal Boekingen', statistieken.totaalBoekingen],
        ['Totale Omzet', statistieken.omzet],
        ['Aantal Trainingsuren', statistieken.urenGeleverd],
      ],
    });
    doc.save('julian-padel-rapport.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black">Trainer Dashboard Analytics</h1>
          <button onClick={exporteerPDF} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Exporteer PDF Rapport
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h3 className="text-gray-500">Totaal Boekingen</h3>
            <p className="text-4xl font-bold">{statistieken.totaalBoekingen}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h3 className="text-gray-500">Totale Omzet</h3>
            <p className="text-4xl font-bold text-green-500">{statistieken.omzet}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h3 className="text-gray-500">Uren Gegeven</h3>
            <p className="text-4xl font-bold">{statistieken.urenGeleverd} uur</p>
          </div>
        </div>
      </div>
    </div>
  );
}