import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter
  
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import { signOut  } from '@aws-amplify/auth'
import { toast } from "sonner"
import { useNavigate, Link } from "react-router-dom";
import { 
  Home, 
  FileText, 
  Mic, 
  CircleDashed,
  Sparkles, 
  Settings 
} from "lucide-react";

export const navItems = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Notes", url: "/notes", icon: FileText },
  { title: "Podcasts", url: "/podcasts", icon: Mic },
  { title: "Summarize with AI", url: "/summarize", icon: Sparkles },
  { title: "Processing", url: "/processing", icon: CircleDashed },
  { title: "Settings", url: "/settings", icon: Settings },
];
export function AppSidebar() {
  const navigate = useNavigate()
  const handleSignOut = async () => {
        await signOut();
        toast(`Signed out!`,
            {
                icon: '✅',
                style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
                },
            }
        );
        navigate('/')
    }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/#/home" className="gap-3">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg">
                  <svg  xmlns="http://www.w3.org/2000/svg"  width="30"  height="30"  viewBox="0 0 24 24"  fill="none"  stroke="white"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-notes"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 3m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z" /><path d="M9 7l6 0" /><path d="M9 11l6 0" /><path d="M9 15l4 0" /></svg>
                </div>
                <div className="flex flex-col gap-1.5 leading-none">
                  <span className="font-medium">Note Cast</span>
                  <span className="">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup title="Navigation">
          <SidebarMenu>
            {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser signout = {handleSignOut} />
      </SidebarFooter>
    </Sidebar>
  )
}
