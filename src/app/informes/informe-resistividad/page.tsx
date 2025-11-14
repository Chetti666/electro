import SevReport from './SevReport';

export default function InformePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Sondeo Eléctrico Vertical (SEV) - Schlumberger
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Herramienta para registrar mediciones de campo, visualizar la curva de resistividad aparente y generar un informe completo.
        </p>
      </div>
      <SevReport />
    </div>
  );
}