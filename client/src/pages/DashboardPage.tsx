import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotes, useDeleteNote } from "../hooks/useNotes";
import { ConfirmDialog } from "../components/ConfirmDialog";

export function DashboardPage() {
  const { logout } = useAuth();
  const { data: notes, isLoading, isError } = useNotes();
  const deleteNote = useDeleteNote();

  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function handleLogout() {
    setLogoutError(null);

    try {
      await logout();
    } catch {
      setLogoutError("Unable to log out. Please try again.");
    }
  }

  function stripHtml(html: string) {
    const el = document.createElement("div");
    el.innerHTML = html;
    return el.textContent || "";
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Notes</h1>

        <div className="flex gap-2">
          <Link
            to="/notes/new"
            className="bg-blue-600 text-white rounded px-4 py-2 cursor-pointer hover:bg-blue-700"
          >
            New note
          </Link>

          <button
            onClick={handleLogout}
            className="bg-gray-200 rounded px-4 py-2 cursor-pointer hover:bg-gray-300"
          >
            Log out
          </button>
        </div>
      </div>

      {logoutError && (
        <div className="flex items-center gap-2 text-sm text-red-600 mb-4">
          <span>{logoutError}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading && <p>Loading...</p>}
      {isError && <p className="text-red-600">Failed to load notes.</p>}

      {notes && notes.length === 0 && (
        <p className="text-gray-500">
          No notes yet. Create your first note.
        </p>
      )}

      {deleteError && (
        <p className="text-sm text-red-600 mb-4">
          {deleteError}
        </p>
      )}

      <ul className="space-y-2">
        {notes?.map((note) => (
          <li
            key={note._id}
            className="border rounded p-4 flex justify-between items-start"
          >
            <Link to={`/notes/${note._id}`} className="flex-1">
              <h2 className="font-medium">{note.title}</h2>
              <p className="text-gray-500 text-sm truncate">
                {stripHtml(note.content)}
              </p>
            </Link>

            <button
              onClick={() => {
                setDeleteError(null);
                setPendingDeleteId(note._id);
              }}
              className="text-red-600 text-sm ml-4 cursor-pointer hover:text-red-800"
            >
              Delete
            </button>
          </li>
        ))}

      </ul>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        message="Delete this note? This cannot be undone."
        onConfirm={() => {
          if (pendingDeleteId) {
            deleteNote.mutate(pendingDeleteId, {
              onSuccess: () => {
                setPendingDeleteId(null);
              },
              onError: () => {
                setDeleteError("Couldn't delete note. Please try again.");
              },
            });
          }
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}