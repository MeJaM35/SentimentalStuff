import DashboardUI from "@/components/DashboardUI";
import Header from "@/components/Header";

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-4 md:p-12">
      <div className="mx-auto max-w-6xl">
        <Header />
        <DashboardUI />
      </div>
    </main>
  );
}
