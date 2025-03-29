import { AdminLayout } from "@/components/admin/admin-layout";
import { UserManager } from "@/components/admin/user-manager";

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <UserManager />
    </AdminLayout>
  );
}