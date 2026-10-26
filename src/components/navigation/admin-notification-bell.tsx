"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  Ticket,
  Users,
  Video,
  Check,
  ChevronRight,
  ShoppingBag,
  CalendarPlus,
  HeartHandshake,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getAdminNotificationsAction,
  StudioNotificationItem,
} from "@/actions/notifications.actions";

export function AdminNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<StudioNotificationItem[]>([]);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch live notifications on mount
  useEffect(() => {
    startTransition(async () => {
      const res = await getAdminNotificationsAction();
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
      }
    });
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Refresh helper
  const handleRefresh = () => {
    startTransition(async () => {
      const res = await getAdminNotificationsAction();
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
      }
    });
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const getNotificationIcon = (type: StudioNotificationItem["type"]) => {
    switch (type) {
      case "congress":
        return <Ticket className="h-4 w-4 text-gold" />;
      case "coaching":
        return <CalendarPlus className="h-4 w-4 text-info" />;
      case "merch":
        return <ShoppingBag className="h-4 w-4 text-danger" />;
      case "grading":
        return <Video className="h-4 w-4 text-success" />;
      case "sentiment":
        return <HeartHandshake className="h-4 w-4 text-gold" />;
      case "question":
        return <HelpCircle className="h-4 w-4 text-info" />;
      case "ratio":
      default:
        return <Users className="h-4 w-4 text-gold" />;
    }
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        type="button"
        aria-label="Studio Owner Notifications"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        title="Studio Owner Alerts"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white shadow-xs animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border bg-card p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-accent-tangerine">
                Studio Alerts
              </span>
              {unreadCount > 0 && (
                <Badge className="bg-accent-tangerine text-stone-950 text-[10px] font-bold h-4 px-1.5">
                  {unreadCount} New
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isPending}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors p-1"
                title="Refresh alerts"
              >
                <RefreshCw className={`h-3 w-3 ${isPending ? "animate-spin" : ""}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Check className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                All caught up! No active studio alerts.
              </p>
            ) : (
              notifications.map((n) => {
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => {
                      markAsRead(n.id);
                      setIsOpen(false);
                    }}
                    className={`block rounded-xl border p-3 transition-colors ${
                      n.isRead
                        ? "bg-card border-border/60 opacity-75 hover:opacity-100"
                        : "bg-amber-500/[0.04] border-amber-500/30 hover:bg-amber-500/[0.08]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg bg-muted p-2 shrink-0">
                        {getNotificationIcon(n.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-foreground line-clamp-1">
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-muted-foreground">
                            {n.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {n.detail}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer Link */}
          <div className="pt-2 border-t flex items-center justify-between">
            <Link
              href="/admin/operations"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              Desk Operations Hub
              <ChevronRight className="h-3 w-3" />
            </Link>
            <Link
              href="/admin/analytics"
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              Analytics
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
