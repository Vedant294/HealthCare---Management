import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { useApp } from '@/context/AppContext';
import { Bell, CalendarDays, Package, ShieldAlert, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const iconMap = { appointment: CalendarDays, resource: Package, crisis: ShieldAlert, service: FileText };

const Notifications = () => {
  const { notifications, setNotifications } = useApp();

  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Notifications" subtitle="Stay updated with hospital alerts" />
        <Button variant="outline" size="sm" onClick={markAllRead}><Check className="w-4 h-4 mr-1" /> Mark All Read</Button>
      </div>

      <div className="space-y-2">
        {notifications.map(n => {
          const Icon = iconMap[n.type] || Bell;
          return (
            <div key={n.id} className={cn(
              "bg-card rounded-xl border border-border p-4 card-shadow flex items-start gap-3 transition-colors",
              !n.read && "border-l-4 border-l-primary bg-primary/5"
            )}>
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.timestamp).toLocaleString()}</p>
              </div>
              {!n.read && (
                <Button variant="ghost" size="sm" onClick={() => markRead(n.id)} className="text-xs">Mark Read</Button>
              )}
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
