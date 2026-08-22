import DOMPurify from "dompurify";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotes, useDeleteNote, useCreateNote } from "../hooks/useNotes";
import { getNotes as fetchAllNotes } from "../api/notes";
import { ConfirmDialog } from "../components/ConfirmDialog";


type ImportedNote = {
  title: string;
  content: string;
};

function isImportedNote(value: unknown): value is ImportedNote {
  if (typeof value !== "object" || value === null) return false;

  const note = value as Record<string, unknown>;

  return (
    typeof note.title === "string" &&
    note.title.length > 0 &&
    typeof note.content === "string" &&
    note.content.length > 0
  );
}

export function DashboardPage() {
  const { logout } = useAuth();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data: notes, isLoading, isError } = useNotes(debouncedSearch);
  const deleteNote = useDeleteNote();
  const createNote = useCreateNote();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  async function handleExport() {
    setExportError(null);

    try {
      const allNotes = await fetchAllNotes();
      const exportData = allNotes.map(({ title, content }) => ({ title, content }));
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "notes-export.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Couldn't export notes. Please try again.");
    }
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    let parsed: unknown;

    try {
      parsed = JSON.parse(await file.text());
    } catch {
      setImportSummary("Couldn't read that file — not valid JSON.");
      return;
    }

    if (!Array.isArray(parsed)) {
      setImportSummary("Import file must be a list of notes.");
      return;
    }

    let imported = 0;
    let skipped = 0;

    for (const item of parsed) {
      if (!isImportedNote(item)) {
        skipped++;
        continue;
      }

      try {
        await createNote.mutateAsync({
          title: item.title,
          content: item.content,
        });
        imported++;
      } catch {
        skipped++;
      }
    }

    setImportSummary(`Imported ${imported} note${imported === 1 ? "" : "s"}${skipped ? `, skipped ${skipped}` : ""}.`);
    e.target.value = "";
  }

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
            onClick={handleExport}
            className="bg-gray-200 rounded px-4 py-2 cursor-pointer hover:bg-gray-300"
          >
            Export
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gray-200 rounded px-4 py-2 cursor-pointer hover:bg-gray-300"
          >
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />

          <button
            onClick={handleLogout}
            className="bg-gray-200 rounded px-4 py-2 cursor-pointer hover:bg-gray-300"
          >
            Log out
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search notes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4"
      />

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

      {exportError && (
        <p className="text-sm text-red-600 mb-4">
          {exportError}
        </p>
      )}

      {isLoading && <p>Loading...</p>}
      {isError && <p className="text-red-600">Failed to load notes.</p>}

      {notes && notes.length === 0 && (
        <p className="text-gray-500">
          {debouncedSearch ? "No notes match your search." : "No notes yet. Create your first note."}
        </p>
      )}

      {deleteError && (
        <p className="text-sm text-red-600 mb-4">
          {deleteError}
        </p>
      )}

      {importSummary && (
        <p className="text-sm text-gray-600 mb-4">
          {importSummary}
        </p>
      )}

      <ul className="space-y-2">
        {notes?.map((note) => (
          <li
            key={note._id}
            className="border rounded p-4 flex justify-between items-start"
          >
            <Link to={`/notes/${note._id}`} className="flex-1 min-w-0">
              <h2 className="font-medium truncate">{note.title}</h2>
              <div
                className="prose prose-sm max-w-none text-gray-500 line-clamp-2 [&_*]:my-0"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(note.content),
                }}
              />
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