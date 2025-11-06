import { LayoutSettings } from '@/features/templates/engine/schema';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LayoutCustomizerProps {
  layout: LayoutSettings;
  onUpdateLayout: (layout: LayoutSettings) => void;
}

/**
 * Customizador de Layout
 * Permite configurar cabeçalho/rodapé fixos e espaçamentos
 */
export function LayoutCustomizer({ layout, onUpdateLayout }: LayoutCustomizerProps) {
  const handleChange = (path: string, value: any) => {
    const keys = path.split('.');
    const updated = { ...layout };
    let current: any = updated;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onUpdateLayout(updated);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Cabeçalho</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="header-enabled">Ativar cabeçalho fixo</Label>
            <Switch
              id="header-enabled"
              checked={layout.header?.enabled || false}
              onCheckedChange={(checked) => handleChange('header.enabled', checked)}
            />
          </div>

          {layout.header?.enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="header-content">Conteúdo (HTML/Variáveis)</Label>
                <Textarea
                  id="header-content"
                  value={layout.header?.content || ''}
                  onChange={(e) => handleChange('header.content', e.target.value)}
                  placeholder="<div>{{organization.name}}</div>"
                  rows={3}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="header-height">Altura</Label>
                <Input
                  id="header-height"
                  value={layout.header?.height || '60px'}
                  onChange={(e) => handleChange('header.height', e.target.value)}
                  placeholder="60px"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Rodapé</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="footer-enabled">Ativar rodapé fixo</Label>
            <Switch
              id="footer-enabled"
              checked={layout.footer?.enabled || false}
              onCheckedChange={(checked) => handleChange('footer.enabled', checked)}
            />
          </div>

          {layout.footer?.enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="footer-content">Conteúdo (HTML/Variáveis)</Label>
                <Textarea
                  id="footer-content"
                  value={layout.footer?.content || ''}
                  onChange={(e) => handleChange('footer.content', e.target.value)}
                  placeholder="<div>{{organization.email}} | {{organization.phone}}</div>"
                  rows={3}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer-height">Altura</Label>
                <Input
                  id="footer-height"
                  value={layout.footer?.height || '60px'}
                  onChange={(e) => handleChange('footer.height', e.target.value)}
                  placeholder="60px"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Espaçamentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="page-margin">Margem da Página</Label>
            <Input
              id="page-margin"
              value={layout.pageMargin || '18mm'}
              onChange={(e) => handleChange('pageMargin', e.target.value)}
              placeholder="18mm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="block-spacing">Espaçamento entre Blocos</Label>
            <Input
              id="block-spacing"
              value={layout.blockSpacing || '24px'}
              onChange={(e) => handleChange('blockSpacing', e.target.value)}
              placeholder="24px"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
