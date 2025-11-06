import React from 'react';
import { Element } from '../runtime/props-schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight, ChevronDown, Frame, Type, Image as ImageIcon, Table as TableIcon, Minus, Grid as GridIcon, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayersPanelProps {
  root: Element;
  selectedPath: string | null;
  onSelect: (path: string) => void;
}

export function LayersPanel({ root, selectedPath, onSelect }: LayersPanelProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(['']));

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpanded(newExpanded);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Frame': return <Frame className="w-4 h-4" />;
      case 'Stack': return <Layers className="w-4 h-4" />;
      case 'Grid': return <GridIcon className="w-4 h-4" />;
      case 'Text': return <Type className="w-4 h-4" />;
      case 'Image': return <ImageIcon className="w-4 h-4" />;
      case 'Table': return <TableIcon className="w-4 h-4" />;
      case 'Divider': return <Minus className="w-4 h-4" />;
      default: return <Frame className="w-4 h-4" />;
    }
  };

  const renderLayer = (element: Element, path: string, depth: number = 0) => {
    const hasChildren = 'children' in element && element.children && element.children.length > 0;
    const isExpanded = expanded.has(path);
    const isSelected = selectedPath === path;

    return (
      <div key={path}>
        <Button
          variant={isSelected ? "secondary" : "ghost"}
          size="sm"
          className="w-full justify-start gap-2 h-8"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => onSelect(path)}
        >
          {hasChildren && (
            <span onClick={(e) => { e.stopPropagation(); toggleExpand(path); }}>
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </span>
          )}
          {!hasChildren && <span className="w-3" />}
          {getIcon(element.type)}
          <span className="text-xs">{element.type}</span>
          {element.id && <span className="text-xs text-muted-foreground">#{element.id}</span>}
        </Button>
        
        {hasChildren && isExpanded && (
          <div>
            {(element as any).children.map((child: Element, index: number) => 
              renderLayer(child, `${path}.children[${index}]`, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Layers</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="p-2 space-y-1">
            {renderLayer(root, '', 0)}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
