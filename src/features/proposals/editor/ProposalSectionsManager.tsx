import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProposalEditorForm } from './proposal-editor-schema';
import { SectionEditor } from './SectionEditor';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface Props {
  form: UseFormReturn<ProposalEditorForm>;
}

export function ProposalSectionsManager({ form }: Props) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'sections',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
        
        // Update order property
        const sections = form.getValues('sections');
        sections.forEach((section, index) => {
          form.setValue(`sections.${index}.order`, index, { shouldDirty: true });
        });
      }
    }
  };

  const handleAddSection = () => {
    append({
      id: crypto.randomUUID(),
      name: 'Nova Seção',
      order: fields.length,
      visible: true,
      items: [],
      upgrades: [],
      subtotal: 0,
      excludeFromPayment: false,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Seções da Proposta</h3>
          <p className="text-sm text-muted-foreground">
            Arraste para reordenar as seções
          </p>
        </div>
        <Button type="button" variant="outline" onClick={handleAddSection}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Seção
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} id={field.id}>
                <SectionEditor
                  form={form}
                  sectionIndex={index}
                  onRemove={() => remove(index)}
                />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {fields.length === 0 && (
        <div className="text-center py-12 border rounded-lg border-dashed">
          <p className="text-muted-foreground mb-4">Nenhuma seção criada</p>
          <Button type="button" variant="outline" onClick={handleAddSection}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Seção
          </Button>
        </div>
      )}
    </div>
  );
}
