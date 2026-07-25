import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

interface NoteEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export function NoteEditor({ content, onChange }: NoteEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  function ToolbarButton({
    onClick,
    isActive,
    label,
  }: {
    onClick: () => void;
    isActive: boolean;
    label: string;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`px-2 py-1 rounded text-sm cursor-pointer ${
          isActive ? "bg-gray-300" : "bg-gray-100 hover:bg-gray-200"
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="border rounded">
      <div className="flex gap-1 border-b p-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          label="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          label="Italic"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          label="Bullet list"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          label="Heading"
        />
      </div>
      <EditorContent editor={editor} className="prose max-w-none p-4 min-h-[200px]" />
    </div>
  );
}