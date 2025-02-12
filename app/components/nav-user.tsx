import { AvatarIcon } from "@radix-ui/react-icons";
import { ChevronsUpDownIcon, LogOutIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { SidebarMenuButton } from "~/components/ui/sidebar";
import { useUser } from "~/lib/user";

export function NavUser() {
  const user = useUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
          <div className="bg-sidebar-accent text-sidebar-accent-foreground flex aspect-square size-6 items-center justify-center rounded-md">
            <AvatarIcon className="size-4" aria-hidden />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.email}</span>
          </div>
          <ChevronsUpDownIcon className="ml-auto size-4" aria-hidden />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side="right"
        align="end"
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="px-1 py-1.5 text-left text-sm leading-tight">
            <div className="truncate text-xs">Signed in as</div>
            <div className="truncate font-semibold">{user.email}</div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOutIcon aria-hidden />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
