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
    return <div className="p-8">Loading...</div>;
  }

  if (isError) {
    return (
      <p className="text-red-600">
        Failed to load note.
      </p>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-xl font-semibold border-b pb-2 mb-4 focus:outline-none"
      />
      <NoteEditor content={content} onChange={setContent} />

      {saveError && (
        <p className="text-sm text-red-600">
          {saveError}
        </p>
      )}

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-blue-600 text-white rounded px-4 py-2 cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => navigate("/")}
          disabled={isPending}
          className="bg-gray-200 rounded px-4 py-2 cursor-pointer hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}