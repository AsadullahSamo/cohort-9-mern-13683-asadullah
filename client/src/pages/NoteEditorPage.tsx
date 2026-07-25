import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNote, useCreateNote, useUpdateNote } from "../hooks/useNotes";
import { NoteEditor } from "../components/NoteEditor";

export function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === undefined;
  const navigate = useNavigate();

  const { data: existingNote, isLoading } = useNote(isNew ? undefined : id);
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setContent(existingNote.content);
    }
  }, [existingNote]);

  async function handleSave() {
    if (isNew) {
      await createNote.mutateAsync({ title, content });
    } else {
      await updateNote.mutateAsync({ id: id as string, updates: { title, content } });
    }
    navigate("/");
  }

  if (!isNew && isLoading) {
    return <div className="p-8">Loading...</div>;
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
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white rounded px-4 py-2 cursor-pointer hover:bg-blue-700"
        >
          Save
        </button>
        <button
          onClick={() => navigate("/")}
          className="bg-gray-200 rounded px-4 py-2 cursor-pointer hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}