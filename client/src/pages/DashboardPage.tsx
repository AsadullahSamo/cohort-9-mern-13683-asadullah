import { useAuth } from "../context/AuthContext";

export function DashboardPage() {
  const { logout } = useAuth();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <button onClick={logout} className="bg-gray-200 rounded px-4 py-2 cursor-pointer hover:bg-gray-300">
          Log out
        </button>
      </div>
      <p>Logged in.</p>
    </div>
  );
}