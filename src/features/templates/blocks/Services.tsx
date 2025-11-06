import { RenderContext } from '../engine/schema';
import { CheckCircle } from 'lucide-react';

interface ServicesProps {
  title?: string;
  services?: string[];
  layout?: 'list' | 'grid';
  context?: RenderContext;
}

/**
 * Bloco de Serviços
 * Lista os serviços oferecidos pela empresa
 */
export function Services({ 
  title = 'Nossos Serviços', 
  services = [],
  layout = 'list',
  context 
}: ServicesProps) {
  const theme = context?.theme;

  const defaultServices = [
    'Instalação e Configuração de Sistemas',
    'Suporte Técnico Especializado',
    'Manutenção Preventiva e Corretiva',
    'Treinamento de Usuários',
    'Consultoria em Automação',
    'Garantia Estendida',
  ];

  const serviceList = services.length > 0 ? services : defaultServices;

  return (
    <section className="template-block print-avoid-break">
      <h2 
        className="text-lg font-semibold mb-4"
        style={{ color: theme?.primary }}
      >
        {title}
      </h2>
      <div 
        className={layout === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-2'}
      >
        {serviceList.map((service, index) => (
          <div 
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg"
            style={{ backgroundColor: theme?.soft }}
          >
            <CheckCircle 
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: theme?.accent }}
            />
            <span 
              className="text-sm"
              style={{ 
                fontFamily: theme?.fontFamily,
                lineHeight: theme?.lineHeight,
              }}
            >
              {service}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
