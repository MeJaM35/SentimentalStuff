import DashboardUI from "@/components/DashboardUI";

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-4 md:p-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 flex items-center justify-between border-b border-brand-text/10 pb-6">
          <h1 className="text-3xl font-serif text-brand-text">Insights Workspace</h1>
        </header>
        <DashboardUI />
      </div>
    </main>
  );
}
