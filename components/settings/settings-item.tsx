import { ChevronRight, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface Props {
  icon: LucideIcon;
  label: string;
  value?: string;
  action?: ReactNode;
  onClick?: () => void;
}

export function SettingsItem({ icon: Icon, label, value, action, onClick }: Props) {
  const row = (
    <>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0f0f2]">
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <div className="text-[15px] font-medium">{label}</div>
      </div>
      {action ? action : value ? <div className="text-[14px] text-app-muted">{value}</div> : null}
      {!action && <ChevronRight size={18} className="text-app-muted" />}
    </>
  );

  if (action) {
    return <div className="flex w-full items-center gap-3 py-4 text-left">{row}</div>;
  }

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 py-4 text-left"
      type="button"
      disabled={!onClick && !action}
    >
      {row}
    </button>
  );
}
