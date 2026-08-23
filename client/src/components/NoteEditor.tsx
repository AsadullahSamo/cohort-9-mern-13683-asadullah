import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

interface NoteEditorProps {
  content: string;
  onChange: (html: string) => void;
}

function ToolbarButton({
    onClick,
    isActive,
    label,
    icon,
  }: {
    onClick: () => void;
    isActive: boolean;
    label: string;
    icon: React.ReactNode;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={label}
        className="w-8 h-8 flex items-center justify-center rounded-md text-sm cursor-pointer transition-colors"
        style={{
          backgroundColor: isActive ? "#1B1F3B" : "transparent",
          color: isActive ? "#FFFFFF" : "#6B6F86",
        }}
      >
        {icon}
      </button>
    );
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

  return (
    <div className="rounded-xl overflow-hidden bg-white" style={{ border: "1px solid #E4E4EE" }}>
      <div className="flex gap-1 p-2" style={{ borderBottom: "1px solid #EFEFF5" }}>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          label="Bold"
          icon={<span style={{ fontWeight: 700 }}>B</span>}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          label="Italic"
          icon={<span style={{ fontStyle: "italic" }}>I</span>}
        />
        <div className="w-px my-1.5" style={{ backgroundColor: "#EFEFF5" }} />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          label="Bullet list"
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
              <path d="M9 6h11M9 12h11M9 18h11" strokeLinecap="round" />
            </svg>
          }
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          label="Heading"
          icon={<span style={{ fontWeight: 700, fontSize: "0.8rem" }}>H2</span>}
        />
      </div>
      <EditorContent editor={editor} className="prose max-w-none p-4 min-h-[200px]" />
    </div>
  );
}