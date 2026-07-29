import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function DashboardPage() {
  const { logout } = useAuth();
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function handleLogout() {
    setLogoutError(null);

    try {
      await logout();
    } catch {
      setLogoutError("Unable to log out. Please try again.");
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <button onClick={handleLogout} className="bg-gray-200 rounded px-4 py-2 cursor-pointer hover:bg-gray-300">
          Log out
        </button>
      </div>
      {logoutError ? (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <span>{logoutError}</span>
          <button type="button" onClick={handleLogout} className="underline cursor-pointer">
            Retry
          </button>
        </div>
      ) : null}
      <p>Logged in.</p>
    </div>
  );
}