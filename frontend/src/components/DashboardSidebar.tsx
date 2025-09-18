import { useState, useEffect } from "react";
import { Calendar, ChevronDown, LogOut, Crown, Camera, DollarSign, Users, MapPin, Heart, Utensils, QrCode } from "lucide-react";
import { format, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { LogoutConfirmDialog } from "@/components/LogoutConfirmDialog";
import { useNavigate, useLocation } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";

interface DashboardSidebarProps {
  user?: { email?: string } | null;
  profile?: { full_name?: string } | null;
  isWeddingOrganizer?: boolean;
  onSignOut?: () => void;
  signingOut?: boolean;
}

const DashboardSidebar = ({
  user,
  profile: profileProp,
  isWeddingOrganizer,
  onSignOut,
  signingOut = false
}: DashboardSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [countdown, setCountdown] = useState<string>("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isUpdatingDate, setIsUpdatingDate] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use the profile hook to get wedding date and update function
  const { profile, weddingDate, updateWeddingDate } = useProfile();

  useEffect(() => {
    if (!weddingDate) return;

    const updateCountdown = () => {
      const now = new Date();
      // Set time to start of day for accurate day calculation
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const wedding = new Date(weddingDate.getFullYear(), weddingDate.getMonth(), weddingDate.getDate());
      
      const days = Math.ceil((wedding.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const hours = differenceInHours(weddingDate, now) % 24;
      const minutes = differenceInMinutes(weddingDate, now) % 60;

      if (days < 0) {
        setCountdown("Matrimonio celebrato! 💕");
      } else if (days === 0) {
        setCountdown("È oggi! 🎉");
      } else {
        setCountdown(`${days} giorni, ${hours}h, ${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [weddingDate]);

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return;
    
    console.log('Date selected from calendar:', {
      selectedDate: date,
      localeDateString: date.toLocaleDateString('it-IT'),
      dateOnly: new Date(date.getFullYear(), date.getMonth(), date.getDate())
    });
    
    setIsUpdatingDate(true);
    try {
      // Create a new date object with just the date part (no time)
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      await updateWeddingDate(dateOnly);
      setIsCalendarOpen(false);
      
      // Also update localStorage as fallback
      localStorage.setItem('weddingDate', dateOnly.toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error updating wedding date:', error);
    } finally {
      setIsUpdatingDate(false);
    }
  };

  const handleClearDate = async () => {
    setIsUpdatingDate(true);
    try {
      await updateWeddingDate(null);
      localStorage.removeItem('weddingDate');
    } catch (error) {
      console.error('Error clearing wedding date:', error);
    } finally {
      setIsUpdatingDate(false);
    }
  };

  const menuItems = [
    { icon: Users, label: "Invitati", href: "/dashboard", isActive: location.pathname === "/dashboard" },
    { icon: Utensils, label: "Tavoli", href: "/tavoli", isActive: location.pathname === "/tavoli" },
    { icon: Camera, label: "Fotografo", href: "/fotografo", isActive: location.pathname === "/fotografo" },
    { icon: DollarSign, label: "Finanza", href: "/finanza", isActive: location.pathname === "/finanza" },
    { icon: MapPin, label: "Location", href: "/location", isActive: location.pathname === "/location" },
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        {!collapsed && (
          <>
            {/* Wedding Date Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Heart className="w-4 h-4 text-primary" />
                {!collapsed && "Data Matrimonio"}
              </div>
              
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-left"
                    disabled={isUpdatingDate}
                  >
                    <Calendar className="w-4 h-4 text-primary" />
                    {isUpdatingDate ? (
                      "Salvando..."
                    ) : weddingDate ? (
                      format(weddingDate, "dd MMM yyyy", { locale: it })
                    ) : (
                      "Scegli data"
                    )}
                    {!collapsed && <ChevronDown className="w-4 h-4 ml-auto" />}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3">
                    <CalendarComponent
                      mode="single"
                      selected={weddingDate || undefined}
                      onSelect={handleDateSelect}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      initialFocus
                    />
                    {weddingDate && (
                      <div className="mt-3 pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearDate}
                          disabled={isUpdatingDate}
                          className="w-full text-destructive hover:text-destructive"
                        >
                          Rimuovi data
                        </Button>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Countdown */}
              {weddingDate && countdown && (
                <div className="p-3 bg-gradient-to-r from-primary/10 to-gold/10 rounded-lg border border-primary/20">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-primary-deep">
                      {countdown}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      al grande giorno
                    </div>
                  </div>
                </div>
              )}
            </div>

            <SidebarSeparator />
          </>
        )}
      </SidebarHeader>

      <SidebarContent>
        <div className="px-2">
          {!collapsed && (
            <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">
              Sezioni
            </div>
          )}
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton 
                  asChild
                  isActive={item.isActive}
                  className="w-full"
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10"
                    onClick={() => handleNavigation(item.href)}
                  >
                    <item.icon className="w-5 h-5" />
                    {!collapsed && <span>{item.label}</span>}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-2 space-y-3">
        {/* User Info */}
        {!collapsed && (
          <>
            {isWeddingOrganizer && (
              <Badge variant="secondary" className="w-full justify-center py-2 bg-gradient-to-r from-gold/20 to-primary/20 text-primary-deep border-primary/30">
                <Crown className="w-4 h-4 mr-2" />
                Wedding Organizer
              </Badge>
            )}
            
            {(profileProp?.full_name || user?.email) && (
              <div className="text-center text-xs text-muted-foreground">
                Ciao, {profileProp?.full_name || user?.email}
              </div>
            )}
          </>
        )}

        {/* Logout Button */}
        {onSignOut && (
          <LogoutConfirmDialog
            onSignOut={async () => {
              onSignOut();
            }}
            signingOut={signingOut}
            className="w-full justify-start gap-3"
            showConfirmation={true}
            collapsed={collapsed}
          />
        )}

      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};

export default DashboardSidebar;