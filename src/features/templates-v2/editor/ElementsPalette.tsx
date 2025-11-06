import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Frame, Layers, Grid, Type, Image, Table, Minus, Copy } from 'lucide-react';

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
            {ELEMENTS.map((element) => {
              const Icon = element.icon;
              return (
                <Button
                  key={element.type}
                  variant="outline"
                  className="h-auto flex-col gap-1 p-3"
                  onClick={() => onAddElement(element.type)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{element.label}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {element.desc}
                  </span>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
