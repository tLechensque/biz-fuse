import { VARIABLE_GROUPS } from '@/features/templates/engine/variables';

/**
 * Gera e baixa um arquivo com todas as variáveis disponíveis
 */
export function exportVariablesList(format: 'txt' | 'csv' | 'json' = 'txt') {
  const timestamp = new Date().toISOString().split('T')[0];
  
  if (format === 'txt') {
    const content = generateTextFormat();
    downloadFile(content, `starvai-variaveis-${timestamp}.txt`, 'text/plain');
  } else if (format === 'csv') {
    const content = generateCsvFormat();
    downloadFile(content, `starvai-variaveis-${timestamp}.csv`, 'text/csv');
  } else {
    const content = generateJsonFormat();
    downloadFile(content, `starvai-variaveis-${timestamp}.json`, 'application/json');
  }
}

function generateTextFormat(): string {
  let content = '='.repeat(60) + '\n';
  content += '  STARVAI - LISTA DE VARIÁVEIS PARA TEMPLATES\n';
  content += '='.repeat(60) + '\n\n';
  content += 'Como usar: Digite {{variavel}} nos campos de texto do template\n';
  content += 'Exemplo: {{organization.name}} ou {{client.email}}\n\n';
  
  VARIABLE_GROUPS.forEach((group) => {
    content += '\n' + '-'.repeat(60) + '\n';
    content += `${group.label}\n`;
    content += '-'.repeat(60) + '\n\n';
    
    group.variables.forEach((variable) => {
      content += `  {{${variable.key}}}\n`;
      content += `    ${variable.description}\n`;
      if (variable.example) {
        content += `    Exemplo: ${variable.example}\n`;
      }
      content += '\n';
    });
  });
  
  content += '\n' + '='.repeat(60) + '\n';
  content += 'Total de variáveis: ' + VARIABLE_GROUPS.reduce((acc, g) => acc + g.variables.length, 0) + '\n';
  content += '='.repeat(60) + '\n';
  
  return content;
}

function generateCsvFormat(): string {
  let content = 'Grupo,Variável,Descrição,Exemplo\n';
  
  VARIABLE_GROUPS.forEach((group) => {
    group.variables.forEach((variable) => {
      const row = [
        group.label,
        variable.key,
        variable.description,
        variable.example || '',
      ].map(escapeCSV).join(',');
      content += row + '\n';
    });
  });
  
  return content;
}

function generateJsonFormat(): string {
  const data = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    description: 'Lista de variáveis disponíveis para templates Starvai',
    usage: 'Use {{variavel}} nos campos de texto. Exemplo: {{organization.name}}',
    groups: VARIABLE_GROUPS.map((group) => ({
      label: group.label,
      variables: group.variables.map((v) => ({
        key: v.key,
        description: v.description,
        example: v.example,
      })),
    })),
  };
  
  return JSON.stringify(data, null, 2);
}

function escapeCSV(str: string): string {
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType + ';charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
