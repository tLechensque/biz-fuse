import { useState, useCallback } from 'react';
import { produce } from 'immer';
import { Element, TemplateV2 } from '../runtime/props-schema';
import { DesignTokens } from '../runtime/design-tokens';

interface HistoryState {
  template: TemplateV2;
  tokens: DesignTokens;
}

export function useTemplateState(initialTemplate: TemplateV2, initialTokens: DesignTokens) {
  // Garantir que sempre temos valores válidos
  const validInitialTemplate = initialTemplate || {
    name: 'Novo Template',
    version: 'v2',
    root: {
      type: 'Frame',
      props: { width: '210mm', height: '297mm', padding: '20mm' },
      children: []
    }
  } as TemplateV2;

  const [state, setState] = useState<HistoryState>({
    template: validInitialTemplate,
    tokens: initialTokens,
  });
  
  const [history, setHistory] = useState<HistoryState[]>([state]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback((newState: HistoryState) => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newState]);
    setHistoryIndex(prev => prev + 1);
    setState(newState);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setState(history[historyIndex - 1]);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setState(history[historyIndex + 1]);
    }
  }, [historyIndex, history]);

  const updateTemplate = useCallback((updater: (draft: TemplateV2) => void) => {
    const newTemplate = produce(state.template, updater);
    pushHistory({ ...state, template: newTemplate });
  }, [state, pushHistory]);

  const updateTokens = useCallback((newTokens: DesignTokens) => {
    pushHistory({ ...state, tokens: newTokens });
  }, [state, pushHistory]);

  const updateElementAtPath = useCallback((path: string, updates: Partial<Element>) => {
    updateTemplate(draft => {
      const element = getElementAtPath(draft.root, path);
      if (element) {
        Object.assign(element, updates);
      }
    });
  }, [updateTemplate]);

  const addElementAtPath = useCallback((parentPath: string, element: Element) => {
    updateTemplate(draft => {
      const parent = getElementAtPath(draft.root, parentPath);
      if (parent && 'children' in parent) {
        if (!parent.children) {
          (parent as any).children = [];
        }
        (parent as any).children.push(element);
      }
    });
  }, [updateTemplate]);

  const removeElementAtPath = useCallback((path: string) => {
    updateTemplate(draft => {
      const parts = path.split('.');
      if (parts.length === 0) return;

      const parentPath = parts.slice(0, -1).join('.');
      const parent = parentPath ? getElementAtPath(draft.root, parentPath) : { children: [draft.root] };
      
      if (parent && 'children' in parent) {
        const indexMatch = parts[parts.length - 1].match(/\[(\d+)\]/);
        if (indexMatch) {
          const index = parseInt(indexMatch[1], 10);
          (parent as any).children.splice(index, 1);
        }
      }
    });
  }, [updateTemplate]);

  return {
    template: state.template,
    tokens: state.tokens,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    undo,
    redo,
    updateTemplate,
    updateTokens,
    updateElementAtPath,
    addElementAtPath,
    removeElementAtPath,
  };
}

function getElementAtPath(root: Element, path: string): Element | null {
  if (!path) return root;

  const parts = path.split('.');
  let current: any = root;

  for (const part of parts) {
    if (part === 'children') {
      continue;
    }
    
    const indexMatch = part.match(/\[(\d+)\]/);
    if (indexMatch) {
      const index = parseInt(indexMatch[1], 10);
      if (current.children && current.children[index]) {
        current = current.children[index];
      } else {
        return null;
      }
    } else {
      if (current[part]) {
        current = current[part];
      } else {
        return null;
      }
    }
  }

  return current;
}
