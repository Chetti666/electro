import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-200 dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-blue-500 rounded-full flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">ElectroCalc</span>
        </Link>
        
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400">
            Inicio
          </Link>
          <Link href="/calculadoras" className="text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400">
            Calculadoras
          </Link>
          <Link href="/reportes" className="text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400">
            Reportes
          </Link>
          <Link href="/acerca" className="text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400">
            Acerca de
          </Link>
          <Link href="/login" className="text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400">
            Login
          </Link>
        </nav>
        
        <button className="md:hidden focus:outline-none">
          <svg
            className="w-6 h-6 text-gray-700 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
