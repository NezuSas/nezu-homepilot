import { AnimatedBackground } from "@/modules/core/components/AnimatedBackground";

export default function AuthRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      {children}
    </div>
  );
}
