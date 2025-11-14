import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Cálculos eléctricos <span className="text-blue-500">precisos</span> y <span className="text-blue-500">eficientes</span>
              </h1>
              <p className="text-md sm:text-lg text-gray-700 dark:text-gray-300 mb-8">
                Herramienta profesional para técnicos e ingenieros eléctricos. Realiza cálculos de sección, caída de tensión, factor de potencia y más.
              </p>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                <Link href="/calculadoras" className="btn btn-primary">
                  Ver herramientas
                </Link>
                <Link href="/about" className="btn btn-outline">
                  Conocer más
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                <div className="absolute inset-0 bg-blue-500 bg-opacity-10 dark:bg-blue-900 dark:bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-32 h-32 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Calculadoras disponibles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Cálculo de Sección */}
            <div className="card hover:shadow-lg transition-shadow text-center sm:text-left">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 mx-auto sm:mx-0">
                <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Cálculo de Sección</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Determina la sección adecuada de conductores según la corriente y caída de tensión.</p>
              <Link href="/calculadoras/seccion" className="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center">
                Ir a calculadora
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Caída de Tensión */}
            <div className="card hover:shadow-lg transition-shadow text-center sm:text-left">
              <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center mb-4 mx-auto sm:mx-0">
                <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Caída de Tensión</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Calcula la caída de tensión en circuitos eléctricos según distancia y carga.</p>
              <Link href="/calculadoras/caida-tension" className="text-emerald-500 hover:text-emerald-600 font-medium inline-flex items-center">
                Ir a calculadora
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Corriente admisible */}
            <div className="card hover:shadow-lg transition-shadow text-center sm:text-left">
              <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-4 mx-auto sm:mx-0">
                <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">corriente admisible de conductores</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Determina la corriente admisible de conductores según la norma RIC</p>
              <Link href="/calculadoras/seccion-ric" className="text-amber-500 hover:text-amber-600 font-medium inline-flex items-center">
                Ir a calculadora
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

           


           
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-500 dark:bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">¿Listo para optimizar tus cálculos eléctricos?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            ElectroCalc te ofrece herramientas precisas para tus proyectos eléctricos. Comienza a utilizarlas ahora.
          </p>
          <Link href="/calculadoras" className="btn bg-white text-blue-500 hover:bg-blue-50 font-medium px-6 py-3">
            Comenzar ahora
          </Link>
        </div>
      </section>
    </>
  );
}