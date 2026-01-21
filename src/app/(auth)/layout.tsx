export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#050507]">
      {children}
    </div>
  );
}
