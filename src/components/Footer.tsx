import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">ElectroCalc</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Herramienta de cálculos eléctricos para profesionales y técnicos.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/calculadoras" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                  Calculadoras
                </Link>
              </li>
              <li>
                <Link href="/reportes" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                  Reportes
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Calculadoras</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/calculadoras/seccion" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                  Cálculo de Sección
                </Link>
              </li>
              <li>
                <Link href="/calculadoras/caida-tension" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                  Caída de Tensión
                </Link>
              </li>
              <li>
                <Link href="/calculadoras/seccion-ric" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                  Conductores
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; {currentYear} ElectroCalc. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}