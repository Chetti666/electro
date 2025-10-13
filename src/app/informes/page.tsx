import InformeForm from "@/components/informes/InformeForm";

export default function InformesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Crear Nuevo Informe</h1>
      <div className="max-w-2xl mx-auto">
        <InformeForm />
      </div>
    </div>
  );
}
