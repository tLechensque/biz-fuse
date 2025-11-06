-- Adiciona 'blocks' aos tipos de template permitidos
ALTER TABLE proposal_templates 
DROP CONSTRAINT IF EXISTS proposal_templates_template_type_check;

ALTER TABLE proposal_templates 
ADD CONSTRAINT proposal_templates_template_type_check 
CHECK (template_type = ANY (ARRAY['simple'::text, 'html'::text, 'visual'::text, 'blocks'::text]));