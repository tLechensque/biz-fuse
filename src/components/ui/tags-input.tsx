import { useState, useRef, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';

interface TagsInputProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}

export const TagsInput: React.FC<TagsInputProps> = ({
  selectedTags,
  onTagsChange,
  placeholder = "Digite uma tag e pressione Enter..."
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { profile } = useProfile();

  const { data: existingTags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const availableTags = existingTags.filter(tag => 
    !selectedTags.includes(tag.name) &&
    tag.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const addTag = async (tagName: string) => {
    if (!tagName || selectedTags.includes(tagName)) return;

    // Create tag if it doesn't exist
    if (!existingTags.find(t => t.name.toLowerCase() === tagName.toLowerCase()) && profile?.organization_id) {
      try {
        await supabase
          .from('tags')
          .insert({
            name: tagName,
            organization_id: profile.organization_id
          });
      } catch (error) {
        console.error('Error creating tag:', error);
      }
    }

    onTagsChange([...selectedTags, tagName]);
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="space-y-2">
      <Label>Tags</Label>
      <div className="relative">
        <Card className="p-3 min-h-[42px]">
          <div className="flex flex-wrap gap-2 items-center">
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={selectedTags.length === 0 ? placeholder : ""}
              className="border-none shadow-none flex-1 min-w-[120px] h-6 p-0 focus-visible:ring-0"
            />
          </div>
        </Card>

        {showSuggestions && inputValue && availableTags.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto">
            <div className="p-2">
              {availableTags.slice(0, 10).map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => addTag(tag.name)}
                  className="w-full text-left px-2 py-1 hover:bg-accent rounded text-sm"
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </Card>
        )}

        {showSuggestions && inputValue && !availableTags.some(t => t.name.toLowerCase() === inputValue.toLowerCase()) && (
          <Card className="absolute top-full left-0 right-0 z-10 mt-1">
            <div className="p-2">
              <button
                type="button"
                onClick={() => addTag(inputValue)}
                className="w-full text-left px-2 py-1 hover:bg-accent rounded text-sm flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Criar "{inputValue}"
              </button>
            </div>
          </Card>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Digite tags e pressione Enter para adicionar. Use tags para categorizar e filtrar produtos.
      </p>
    </div>
  );
};