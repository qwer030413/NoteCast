import { AppSidebar, navItems} from "@/components/sidebar/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger  } from "@/components/ui/sidebar"; 
import { Separator } from "@/components/ui/separator"
import { useLocation } from "react-router-dom"
import { Outlet } from "react-router-dom";
function getActivePage(path: string) {
  return navItems.find((item) => item.url === path);
}
function getPageTitle(path: string) {
  const title = path
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" / ")

  return title || "Dashboard"
}
export default function Layout() {
  const location = useLocation()
  const activePage = getActivePage(location.pathname)
  const pageTitle = activePage?.title || location.pathname.split("/").pop() || "Dashboard";
  const PageIcon = activePage?.icon;
  return (
    <SidebarProvider>
        {/* <div className="w-full min-h-screen flex items-start justify-start"> */}
        <div className="w-full min-h-screen flex">
        {/* <SidebarTrigger className="absolute top-4 left-4 z-50 md:hidden" /> */}
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger/>
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="flex items-center gap-2">
                {PageIcon && <PageIcon className="size-5 text-muted-foreground" />}
                <h1 className="text-lg font-semibold truncate">{pageTitle}</h1>
              </div>
          </header>
          <main className="flex h-full transition-margin duration-200 p-5 overflow-x-hidden overflow-y-hidden">
              <Outlet />
          </main>
        </SidebarInset>
        </div>
    </SidebarProvider>
  );
}