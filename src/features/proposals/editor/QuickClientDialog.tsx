import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
        </DialogHeader>
        <ClientForm onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
