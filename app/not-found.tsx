import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4 text-center">
      <h2 className="text-2xl font-bold mb-2">Página no encontrada</h2>
      <p className="text-sm text-slate-400 mb-4">No se ha podido localizar el recurso solicitado.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-colors"
      >
        Volver al Panel Principal
      </Link>
    </div>
  );
}
