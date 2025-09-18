import Card from '../../components/Card'; 
import { Search, SlidersHorizontal } from 'lucide-react';

const mockPolicies = [
  {
    id: 1,
    title: 'Kenaikan Gaji DPR',
    description: 'Setelah anggota DPR memiliki hak atas rumah dinas lagi, kini usulan kenaikan gaji dan tunjangan menjadi isu sentral. Kebijakan ini dinilai sangat tidak efektif dan membuang-buang anggaran.',
    category: 'Kebijakan',
    imageUrl: 'https://images.unsplash.com/photo-1621213328114-1e041359c19e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    votes: '14.000',
    date: '12 September 2025',
  },
  {
    id: 2,
    title: 'Label Nutrisi "Traffic-Light"',
    description: 'Terapkan label traffic-light pada makanan tinggi gula, garam, lemak untuk melindungi kesehatan publik dan memudahkan warga memilih makanan yang sehat.',
    category: 'Kebijakan',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c2cdb2323f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    votes: '14.000',
    date: '12 September 2025',
  },
  {
    id: 3,
    title: 'Ekspansi QRIS',
    description: 'Sistem pembayaran QRIS kini diusulkan untuk diperluas dengan ekspansi ke sektor informal, seperti pedagang kaki lima dan ojek online, untuk transaksi yang lebih efisien.',
    category: 'Kebijakan',
    imageUrl: 'https://images.unsplash.com/photo-1627443183863-1ec0fa8c8e14?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    votes: '14.000',
    date: '12 September 2025',
  },
];

const PolicyVotingFeature = () => {
  // TODO: Di sini nanti bisa ditambahkan logika fetching data dari Firebase, 

  return (
    <div className="space-y-12">
      <header className="bg-white rounded-xl shadow-lg p-6 md:px-10 md:py-14 relative overflow-hidden">
       <div className="absolute top-0 right-0 h-full w-[60%] z-0">
          <div 
             className="w-full h-full bg-center bg-cover bg-no-repeat" 
            style={{ backgroundImage: `url('/image policyvote.svg')` }}
          >          
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
            Voting Kebijakan
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Baca, pahami, lalu berikan suara Anda.
          </p>

          <div className="mt-6 flex flex-col md:flex-row gap-4 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Telusuri daftar kebijakan..."
                className="w-full border border-gray-300 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition duration-150"
              />
            </div>
            <button className="bg-primary text-white border border-white font-semibold py-2 px-6 rounded-xl flex items-center justify-center hover:bg-red-800 transition-colors">
              <SlidersHorizontal size={20} className="mr-2" />
              Filter
            </button>
          </div>
        </div>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2">
          Kebijakan Pemerintah
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockPolicies.map(policy => (
            <Card key={policy.id} {...policy} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2">
          Program Pemerintah
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockPolicies.map(policy => (
            <Card key={policy.id + '_program'} {...policy} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default PolicyVotingFeature;