import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/backend/lib/auth-context";
import { useUsers, useUpdateUserRole, useDeleteUser } from "@/frontend/hooks/use-users";
import { Shield, ShieldAlert, ShieldCheck, UserMinus, UserPlus, Search, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/frontend/components/ui/button";

export const Route = createFileRoute("/_authenticated/users")({
  component: UserManagementPage,
});

function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading } = useUsers();
  const updateUserRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRole = async (userId: string, role: string, hasRole: boolean) => {
    try {
      await updateUserRole.mutateAsync({
        userId,
        role,
        action: hasRole ? 'remove' : 'add'
      });
      toast.success(`Role ${hasRole ? 'removed' : 'added'} successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await deleteUser.mutateAsync(userId);
      toast.success("User deleted successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="section-title">User Management</h1>
          <p className="section-subtitle">Manage roles and permissions for school staff and students.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="form-input pl-10 h-11"
        />
      </div>

      <div className="admin-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Info</th>
                  <th>Roles</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const isAdmin = u.roles.includes('admin');
                  const isInstructor = u.roles.includes('instructor');
                  const isStudent = u.roles.includes('student');

                  return (
                    <tr key={u.id} className={isSelf ? "bg-slate-50" : ""}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                            {u.fullName?.[0] || u.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              {u.fullName || "Unnamed User"}
                              {isSelf && <span className="badge badge-blue text-[10px]">You</span>}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="size-3" /> {u.email}
                            </div>
                            {u.phone && (
                              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <Phone className="size-3" /> {u.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          <button 
                            onClick={() => !isSelf && toggleRole(u.id, 'admin', isAdmin)}
                            disabled={isSelf}
                            className={`badge flex items-center gap-1 transition-all ${isAdmin ? 'badge-red' : 'badge-gray opacity-40 hover:opacity-100'}`}
                          >
                            <ShieldAlert className="size-3" /> Admin
                          </button>
                          <button 
                            onClick={() => toggleRole(u.id, 'instructor', isInstructor)}
                            className={`badge flex items-center gap-1 transition-all ${isInstructor ? 'badge-blue' : 'badge-gray opacity-40 hover:opacity-100'}`}
                          >
                            <ShieldCheck className="size-3" /> Instructor
                          </button>
                          <button 
                            onClick={() => toggleRole(u.id, 'student', isStudent)}
                            className={`badge flex items-center gap-1 transition-all ${isStudent ? 'badge-green' : 'badge-gray opacity-40 hover:opacity-100'}`}
                          >
                            <Shield className="size-3" /> Student
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {!isSelf && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(u.id)}
                              className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <UserMinus className="size-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
