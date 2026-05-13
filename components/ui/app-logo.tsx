interface AppLogoProps {
  size?: number;
  rounded?: number;
  className?: string;
}

export function AppLogo({ size = 160, rounded = 36, className = '' }: AppLogoProps) {
  return (
    <div
      className={`relative bg-[#f5f5f6] shadow-[0_24px_60px_rgba(0,0,0,0.28)] ${className}`}
      style={{ width: size, height: size, borderRadius: rounded }}
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{ width: size * 0.64, height: size * 0.64, transform: 'translate(-50%, -50%)' }}
      >
        <div
          className="absolute inset-0 rounded-full bg-[#111]"
          style={{ transform: 'translateX(12%)', filter: 'blur(0.3px)' }}
        />
        <div
          className="absolute inset-[9%] flex items-center justify-center rounded-full bg-[#efefef] text-[#2f2f31]"
          style={{ boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.9), inset 0 -8px 12px rgba(0,0,0,0.22)' }}
        >
          <span
            className="font-semibold"
            style={{ fontSize: size * 0.29, lineHeight: 1, textShadow: '0 1px 0 rgba(255,255,255,0.6)' }}
          >
            ₹
          </span>
        </div>
      </div>
    </div>
  );
}
