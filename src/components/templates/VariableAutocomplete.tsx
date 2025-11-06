import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VARIABLE_REGISTRY, getVariablesByGroup } from '@/features/templates/engine/variables';

interface VariableAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

export function VariableAutocomplete({
  value,
  onChange,
  placeholder,
  multiline = false,
}: VariableAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Detectar quando usuário digita {{
  const handleChange = (newValue: string) => {
    onChange(newValue);

    const curPos = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = newValue.substring(0, curPos);
    const lastOpenBrace = textBeforeCursor.lastIndexOf('{{');
    
    if (lastOpenBrace !== -1 && !textBeforeCursor.includes('}}', lastOpenBrace)) {
      const search = textBeforeCursor.substring(lastOpenBrace + 2);
      setSearchTerm(search.toLowerCase());
      setShowSuggestions(true);
      setCursorPosition(lastOpenBrace);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleInsertVariable = (variablePath: string) => {
    if (!inputRef.current) return;

    const curPos = inputRef.current.selectionStart || 0;
    const textBefore = value.substring(0, cursorPosition);
    const textAfter = value.substring(curPos);
    
    const newValue = `${textBefore}{{${variablePath}}}${textAfter}`;
    onChange(newValue);
    setShowSuggestions(false);

    // Posicionar cursor após a variável
    setTimeout(() => {
      const newCursorPos = cursorPosition + variablePath.length + 4;
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      inputRef.current?.focus();
    }, 0);
  };

  // Filtrar variáveis
  const filteredVariables = searchTerm
    ? VARIABLE_REGISTRY.filter((v) =>
        v.path.toLowerCase().includes(searchTerm) ||
        v.label.toLowerCase().includes(searchTerm)
      )
    : VARIABLE_REGISTRY;

  const groupedVariables = filteredVariables.reduce((acc, variable) => {
    if (!acc[variable.group]) {
      acc[variable.group] = [];
    }
    acc[variable.group].push(variable);
    return acc;
  }, {} as Record<string, typeof VARIABLE_REGISTRY>);

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className="relative">
      <InputComponent
        ref={inputRef as any}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => {
          // Reabrir se cursor está em {{
          const curPos = inputRef.current?.selectionStart || 0;
          const textBeforeCursor = value.substring(0, curPos);
          const lastOpenBrace = textBeforeCursor.lastIndexOf('{{');
          if (lastOpenBrace !== -1 && !textBeforeCursor.includes('}}', lastOpenBrace)) {
            setShowSuggestions(true);
          }
        }}
        onBlur={() => {
          // Delay para permitir clique nas sugestões
          setTimeout(() => setShowSuggestions(false), 200);
        }}
        placeholder={placeholder}
        className="font-mono text-sm"
        rows={multiline ? 3 : undefined}
      />

      {showSuggestions && filteredVariables.length > 0 && (
        <Card className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto bg-popover border shadow-lg">
          <div className="p-2 space-y-3">
            {Object.entries(groupedVariables).map(([group, variables]) => (
              <div key={group}>
                <div className="text-xs font-semibold text-muted-foreground px-2 mb-1">
                  {group}
                </div>
                <div className="space-y-1">
                  {variables.slice(0, 5).map((variable) => (
                    <button
                      key={variable.path}
                      type="button"
                      onClick={() => handleInsertVariable(variable.path)}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-muted text-sm"
                    >
                      <div className="font-mono text-xs text-primary">
                        {'{{'}
                        {variable.path}
                        {'}}'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {variable.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
