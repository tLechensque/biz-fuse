import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  images, 
  onImagesChange, 
  maxImages = 5 
}) => {
  const [uploading, setUploading] = useState(false);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: 'Limite de imagens excedido',
        description: `Você pode adicionar no máximo ${maxImages} imagens por produto.`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    const newImageUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Arquivo inválido',
            description: 'Por favor, selecione apenas arquivos de imagem.',
            variant: 'destructive',
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        newImageUrls.push(data.publicUrl);
      }

      onImagesChange([...images, ...newImageUrls]);
      
      toast({
        title: 'Imagens enviadas',
        description: `${newImageUrls.length} imagem(ns) adicionada(s) com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro no upload',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) {
      toast({
        title: 'URL inválida',
        description: 'Por favor, insira uma URL válida.',
        variant: 'destructive',
      });
      return;
    }

    if (images.length >= maxImages) {
      toast({
        title: 'Limite de imagens excedido',
        description: `Você pode adicionar no máximo ${maxImages} imagens por produto.`,
        variant: 'destructive',
      });
      return;
    }

    onImagesChange([...images, imageUrl]);
    setImageUrl('');
    setShowUrlDialog(false);
    
    toast({
      title: 'Imagem adicionada',
      description: 'A imagem foi adicionada com sucesso.',
    });
  };

  const removeImage = async (imageUrl: string, index: number) => {
    try {
      // Only try to delete from storage if it's a storage URL
      if (imageUrl.includes('supabase')) {
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `products/${fileName}`;

        await supabase.storage
          .from('product-images')
          .remove([filePath]);
      }

      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      
      toast({
        title: 'Imagem removida',
        description: 'A imagem foi removida com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao remover imagem',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Imagens do Produto</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {images.length}/{maxImages} imagens
          </span>
          {images.length < maxImages && (
            <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <LinkIcon className="h-4 w-4 mr-1" />
                  Adicionar URL
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Imagem por URL</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="url"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <Button type="button" onClick={handleAddImageUrl} className="w-full">
                    Adicionar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((imageUrl, index) => (
          <Card key={index} className="relative group overflow-hidden">
            <div className="aspect-square relative">
              <img
                src={imageUrl}
                alt={`Produto ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeImage(imageUrl, index)}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ))}

        {images.length < maxImages && (
          <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
            <div 
              className="aspect-square flex items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                {uploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground mb-2 mx-auto" />
                )}
                <p className="text-sm text-muted-foreground">
                  {uploading ? 'Enviando...' : 'Adicionar imagem'}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {images.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma imagem adicionada ainda</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-2"
          >
            Selecionar Imagens
          </Button>
        </div>
      )}
    </div>
  );
};