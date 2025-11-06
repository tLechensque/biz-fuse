import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DesignTokens } from '../runtime/design-tokens';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TokensPanelProps {
  tokens: DesignTokens;
  onUpdate: (tokens: DesignTokens) => void;
}

export function TokensPanel({ tokens, onUpdate }: TokensPanelProps) {
  const updateColor = (key: string, value: string) => {
    onUpdate({
      ...tokens,
      colors: { ...tokens.colors, [key]: value },
    });
  };

  const updateTypography = (key: string, value: string) => {
    onUpdate({
      ...tokens,
      typography: { ...tokens.typography, [key]: value },
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Design Tokens</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="p-4 space-y-3">
              {Object.entries(tokens.colors).slice(0, 6).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs capitalize">{key}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={value}
                      onChange={(e) => updateColor(key, e.target.value)}
                      className="h-7 text-xs font-mono"
                      placeholder="220 90% 50%"
                    />
                    <div 
                      className="w-7 h-7 rounded border"
                      style={{ background: `hsl(${value})` }}
                    />
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="typography" className="p-4 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Font Sans</Label>
                <Input
                  value={tokens.typography['font-sans']}
                  onChange={(e) => updateTypography('font-sans', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Text Base</Label>
                <Input
                  value={tokens.typography['text-base']}
                  onChange={(e) => updateTypography('text-base', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Text 2XL</Label>
                <Input
                  value={tokens.typography['text-2xl']}
                  onChange={(e) => updateTypography('text-2xl', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
