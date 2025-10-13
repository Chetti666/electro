import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Cálculos eléctricos <span className="text-blue-500">precisos</span> y <span className="text-blue-500">eficientes</span>
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Herramienta profesional para técnicos e ingenieros eléctricos. Realiza cálculos de sección, caída de tensión, factor de potencia y más.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/calculadoras" className="btn btn-primary">
                  Ver calculadoras
                </Link>
                <Link href="/informes" className="btn btn-outline">
                  Generar Informe
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
            <div className="card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
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
            <div className="card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center mb-4">
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

            {/* Factor de Potencia */}
            <div className="card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Factor de Potencia</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Calcula la compensación necesaria para mejorar el factor de potencia.</p>
              <Link href="/calculadoras/factor-potencia" className="text-amber-500 hover:text-amber-600 font-medium inline-flex items-center">
                Ir a calculadora
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Cálculo Lumínico */}
            <div className="card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Cálculo Lumínico</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Diseña sistemas de iluminación eficientes con reportes detallados.</p>
              <Link href="/calculadoras/luminico" className="text-purple-500 hover:text-purple-600 font-medium inline-flex items-center">
                Ir a calculadora
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Malla de Tierra */}
            <div className="card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Malla de Tierra</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Diseña sistemas de puesta a tierra seguros y efectivos.</p>
              <Link href="/calculadoras/malla-tierra" className="text-green-500 hover:text-green-600 font-medium inline-flex items-center">
                Ir a calculadora
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Cálculo de Motores */}
            <div className="card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Cálculo de Motores</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Dimensiona protecciones y conductores para instalaciones con motores.</p>
              <Link href="/calculadoras/motores" className="text-red-500 hover:text-red-600 font-medium inline-flex items-center">
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
          <h2 className="text-3xl font-bold text-white mb-6">¿Listo para optimizar tus cálculos eléctricos?</h2>
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
