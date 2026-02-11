import type { Id } from "@convex/_generated/dataModel";
import EmployeeDetail from "@/components/modules/admin/employees/employee-detail";

interface PageProps {
  params: Promise<{
    employeeId: string;
  }>;
}

export default async function EmployeeDetailPage({ params }: PageProps) {
  const { employeeId } = await params;

  return <EmployeeDetail employeeId={employeeId as Id<"profiles">} />;
}
