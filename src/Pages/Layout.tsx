import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarProvider, SidebarTrigger  } from "@/components/ui/sidebar"; 

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
        <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 p-4">
            <SidebarTrigger />
            {children}
        </main>
        </div>
    </SidebarProvider>
  );
}