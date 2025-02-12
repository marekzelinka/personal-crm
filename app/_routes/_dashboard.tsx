import { AvatarIcon, ExitIcon } from "@radix-ui/react-icons";
import type { CSSProperties } from "react";
import { Outlet, useSubmit } from "react-router";
import { Logo } from "~/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "~/components/ui/sidebar";
import { useUser } from "~/lib/user";

export default function Component() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as CSSProperties
      }
    >
      <AppSidebar />
      <Outlet />
    </SidebarProvider>
  );
}

function AppSidebar() {
  return (
    <Sidebar
      collapsible="none"
      className="h-auto w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
    >
      <SidebarHeader className="pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <Logo className="size-8" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent></SidebarContent>
      <SidebarFooter className="pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <UserDropdown />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function UserDropdown() {
  const user = useUser();

  const submit = useSubmit();

  const logout = () => {
    submit(null, {
      method: "POST",
      action: "/logout",
      navigate: true,
      flushSync: true,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton className="justify-center [&>svg]:size-6">
          <AvatarIcon aria-hidden />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="end"
        sideOffset={4}
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="px-1 py-1.5 text-sm leading-tight">
            <span className="block truncate font-semibold">{`${user.first} ${user.last}`}</span>
            <span className="block truncate text-xs">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <ExitIcon aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
