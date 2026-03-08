import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="text-center px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-500 mx-auto mb-6">
          <Shield size={32} />
        </div>
        <h1 className="text-4xl font-bold text-zinc-100 mb-2">404</h1>
        <p className="text-zinc-400 mb-6">Página no encontrada</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft size={14} />
          Volver al mapa
        </Link>
      </div>
    </div>
  );
}
