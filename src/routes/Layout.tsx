import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <SidebarProvider>
            <div className="w-64 min-w-64 hidden md:block flex-shrink-0">
            </div>
            <AppSidebar />
            <main className="flex-1 overflow-y-auto w-full">
                <div className="p-4 md:hidden">
                    <SidebarTrigger />
                </div>
                <Outlet />
            </main>
        </SidebarProvider>
    );
};
