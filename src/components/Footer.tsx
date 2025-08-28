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
                <a href="/" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                  Inicio
                </a>
              </li>
              <li>
                <a href="/calculadoras" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                  Calculadoras
                </a>
              </li>
              <li>
                <a href="/reportes" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                  Reportes
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Calculadoras</h3>
            <ul className="space-y-2">
              <li>
                <a href="/calculadoras/seccion" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                  Cálculo de Sección
                </a>
              </li>
              <li>
                <a href="/calculadoras/caida-tension" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                  Caída de Tensión
                </a>
              </li>
              <li>
                <a href="/calculadoras/factor-potencia" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                  Factor de Potencia
                </a>
              </li>
              <li>
                <a href="/calculadoras/luminico" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                  Cálculo Lumínico
                </a>
              </li>
              <li>
                <a href="/calculadoras/malla-tierra" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                  Malla de Tierra
                </a>
              </li>
              <li>
                <a href="/calculadoras/motores" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                  Cálculo de Motores
                </a>
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
