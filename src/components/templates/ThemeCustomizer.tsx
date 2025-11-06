import { Theme } from '@/features/templates/engine/schema';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ThemeCustomizerProps {
  theme: Theme;
  onUpdateTheme: (theme: Theme) => void;
}

export function ThemeCustomizer({ theme, onUpdateTheme }: ThemeCustomizerProps) {
  const handleChange = (key: keyof Theme, value: string) => {
    onUpdateTheme({ ...theme, [key]: value });
  };

  const fontFamilies = [
    { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
    { value: 'Roboto, sans-serif', label: 'Roboto' },
    { value: 'Poppins, sans-serif', label: 'Poppins' },
    { value: 'Montserrat, sans-serif', label: 'Montserrat' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Times New Roman, serif', label: 'Times' },
  ];

  return (
    <div className="p-4">
      <Tabs defaultValue="colors">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="colors">Cores</TabsTrigger>
          <TabsTrigger value="typography">Tipografia</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Paleta de Cores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primary Color */}
              <div className="space-y-2">
                <Label htmlFor="primary">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="primary"
                    value={theme.primary}
                    onChange={(e) => handleChange('primary', e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={theme.primary}
                    onChange={(e) => handleChange('primary', e.target.value)}
                    className="flex-1 font-mono text-sm"
                    placeholder="#0E121B"
                  />
                </div>
                <div 
                  className="h-8 rounded-md border"
                  style={{ backgroundColor: theme.primary }}
                />
              </div>

              {/* Accent Color */}
              <div className="space-y-2">
                <Label htmlFor="accent">Cor de Destaque</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="accent"
                    value={theme.accent}
                    onChange={(e) => handleChange('accent', e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={theme.accent}
                    onChange={(e) => handleChange('accent', e.target.value)}
                    className="flex-1 font-mono text-sm"
                    placeholder="#2B6CB0"
                  />
                </div>
                <div 
                  className="h-8 rounded-md border"
                  style={{ backgroundColor: theme.accent }}
                />
              </div>

              {/* Soft Color */}
              <div className="space-y-2">
                <Label htmlFor="soft">Cor Suave (Fundos)</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="soft"
                    value={theme.soft}
                    onChange={(e) => handleChange('soft', e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={theme.soft}
                    onChange={(e) => handleChange('soft', e.target.value)}
                    className="flex-1 font-mono text-sm"
                    placeholder="#F4F6F9"
                  />
                </div>
                <div 
                  className="h-8 rounded-md border"
                  style={{ backgroundColor: theme.soft }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Fonte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fontFamily">Família de Fonte</Label>
                <Select 
                  value={theme.fontFamily} 
                  onValueChange={(value) => handleChange('fontFamily', value)}
                >
                  <SelectTrigger id="fontFamily">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tamanhos de Fonte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fontSizeH1">Título Principal (H1)</Label>
                <Input
                  id="fontSizeH1"
                  value={theme.fontSizeH1}
                  onChange={(e) => handleChange('fontSizeH1', e.target.value)}
                  placeholder="28pt"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontSizeH2">Subtítulo (H2)</Label>
                <Input
                  id="fontSizeH2"
                  value={theme.fontSizeH2}
                  onChange={(e) => handleChange('fontSizeH2', e.target.value)}
                  placeholder="18pt"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontSizeBase">Texto Base</Label>
                <Input
                  id="fontSizeBase"
                  value={theme.fontSizeBase}
                  onChange={(e) => handleChange('fontSizeBase', e.target.value)}
                  placeholder="10pt"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lineHeight">Altura da Linha</Label>
                <Input
                  id="lineHeight"
                  value={theme.lineHeight}
                  onChange={(e) => handleChange('lineHeight', e.target.value)}
                  placeholder="1.5"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Espaçamentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="borderRadius">Arredondamento de Bordas</Label>
                <Input
                  id="borderRadius"
                  value={theme.borderRadius}
                  onChange={(e) => handleChange('borderRadius', e.target.value)}
                  placeholder="8px"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardPadding">Padding de Cards</Label>
                <Input
                  id="cardPadding"
                  value={theme.cardPadding}
                  onChange={(e) => handleChange('cardPadding', e.target.value)}
                  placeholder="16px"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
