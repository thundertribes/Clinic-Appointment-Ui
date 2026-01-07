"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HelpCircle, LogOut, MessageCircle, Settings, User } from "lucide-react";
import { NotificationDropdown } from "./notification-dropdown";
import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function UserNav() {
const { user } = useAuth();
const { logout } = useAuth();
const router = useRouter();

const handleLogout = () => {
    logout(); // Call the logout function
    router.push('/auth/login'); // Redirect the user to the login page
};
  return (
    <div className="flex items-center gap-4">
      <ThemeToggle />
      <NotificationDropdown />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            {user && (
                <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="{user.name}" />
                <AvatarFallback>{user.username.replace(/^Dr\.\s*/, '').split(' ')
                    .map((n) => n[0]).slice(0, 2).join('')}
                </AvatarFallback>
                </Avatar>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
            {user && (
                <p className="text-sm font-medium leading-none">{user.username}</p>
            )}
            {user && (
                <p className="text-xs leading-none text-muted-foreground">{user.username}</p>
            )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Link href="/profile" className="flex items-center gap-2">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/chat" className="flex items-center gap-2">
                <MessageCircle className="mr-2 h-4 w-4" />
                <span>Chat</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/support" className="flex items-center gap-2">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Support</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout }>
            {/*<Link href="/auth/login" className="flex items-center gap-2">*/}
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
          {/*  </Link>*/}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
