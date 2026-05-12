'use client';

import { useCallback } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Undo, Redo, Link, Image, Code,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({ onClick, active, children, title }: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-1.5 rounded transition-all duration-200"
      style={{
        background: active ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
        color: active ? 'var(--primary-light)' : 'var(--foreground-muted)',
        border: active ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid transparent',
      }}
    >
      {children}
    </button>
  );
}

function MenuBar({ editor }: { editor: Editor }) {
  const addImage = useCallback(() => {
    const url = window.prompt('URL de la imagen:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    const url = window.prompt('URL del enlace:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  return (
    <div
      className="flex flex-wrap gap-1 p-2 border-b"
      style={{
        borderColor: 'var(--card-border)',
        background: 'rgba(0, 0, 0, 0.3)',
      }}
    >
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrita">
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Cursiva">
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Tachado">
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 mx-1 self-center" style={{ background: 'var(--card-border)' }} />

      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Título 1">
        <Heading1 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Título 2">
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Título 3">
        <Heading3 className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 mx-1 self-center" style={{ background: 'var(--card-border)' }} />

      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista">
        <List className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada">
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Cita">
        <Quote className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Código">
        <Code className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 mx-1 self-center" style={{ background: 'var(--card-border)' }} />

      <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Enlace">
        <Link className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={addImage} title="Imagen">
        <Image className="w-4 h-4" aria-label="Insertar imagen" />
      </ToolbarButton>

      <div className="w-px h-6 mx-1 self-center" style={{ background: 'var(--card-border)' }} />

      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Deshacer">
        <Undo className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Rehacer">
        <Redo className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      ImageExtension,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder || 'Escribe aquí...' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3',
        style: 'font-family: var(--font-inter), sans-serif; font-size: 1rem; line-height: 1.8;',
      },
    },
  });

  if (!editor) return null;

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        border: '1px solid var(--card-border)',
        background: 'rgba(0, 0, 0, 0.4)',
      }}
    >
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
