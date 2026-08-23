import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNote, useCreateNote, useUpdateNote } from "../hooks/useNotes";
import { NoteEditor } from "../components/NoteEditor";

export function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === undefined;
  const navigate = useNavigate();

  const { data: existingNote, isLoading, isError } = useNote(isNew ? undefined : id);
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  const isPending = createNote.isPending || updateNote.isPending;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setContent(existingNote.content);
    }
  }, [existingNote]);

  async function handleSave() {
    setSaveError(null);

    try {
      if (isNew) {
        await createNote.mutateAsync({ title, content });
      } else {
        await updateNote.mutateAsync({
          id: id as string,
          updates: { title, content },
        });
      }

      navigate("/");
    } catch {
      setSaveError("Couldn't save note. Please try again.");
    }
  }

  if (!isNew && isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F7F7FB", fontFamily: "'Inter', sans-serif", color: "#6B6F86" }}
      >
        Loading...
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F7F7FB", fontFamily: "'Inter', sans-serif" }}
      >
        <p role="alert" className="text-sm text-red-600">
          Failed to load note.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F7FB", fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <input
          type="text"
          placeholder="Untitled"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-3xl pb-3 mb-5 focus:outline-none bg-transparent"
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 500,
            color: "#1B1F3B",
            borderBottom: "1px solid #E4E4EE",
          }}
        />

        <NoteEditor content={content} onChange={setContent} />

        {saveError && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-4">
            {saveError}
          </p>
        )}

        <div className="flex gap-2 mt-5">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#1B1F3B" }}
          >
            {isPending ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => navigate("/")}
            disabled={isPending}
            className="rounded-lg px-4 py-2 text-sm font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ border: "1px solid #E4E4EE", color: "#6B6F86" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}