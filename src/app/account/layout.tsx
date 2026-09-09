import { Header } from "@/components/Header";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { requireAccount } from "@/lib/account";
import { isAdminEmail } from "@/lib/admin";

export default async function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { displayName, user } = await requireAccount();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-sand-50 pt-[72px]">
        <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
          <DashboardSidebar
            displayName={displayName}
            email={user.email}
            isAdmin={isAdminEmail(user.email)}
          />
          <div className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</div>
        </div>
      </div>
    </>
  );
}
