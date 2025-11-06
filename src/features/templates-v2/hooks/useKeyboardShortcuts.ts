import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

export function useKeyboardShortcuts({ 
  onUndo, 
  onRedo, 
  onSave,
  onDelete 
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo();
      }
      
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y = Redo
      if ((e.ctrlKey || e.metaKey) && (
        (e.key === 'z' && e.shiftKey) || 
        e.key === 'y'
      )) {
        e.preventDefault();
        onRedo();
      }
      
      // Ctrl/Cmd + S = Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave();
      }
      
      // Delete or Backspace = Delete element
      if ((e.key === 'Delete' || e.key === 'Backspace') && onDelete) {
        const target = e.target as HTMLElement;
        // Não deletar se estiver digitando em input/textarea
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          onDelete();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo, onSave, onDelete]);
}
