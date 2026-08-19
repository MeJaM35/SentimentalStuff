import DashboardUI from "@/components/DashboardUI";

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white">CX Intelligence Dashboard</h1>
        </header>
        <DashboardUI />
      </div>
    </main>
  );
}
