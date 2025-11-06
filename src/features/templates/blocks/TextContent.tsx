import { RenderContext } from '../engine/schema';

interface TextContentProps {
  title?: string;
  content?: string;
  alignment?: 'left' | 'center' | 'right';
  context?: RenderContext;
}

/**
 * Bloco de Texto Livre
 * Permite inserir conteúdo personalizado com suporte a variáveis
 */
export function TextContent({ title, content, alignment = 'left', context }: TextContentProps) {
  if (!content) return null;

  const theme = context?.theme;
  const textAlign = alignment;

  return (
    <section className="template-block print-avoid-break" style={{ textAlign }}>
      {title && (
        <h2 
          className="text-lg font-semibold mb-3"
          style={{ color: theme?.primary }}
        >
          {title}
        </h2>
      )}
      <div 
        className="prose prose-sm max-w-none"
        style={{ 
          fontFamily: theme?.fontFamily,
          lineHeight: theme?.lineHeight,
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </section>
  );
}
