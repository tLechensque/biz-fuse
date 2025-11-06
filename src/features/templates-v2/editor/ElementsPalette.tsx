import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Frame, Layers, Grid, Type, Image, Table, Minus, Copy } from 'lucide-react';
import { DraggableElement } from './DraggableElement';

interface ElementsPaletteProps {
  onAddElement: (type: string) => void;
}

const ELEMENTS = [
  { type: 'Frame', icon: Frame, label: 'Frame', desc: 'Container básico' },
  { type: 'Stack', icon: Layers, label: 'Stack', desc: 'Flexbox layout' },
  { type: 'Grid', icon: Grid, label: 'Grid', desc: 'Grid layout' },
  { type: 'Text', icon: Type, label: 'Text', desc: 'Texto/binding' },
  { type: 'Image', icon: Image, label: 'Image', desc: 'Imagem' },
  { type: 'Table', icon: Table, label: 'Table', desc: 'Tabela de dados' },
  { type: 'Divider', icon: Minus, label: 'Divider', desc: 'Separador' },
  { type: 'Repeater', icon: Copy, label: 'Repeater', desc: 'Repetir array' },
];

export function ElementsPalette({ onAddElement }: ElementsPaletteProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Elements</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid grid-cols-2 gap-2">
            {ELEMENTS.map((element) => (
              <DraggableElement
                key={element.type}
                type={element.type}
                icon={element.icon}
                label={element.label}
                desc={element.desc}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
