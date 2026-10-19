"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Ticket,
  Users,
  Video,
  Check,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NotificationItem {
  id: string;
  type: "congress" | "ratio" | "grading";
  title: string;
  detail: string;
  timestamp: string;
  href: string;
  isRead: boolean;
  priority: "high" | "medium" | "low";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "congress",
    title: "New Congress Pass Purchase",
    detail: "David Jenkins reserved a Full Congress Pass (£95.00) as Lead via Stripe.",
    timestamp: "12m ago",
    href: "/admin/events",
    isRead: false,
    priority: "high",
  },
  {
    id: "notif-2",
    type: "ratio",
    title: "Class Ratio Alert: Thursday Improver",
    detail: "14 Leads vs 8 Follows booked. Lead capacity nearing cap (88% filled).",
    timestamp: "45m ago",
    href: "/instructor/roster",
    isRead: false,
    priority: "medium",
  },
  {
    id: "notif-3",
    type: "grading",
    title: "Student Video Awaiting Review",
    detail: "Elena M. submitted 45s 'Guapea to Vacilala' for Level 2 (Improver) promotion.",
    timestamp: "2h ago",
    href: "/instructor/submissions",
    isRead: false,
    priority: "high",
  },
];

export function AdminNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const menuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
                <Badge className="bg-accent-tangerine text-zinc-950 text-[10px] font-bold h-4 px-1.5">
                  {unreadCount} New
                </Badge>
              )}
            </div>
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

          {/* Notifications List */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                All caught up! No active studio alerts.
              </p>
            ) : (
              notifications.map((n) => {
                const iconMap = {
                  congress: <Ticket className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
                  ratio: <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
                  grading: <Video className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
                };

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
                        {iconMap[n.type]}
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
          <div className="pt-2 border-t text-center">
            <Link
              href="/admin/analytics"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              Open Studio Analytics Dashboard
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
