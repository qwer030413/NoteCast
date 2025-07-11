import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger  } from "@/components/ui/sidebar"; 
import { Separator } from "@/components/ui/separator"
import { useLocation } from "react-router-dom"
function getPageTitle(path: string) {
  const title = path
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" / ")

  return title || "Dashboard"
}
export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const pageTitle = getPageTitle(location.pathname)
  return (
    <SidebarProvider>
        <div className="w-full min-h-screen flex items-start justify-start">
        {/* <SidebarTrigger className="absolute top-4 left-4 z-50 md:hidden" /> */}
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger/>
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-lg font-semibold truncate">{pageTitle}</h1>
          </header>
          <main className="flex-1 transition-margin duration-200 p-5">
              {children}
          </main>
        </SidebarInset>
        </div>
    </SidebarProvider>
  );
}