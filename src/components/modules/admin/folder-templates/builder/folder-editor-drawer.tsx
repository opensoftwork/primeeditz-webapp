"use client";

import { useEffect, useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { FolderLevel1, FolderLevel2, FolderLevel3 } from "@convex/schema";

interface FolderEditorDrawerProps {
  folder: FolderLevel1 | FolderLevel2 | FolderLevel3 | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (folder: FolderLevel1 | FolderLevel2 | FolderLevel3) => void;
}

export function FolderEditorDrawer({
  folder,
  isOpen,
  onClose,
  onSave,
}: FolderEditorDrawerProps) {
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [description, setDescription] = useState("");
  const [isRequired, setIsRequired] = useState(false);

  useEffect(() => {
    if (folder) {
      setName(folder.name);
      setPath(folder.path);
      setDescription(folder.description || "");
      setIsRequired(folder.isRequired || false);
    }
  }, [folder, isOpen]);

  const handleSave = () => {
    if (!name.trim()) return;
    
    // In a real app, we might want to validate path format as well
    const finalPath = path.startsWith("/") ? path : `/${path}`;

    onSave({
      ...folder,
      name,
      path: finalPath,
      description: description || undefined,
      isRequired,
    } as any);
    onClose();
  };

  // Helper to auto-generate path from name if path is empty or matches previous auto-gen
  const handleNameChange = (newName: string) => {
    setName(newName);
    // Only auto-update if path hasn't been manually heavily edited? 
    // Simpler for now: just provide a suggestion button or let user edit.
  };

  const generatePathFromName = () => {
    const slug = name.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setPath(`/${slug}`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md bg-zinc-950 border-white/5 p-0 glass overflow-hidden">
        <SheetHeader className="px-8 pt-8 pb-6 border-b border-white/5 space-y-1">
          <SheetTitle className="text-2xl font-black uppercase tracking-tight font-sentient text-white">
            Edit folder
          </SheetTitle>
          <SheetDescription className="text-white/40 uppercase text-[10px] tracking-widest font-bold">
            Configure properties for this directory template.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 scrollbar-hide">
          <div className="space-y-2.5">
            <Label htmlFor="folder-name" className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
              Display Name
            </Label>
            <Input
              id="folder-name"
              placeholder="e.g. Wedding Raw Footage"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="bg-white/5 border-white/5 focus:border-primary/50 focus:ring-primary/20 h-12 rounded-xl text-sm transition-all shadow-inner"
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between ml-1">
              <Label htmlFor="folder-path" className="text-[10px] font-black uppercase tracking-widest text-white/50">
                Path (Internal Identifier)
              </Label>
              <Button 
                variant="link" 
                className="h-auto p-0 text-[10px] uppercase text-primary font-black tracking-widest hover:no-underline hover:text-primary/80"
                onClick={generatePathFromName}
              >
                Auto-generate
              </Button>
            </div>
            <Input
              id="folder-path"
              placeholder="/raw-footage"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="bg-white/5 border-white/5 focus:border-primary/50 focus:ring-primary/20 h-12 rounded-xl text-sm transition-all shadow-inner"
            />
            <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold ml-1">
              Used for matching file uploads to this folder.
            </p>
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="folder-desc" className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
              Description (Optional)
            </Label>
            <Textarea
              id="folder-desc"
              placeholder="Instructions for the client/editor..."
              className="bg-white/5 border-white/5 focus:border-primary/50 focus:ring-primary/20 resize-none h-32 rounded-xl text-sm transition-all p-4 shadow-inner"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/5 p-5 bg-white/2 transition-colors hover:bg-white/5">
            <div className="space-y-1">
              <Label className="text-sm font-black uppercase tracking-widest text-white/90">Require Upload</Label>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                Mark as mandatory to complete project stage.
              </p>
            </div>
            <Switch
              checked={isRequired}
              onCheckedChange={setIsRequired}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>

        <SheetFooter className="p-8 bg-zinc-950/50 border-t border-white/5 gap-3 sm:gap-0">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="flex-1 h-12 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-white/70 font-black uppercase tracking-widest text-[10px]"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || !path.trim()}
            className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

