import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Palette } from 'lucide-react';
import { Theme } from '@/features/templates/engine/schema';

interface ThemeCustomizerProps {
  theme: Theme;
  onUpdateTheme: (theme: Theme) => void;
}

export function ThemeCustomizer({ theme, onUpdateTheme }: ThemeCustomizerProps) {
  const handleChange = (key: keyof Theme, value: string) => {
    onUpdateTheme({ ...theme, [key]: value });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Customização de Tema
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Nenhum bloco selecionado
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Cores do Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="primary" className="text-xs mb-2 block">
              Cor Primária
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                id="primary"
                type="color"
                value={theme.primary || '#0E121B'}
                onChange={(e) => handleChange('primary', e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                type="text"
                value={theme.primary || '#0E121B'}
                onChange={(e) => handleChange('primary', e.target.value)}
                className="flex-1 font-mono text-xs"
                placeholder="#0E121B"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cor principal do template
            </p>
          </div>

          <div>
            <Label htmlFor="accent" className="text-xs mb-2 block">
              Cor de Destaque
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                id="accent"
                type="color"
                value={theme.accent || '#2B6CB0'}
                onChange={(e) => handleChange('accent', e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                type="text"
                value={theme.accent || '#2B6CB0'}
                onChange={(e) => handleChange('accent', e.target.value)}
                className="flex-1 font-mono text-xs"
                placeholder="#2B6CB0"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cor para elementos secundários
            </p>
          </div>

          <div>
            <Label htmlFor="soft" className="text-xs mb-2 block">
              Cor Suave
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                id="soft"
                type="color"
                value={theme.soft || '#F4F6F9'}
                onChange={(e) => handleChange('soft', e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                type="text"
                value={theme.soft || '#F4F6F9'}
                onChange={(e) => handleChange('soft', e.target.value)}
                className="flex-1 font-mono text-xs"
                placeholder="#F4F6F9"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cor de fundo e áreas suaves
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-xs">Preview de Cores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div
            className="h-12 rounded"
            style={{ backgroundColor: theme.primary }}
          />
          <div
            className="h-12 rounded"
            style={{ backgroundColor: theme.accent }}
          />
          <div
            className="h-12 rounded border"
            style={{ backgroundColor: theme.soft }}
          />
        </CardContent>
      </Card>

      <div className="pt-4 border-t border-border text-xs text-muted-foreground">
        <p>As cores serão aplicadas ao preview e ao PDF gerado.</p>
      </div>
    </div>
  );
}
