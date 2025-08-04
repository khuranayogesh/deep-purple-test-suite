import { useState } from "react";
import { Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageViewerProps {
  src: string;
  alt: string;
  description?: string;
  className?: string;
}

export function ImageViewer({ src, alt, description, className = "" }: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={`relative group ${className}`}>
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-32 object-cover rounded border"
        />
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsOpen(true)}
        >
          <Eye className="h-4 w-4" />
        </Button>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 z-10"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img 
              src={src} 
              alt={alt} 
              className="w-full max-h-[80vh] object-contain rounded"
            />
            {description && (
              <p className="text-sm text-muted-foreground mt-2">{description}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}