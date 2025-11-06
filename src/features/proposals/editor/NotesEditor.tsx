import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, FileText, Check, X } from 'lucide-react';
import { ProposalEditorForm } from './proposal-editor-schema';
import { useState } from 'react';

interface Props {
  form: UseFormReturn<ProposalEditorForm>;
}

export function NotesEditor({ form }: Props) {
  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');

  const inclusions = form.watch('notes.inclusions') || [];
  const exclusions = form.watch('notes.exclusions') || [];

  const handleAddInclusion = () => {
    if (newInclusion.trim()) {
      form.setValue('notes.inclusions', [...inclusions, newInclusion.trim()], {
        shouldDirty: true,
      });
      setNewInclusion('');
    }
  };

  const handleRemoveInclusion = (index: number) => {
    form.setValue(
      'notes.inclusions',
      inclusions.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  const handleAddExclusion = () => {
    if (newExclusion.trim()) {
      form.setValue('notes.exclusions', [...exclusions, newExclusion.trim()], {
        shouldDirty: true,
      });
      setNewExclusion('');
    }
  };

  const handleRemoveExclusion = (index: number) => {
    form.setValue(
      'notes.exclusions',
      exclusions.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Notas e Observações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* General Notes */}
        <div className="space-y-2">
          <Label>Observações Gerais</Label>
          <Textarea
            {...form.register('notes.generalNotes')}
            placeholder="Adicione observações gerais sobre a proposta..."
            rows={4}
          />
        </div>

        {/* Inclusions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-success" />
            <h4 className="font-medium">Está Incluso</h4>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ex: Mão de obra especializada"
              value={newInclusion}
              onChange={(e) => setNewInclusion(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddInclusion();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={handleAddInclusion}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {inclusions.length > 0 && (
            <ul className="space-y-2">
              {inclusions.map((item, index) => (
                <li key={index} className="flex items-center justify-between p-2 bg-success/10 rounded">
                  <span className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success" />
                    {item}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveInclusion(index)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Exclusions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <X className="w-5 h-5 text-destructive" />
            <h4 className="font-medium">Não Está Incluso</h4>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ex: Pintura e acabamento"
              value={newExclusion}
              onChange={(e) => setNewExclusion(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddExclusion();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={handleAddExclusion}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {exclusions.length > 0 && (
            <ul className="space-y-2">
              {exclusions.map((item, index) => (
                <li key={index} className="flex items-center justify-between p-2 bg-destructive/10 rounded">
                  <span className="flex items-center gap-2 text-sm">
                    <X className="w-4 h-4 text-destructive" />
                    {item}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveExclusion(index)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
