import { DashboardLayout } from "@/modules/dashboard/components/DashboardLayout";
import { DataProvider } from "@/modules/core/providers/DataProvider";
import { ThemeProvider } from "@/modules/core/providers/ThemeProvider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      <ThemeProvider>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </ThemeProvider>
    </DataProvider>
  );
}
