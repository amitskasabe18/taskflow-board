import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Link,
  X
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter description...",
  className = ""
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [isCodeMode, setIsCodeMode] = useState(false);

  // Initialize editor content only on mount / external value change
  useEffect(() => {
    if (editorRef.current) {
      // Only update if the content is actually different
      const currentContent = editorRef.current.innerHTML;
      const newContent = value || "";
      
      // Debug logging
      console.log('RichTextEditor - value prop:', value);
      console.log('RichTextEditor - currentContent:', currentContent);
      console.log('RichTextEditor - newContent:', newContent);
      
      if (currentContent !== newContent) {
        // Preserve cursor position if possible
        const selection = window.getSelection();
        const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        const startOffset = range ? range.startOffset : 0;
        const endOffset = range ? range.endOffset : 0;
        
        editorRef.current.innerHTML = newContent;
        
        console.log('RichTextEditor - set innerHTML to:', newContent);
        
        // Restore cursor position if we had one
        if (range && editorRef.current.contains(range.startContainer)) {
          try {
            const newRange = document.createRange();
            newRange.setStart(range.startContainer, Math.min(startOffset, range.startContainer.textContent?.length || 0));
            newRange.setEnd(range.endContainer, Math.min(endOffset, range.endContainer.textContent?.length || 0));
            selection?.removeAllRanges();
            selection?.addRange(newRange);
          } catch (e) {
            // If cursor restoration fails, just focus at the end
            editorRef.current.focus();
            const newRange = document.createRange();
            newRange.selectNodeContents(editorRef.current);
            newRange.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(newRange);
          }
        }
      }
    }
  }, [value]);

  const updateValue = useCallback(() => {
    if (!editorRef.current) return;
    const newValue = editorRef.current.innerHTML;
    console.log('RichTextEditor - updateValue called with:', newValue);
    onChange(newValue);
  }, [onChange]);

  // Save selection before focus leaves editor (e.g. toolbar button click)
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (selection && savedRangeRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }
  };

  const checkCodeMode = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const el = container.nodeType === Node.TEXT_NODE
      ? container.parentElement
      : container as Element;
    setIsCodeMode(!!(el?.tagName === "PRE" || el?.closest("pre")));
  }, []);

  const execCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;
    restoreSelection();
    editorRef.current.focus();
    document.execCommand(command, false, value ?? undefined);
    updateValue();
    checkCodeMode();
  };

  const handleToggleCode = () => {
    if (!editorRef.current) return;
    restoreSelection();
    editorRef.current.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (isCodeMode) {
      document.execCommand("formatBlock", false, "p");
    } else {
      const escaped = selectedText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      document.execCommand(
        "insertHTML",
        false,
        `<pre><code>${escaped || "&#8203;"}</code></pre>`
      );
    }

    updateValue();
    checkCodeMode();
  };

  const handleInsertList = (ordered: boolean) => {
    if (!editorRef.current) return;
    restoreSelection();
    editorRef.current.focus();

    // Use the native execCommand — no manual DOM insertion
    const cmd = ordered ? "insertOrderedList" : "insertUnorderedList";
    document.execCommand(cmd, false, undefined);
    updateValue();
  };

  const handleOpenLinkDialog = () => {
    // Clear previous values when opening dialog
    setLinkUrl("");
    setLinkText("");
    
    saveSelection(); // capture current selection before dialog opens
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const text = selection.toString();
      if (text) setLinkText(text);
    }
    setIsLinkDialogOpen(true);
  };

  const addLink = () => {
    if (!linkUrl || !editorRef.current) return;

    restoreSelection();
    editorRef.current.focus();

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const displayText = linkText || range.toString() || linkUrl;

      const link = document.createElement("a");
      link.href = linkUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = displayText;

      range.deleteContents();
      range.insertNode(link);

      // Move cursor after link
      range.setStartAfter(link);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    setLinkUrl("");
    setLinkText("");
    setIsLinkDialogOpen(false);
    updateValue();
  };

  const handleInput = () => updateValue();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          execCommand("bold");
          break;
        case "i":
          e.preventDefault();
          execCommand("italic");
          break;
        case "u":
          e.preventDefault();
          execCommand("underline");
          break;
      }
    }
  };

  const formatButtons: Array<{
    icon: React.ElementType;
    title: string;
    active?: boolean;
    action: () => void;
  }> = [
    { icon: Bold,         title: "Bold",           action: () => execCommand("bold") },
    { icon: Italic,       title: "Italic",         action: () => execCommand("italic") },
    { icon: Underline,    title: "Underline",      action: () => execCommand("underline") },
    { icon: Code,         title: "Code",           active: isCodeMode, action: handleToggleCode },
    { icon: List,         title: "Bullet List",    action: () => handleInsertList(false) },
    { icon: ListOrdered,  title: "Numbered List",  action: () => handleInsertList(true) },
    { icon: AlignLeft,    title: "Align Left",     action: () => execCommand("justifyLeft") },
    { icon: AlignCenter,  title: "Align Center",   action: () => execCommand("justifyCenter") },
    { icon: AlignRight,   title: "Align Right",    action: () => execCommand("justifyRight") },
    { icon: Link,         title: "Add Link",       action: handleOpenLinkDialog },
  ];

  return (
    <div className={`border rounded-md ${className}`}>
      {/* Toolbar */}
      <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
        {formatButtons.map((button, index) => (
          <Button
            key={index}
            type="button"
            variant={button.active ? "default" : "ghost"}
            size="sm"
            onMouseDown={(e) => {
              // Prevent the editor from losing focus/selection on toolbar click
              e.preventDefault();
              saveSelection();
              button.action();
            }}
            title={button.title}
            className="h-8 w-8 p-0"
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onMouseUp={checkCodeMode}
        onKeyUp={checkCodeMode}
        className="min-h-[120px] p-3 focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_pre]:bg-gray-100 [&_pre]:p-2 [&_pre]:rounded [&_code]:font-mono [&_code]:text-sm [&_a]:text-blue-600 [&_a]:underline [&:empty:before]:content-[attr(data-placeholder)] [&:empty:before]:text-muted-foreground [&:empty:before]:pointer-events-none"
        style={{ 
          direction: "ltr",
          minHeight: "120px"
        }}
        suppressContentEditableWarning
        data-placeholder={placeholder}
      />

      {/* Link Dialog */}
      {isLinkDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-4 w-96">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Add Link</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsLinkDialogOpen(false);
                  setLinkUrl("");
                  setLinkText("");
                }}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addLink()}
                  placeholder="https://example.com"
                  className="w-full p-2 border rounded"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Text</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Link text (optional)"
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={addLink} size="sm" disabled={!linkUrl}>
                Add Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsLinkDialogOpen(false);
                  setLinkUrl("");
                  setLinkText("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}