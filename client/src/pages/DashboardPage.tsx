import DOMPurify from "dompurify";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotes, useDeleteNote, useCreateNote } from "../hooks/useNotes";
import { useNoteSync } from "../hooks/useNoteSync";
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

const CARD_ACCENTS = ["#E2A83D", "#6C7CE7", "#4FBF8F"];

export function DashboardPage() {
  const { logout } = useAuth();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [importSummary, setImportSummary] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useNoteSync();

  useEffect(() => {
    const timeout = setTimeout(() => setImportSummary(null), 2000);
    return () => clearTimeout(timeout);
  }, [importSummary]);

  const { data: notes, isLoading, isError } = useNotes(debouncedSearch);
  const deleteNote = useDeleteNote();
  const createNote = useCreateNote();

  const fileInputRef = useRef<HTMLInputElement>(null);
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
    <div className="min-h-screen" style={{ backgroundColor: "#F7F7FB", fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1
              className="text-3xl mt-1"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, color: "#1B1F3B" }}
            >
              Your notes
            </h1>
            <p className="text-sm mt-1" style={{ color: "#6B6F86" }}>
              {notes ? `${notes.length} note${notes.length === 1 ? "" : "s"}` : "Loading your notes"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              title="Export notes"
              className="w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer transition-all"
              style={{ border: "1px solid #E4E4EE", color: "#6B6F86", backgroundColor: "#FFFFFF" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1B1F3B";
                e.currentTarget.style.borderColor = "#1B1F3B";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
                e.currentTarget.style.borderColor = "#E4E4EE";
                e.currentTarget.style.color = "#6B6F86";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              title="Import notes"
              className="w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer transition-all"
              style={{ border: "1px solid #E4E4EE", color: "#6B6F86", backgroundColor: "#FFFFFF" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1B1F3B";
                e.currentTarget.style.borderColor = "#1B1F3B";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
                e.currentTarget.style.borderColor = "#E4E4EE";
                e.currentTarget.style.color = "#6B6F86";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15V3m0 0 4 4m-4-4-4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
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
              title="Log out"
              className="w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer transition-all"
              style={{ border: "1px solid #E4E4EE", color: "#6B6F86", backgroundColor: "#FFFFFF" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1B1F3B";
                e.currentTarget.style.borderColor = "#1B1F3B";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
                e.currentTarget.style.borderColor = "#E4E4EE";
                e.currentTarget.style.color = "#6B6F86";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m6 14 5-5-5-5m5 5H9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <Link
              to="/notes/new"
              className="text-white text-sm font-medium rounded-lg px-4 h-9 flex items-center cursor-pointer transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#1B1F3B" }}
            >
              New note
            </Link>
          </div>
        </div>

        <div className="relative mb-6">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#6B6F86" }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none"
            style={{ border: "1px solid #E4E4EE" }}
            onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #E2A83D")}
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          />
        </div>

        {logoutError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
            <span>{logoutError}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="underline cursor-pointer font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {exportError && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
            {exportError}
          </p>
        )}

        {deleteError && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
            {deleteError}
          </p>
        )}

        {importSummary && (
          <p className="text-sm rounded-lg px-3 py-2 mb-4" style={{ backgroundColor: "#FBF3E1", color: "#8A6416" }}>
            {importSummary}
          </p>
        )}

        {isLoading && <p className="text-sm" style={{ color: "#6B6F86" }}>Loading...</p>}
        {isError && <p className="text-sm text-red-600">Failed to load notes.</p>}

        {notes && notes.length === 0 && (
          <div className="text-center py-16">
            <p
              className="text-xl"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, color: "#1B1F3B" }}
            >
              {debouncedSearch ? "No notes match your search" : ""}
            </p>
            <p className="text-sm mt-1" style={{ color: "#6B6F86" }}>
              {debouncedSearch ? "Try a different search term." : "Create your first note to get started."}
            </p>
          </div>
        )}

        <ul className="space-y-2">
          {notes?.map((note, index) => (
            <li
              key={note._id}
              className="group bg-white rounded-xl p-4 flex justify-between items-start transition-shadow"
              style={{ border: "1px solid #EFEFF5", boxShadow: "0 1px 2px rgba(27,31,59,0.04)" }}
            >
              <Link to={`/notes/${note._id}`} className="flex-1 min-w-0 flex gap-3">
                <div
                  className="w-1 rounded-full shrink-0 self-stretch"
                  style={{ backgroundColor: CARD_ACCENTS[index % CARD_ACCENTS.length] }}
                />
                <div className="min-w-0">
                  <h2 className="font-medium truncate" style={{ color: "#1B1F3B" }}>
                    {note.title}
                  </h2>
                  <div
                    className="prose prose-sm max-w-none line-clamp-2 [&_*]:my-0 mt-0.5"
                    style={{ color: "#6B6F86" }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(note.content),
                    }}
                  />
                </div>
              </Link>

              <button
                onClick={() => {
                  setDeleteError(null);
                  setPendingDeleteId(note._id);
                }}
                title="Delete note"
                className="w-8 h-8 flex items-center justify-center rounded-lg ml-4 shrink-0 cursor-pointer transition-colors"
                style={{ color: "#DC2626" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#7F1D1D")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#DC2626")}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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
    </div>
  );
}