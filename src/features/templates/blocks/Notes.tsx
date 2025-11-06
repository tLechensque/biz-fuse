import { RenderContext } from '../engine/schema';

export function Notes({ context }: { context: RenderContext }) {
  const { data } = context;

  if (!data.notes || data.notes.length === 0) {
    return null;
  }

  return (
    <div className="template-block print-avoid-break">
      <h2 className="text-2xl font-bold text-foreground mb-4">Observações</h2>

      <ul className="space-y-2 list-disc list-inside text-sm">
        {data.notes.map((note, idx) => (
          <li key={idx} className="text-muted-foreground">
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
}
