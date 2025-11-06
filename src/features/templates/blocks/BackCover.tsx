import { RenderContext } from '../engine/schema';

interface BackCoverProps {
  content?: string;
  showContact?: boolean;
  context?: RenderContext;
}

/**
 * Bloco de Contracapa
 * Página final da proposta com informações de contato
 */
export function BackCover({ 
  content, 
  showContact = true,
  context 
}: BackCoverProps) {
  const org = context?.data?.organization;
  const theme = context?.theme;

  return (
    <section 
      className="template-block template-block-cover print-break-before"
      style={{ 
        backgroundColor: theme?.primary,
        color: 'white',
        minHeight: '200mm',
      }}
    >
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        {org?.logoUrl && (
          <img 
            src={org.logoUrl} 
            alt={org.name} 
            className="h-20 w-auto mb-8 brightness-0 invert"
          />
        )}
        
        <h1 className="text-3xl font-bold mb-6">
          {org?.name}
        </h1>

        {content && (
          <div 
            className="max-w-2xl mb-8 text-lg opacity-90"
            style={{ lineHeight: theme?.lineHeight }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}

        {showContact && (
          <div className="space-y-2 text-sm opacity-80">
            {org?.email && <div>{org.email}</div>}
            {org?.phone && <div>{org.phone}</div>}
            {org?.whatsapp && <div>WhatsApp: {org.whatsapp}</div>}
            {org?.address && <div className="mt-4">{org.address}</div>}
          </div>
        )}
      </div>
    </section>
  );
}
