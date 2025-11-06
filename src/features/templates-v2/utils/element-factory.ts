import { Element } from '../runtime/props-schema';

export function createElementByType(type: string): Element | null {
  switch (type) {
    case 'Frame':
      return {
        type: 'Frame',
        style: {
          padding: '16px',
          background: 'white',
          borderRadius: '8px',
        },
        children: [],
      };

    case 'Stack':
      return {
        type: 'Stack',
        direction: 'column',
        gap: '16px',
        children: [],
      };

    case 'Grid':
      return {
        type: 'Grid',
        cols: 2,
        gap: '16px',
        children: [],
      };

    case 'Text':
      return {
        type: 'Text',
        content: 'Texto de exemplo',
        fontSize: 'var(--text-base)',
      };

    case 'Image':
      return {
        type: 'Image',
        src: 'https://via.placeholder.com/300x200',
        style: {
          width: '300px',
          height: '200px',
        },
      };

    case 'Table':
      return {
        type: 'Table',
        columns: [
          { key: 'col1', label: 'Coluna 1', width: '50%' },
          { key: 'col2', label: 'Coluna 2', width: '50%' },
        ],
        dataBinding: { path: 'items' },
      };

    case 'Divider':
      return {
        type: 'Divider',
      };

    case 'Repeater':
      return {
        type: 'Repeater',
        dataBinding: { path: 'items' },
        children: [],
      };

    default:
      return null;
  }
}
