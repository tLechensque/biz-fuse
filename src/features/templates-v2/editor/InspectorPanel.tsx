import React from 'react';
import { Element } from '../runtime/props-schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface InspectorPanelProps {
  element: Element | null;
  onUpdate: (updates: Partial<Element>) => void;
}

export function InspectorPanel({ element, onUpdate }: InspectorPanelProps) {
  if (!element) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">Inspector</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Selecione um elemento para editar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Inspector: {element.type}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <Tabs defaultValue="props" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="props">Props</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
            </TabsList>

            <TabsContent value="props" className="p-4 space-y-4">
              {element.id !== undefined && (
                <div className="space-y-2">
                  <Label className="text-xs">ID</Label>
                  <Input
                    value={element.id || ''}
                    onChange={(e) => onUpdate({ id: e.target.value })}
                    className="h-8 text-xs"
                    placeholder="element-id"
                  />
                </div>
              )}

              {element.type === 'Text' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs">Content</Label>
                    <Textarea
                      value={(element as any).content || ''}
                      onChange={(e) => onUpdate({ content: e.target.value } as any)}
                      className="text-xs"
                      placeholder="Text content"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Binding Path</Label>
                    <Input
                      value={(element as any).binding?.path || ''}
                      onChange={(e) => onUpdate({ binding: { path: e.target.value } } as any)}
                      className="h-8 text-xs"
                      placeholder="client.name"
                    />
                  </div>
                </>
              )}

              {element.type === 'Image' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs">Source URL</Label>
                    <Input
                      value={(element as any).src || ''}
                      onChange={(e) => onUpdate({ src: e.target.value } as any)}
                      className="h-8 text-xs"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Binding Path</Label>
                    <Input
                      value={(element as any).binding?.path || ''}
                      onChange={(e) => onUpdate({ binding: { path: e.target.value } } as any)}
                      className="h-8 text-xs"
                      placeholder="organization.logoUrl"
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="style" className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-xs">Width</Label>
                  <Input
                    value={(element.style as any)?.width || ''}
                    onChange={(e) => onUpdate({ style: { ...(element.style || {}), width: e.target.value } } as any)}
                    className="h-8 text-xs"
                    placeholder="auto"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Height</Label>
                  <Input
                    value={(element.style as any)?.height || ''}
                    onChange={(e) => onUpdate({ style: { ...(element.style || {}), height: e.target.value } } as any)}
                    className="h-8 text-xs"
                    placeholder="auto"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Padding</Label>
                <Input
                  value={(element.style as any)?.padding || ''}
                  onChange={(e) => onUpdate({ style: { ...(element.style || {}), padding: e.target.value } } as any)}
                  className="h-8 text-xs"
                  placeholder="16px"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Background</Label>
                <Input
                  value={(element.style as any)?.background || ''}
                  onChange={(e) => onUpdate({ style: { ...(element.style || {}), background: e.target.value } } as any)}
                  className="h-8 text-xs"
                  placeholder="white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Border Radius</Label>
                <Input
                  value={(element.style as any)?.borderRadius || ''}
                  onChange={(e) => onUpdate({ style: { ...(element.style || {}), borderRadius: e.target.value } } as any)}
                  className="h-8 text-xs"
                  placeholder="8px"
                />
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
