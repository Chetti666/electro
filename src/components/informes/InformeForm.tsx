export default function InformeForm() {
  return (
    <form className="space-y-6">
      <div>
        <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nombre del Proyecto
        </label>
        <input
          type="text"
          id="project-name"
          name="project-name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div>
        <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Autor
        </label>
        <input
          type="text"
          id="author"
          name="author"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary"
      >
        Generar Informe
      </button>
    </form>
  );
}
