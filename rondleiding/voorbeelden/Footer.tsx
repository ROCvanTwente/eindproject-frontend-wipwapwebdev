import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-roc-dark text-white mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <p className="font-canaro font-bold text-lg mb-1">
            <span className="text-roc-blue">roc </span>
            <span className="text-roc-red">van </span>
            <span className="text-roc-blue">twente</span>
          </p>
          <p className="text-gray-400 text-sm leading-relaxed mt-3">
            Nieuwsgierig, verbindend en inspirerend onderwijs voor iedereen in
            de regio Twente.
          </p>
        </div>

        <div>
          <p className="font-canaro font-bold text-xs uppercase tracking-widest text-gray-400 mb-4">
            rondleidingen
          </p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/tours" className="text-gray-300 hover:text-white no-underline">alle rondleidingen</Link></li>
            <li><Link to="/boeken" className="text-gray-300 hover:text-white no-underline">plan een bezoek</Link></li>
            <li><Link to="/admin" className="text-gray-300 hover:text-white no-underline">beheer</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-canaro font-bold text-xs uppercase tracking-widest text-gray-400 mb-4">
            contact
          </p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>Gieterij 200, Enschede</li>
            <li>tel: 053 487 11 11</li>
            <li>info@rocvantwente.nl</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700 px-6 py-4 max-w-6xl mx-auto flex justify-between text-xs text-gray-500">
        <span>© {new Date().getFullYear()} roc van twente</span>
        <span>privacybeleid · cookies</span>
      </div>
    </footer>
  );
}
