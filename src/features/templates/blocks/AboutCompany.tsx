import { RenderContext } from '../engine/schema';

interface AboutCompanyProps {
  title?: string;
  content?: string;
  showLogo?: boolean;
  context?: RenderContext;
}

/**
 * Bloco Sobre a Empresa
 * Seção dedicada para apresentar a empresa
 */
export function AboutCompany({ 
  title = 'Sobre a Empresa', 
  content, 
  showLogo = true,
  context 
}: AboutCompanyProps) {
  const org = context?.data?.organization;
  const theme = context?.theme;

  return (
    <section className="template-block print-avoid-break">
      <div 
        className="rounded-lg p-6"
        style={{ 
          backgroundColor: theme?.soft,
          borderLeft: `4px solid ${theme?.accent}`,
        }}
      >
        <div className="flex items-start gap-6">
          {showLogo && org?.logoUrl && (
            <img 
              src={org.logoUrl} 
              alt={org.name} 
              className="h-16 w-16 object-contain rounded-lg"
            />
          )}
          <div className="flex-1">
            <h2 
              className="text-lg font-semibold mb-3"
              style={{ color: theme?.primary }}
            >
              {title}
            </h2>
            <div 
              className="prose prose-sm max-w-none"
              style={{ 
                fontFamily: theme?.fontFamily,
                lineHeight: theme?.lineHeight,
              }}
            >
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <p>
                  A <strong>{org?.name}</strong> é especializada em soluções de automação e 
                  tecnologia, oferecendo produtos e serviços de alta qualidade para 
                  transformar ambientes residenciais e comerciais.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
