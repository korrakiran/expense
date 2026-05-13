interface AppLogoProps {
  size?: number;
  rounded?: number;
  className?: string;
}

export function AppLogo({ size = 160, rounded = 36, className = '' }: AppLogoProps) {
  return (
    <div
      className={`relative overflow-hidden bg-white shadow-[0_12px_30px_rgba(0,0,0,0.15)] ${className}`}
      style={{ width: size, height: size, borderRadius: rounded }}
    >
      <img
        src="/logo.png"
        alt="Logo"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
