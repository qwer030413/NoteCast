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
import { useEffect, useState } from "react"
import { getCurrentUser, fetchUserAttributes, signOut  } from '@aws-amplify/auth'
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";


export function AppSidebar() {
  const navigate = useNavigate()
  const [data, setData] = useState<{ name: string, email: string }>({ name: "", email: "" })
  useEffect(() => {
    getCurrentUser()
      .then(async (user) => {
        console.log("User:", user.username)

        setData((prev) => ({
          ...prev,
          name: user.username,
        }))

        const attributes = await fetchUserAttributes()
        console.log("Attributes:", attributes)

        setData((prev) => ({
          ...prev,
          email: attributes.email ?? "",
        }))
      })
      .catch(() => console.log("Not signed in"))
  }, [])

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
        navigate('/Login')
    }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/" className="gap-3">
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
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data} signout = {handleSignOut} />
      </SidebarFooter>
    </Sidebar>
  )
}