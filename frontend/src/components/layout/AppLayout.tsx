import { Spacer } from "@/components/shared/Spacer"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <section className="z-10 h-full bg-amber-300 p-4">
        <h1 className="font-bold">In Aviv we trust</h1>
        <Spacer className="h-6" />
        This is the sidebar
      </section>
      <main className="grow">
        <nav className="bg-amber-200 p-4 text-center">
          This is the top nav bar
        </nav>
        <section>{children}</section>
      </main>
    </div>
  )
}
