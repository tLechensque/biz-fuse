import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClientForm } from '@/pages/clients/ClientForm';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function QuickClientDialog({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
          <DialogDescription>
            Adicione um novo cliente para esta proposta
          </DialogDescription>
        </DialogHeader>
        <ClientForm onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
