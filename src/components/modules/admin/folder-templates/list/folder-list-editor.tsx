"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, GripVertical, Folder } from "lucide-react";
import { motion, Reorder, AnimatePresence } from "motion/react";

interface FolderListEditorProps {
  folders: string[];
  onChange: (folders: string[]) => void;
}

export function FolderListEditor({ folders, onChange }: FolderListEditorProps) {
  const [newFolder, setNewFolder] = useState("");

  const addFolder = () => {
    if (newFolder.trim() && !folders.includes(newFolder.trim())) {
      onChange([...folders, newFolder.trim()]);
      setNewFolder("");
    }
  };

  const removeFolder = (index: number) => {
    onChange(folders.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFolder();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
          Folder Structure
        </Label>
        <span className="text-[10px] font-black text-primary uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10">
          {folders.length} Folders
        </span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Folder className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
          <Input
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Raw Footage"
            className="bg-white/5 border-white/10 text-white h-12 rounded-2xl pl-12 focus:ring-primary/20 font-bold text-sm"
          />
        </div>
        <Button
          type="button"
          onClick={addFolder}
          disabled={!newFolder.trim() || folders.includes(newFolder.trim())}
          className="bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-2xl transition-all"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
        <Reorder.Group
          axis="y"
          values={folders}
          onReorder={onChange}
          className="space-y-2"
        >
          <AnimatePresence initial={false}>
            {folders.map((folder, index) => (
              <Reorder.Item
                key={folder}
                value={folder}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-colors">
                  <GripVertical className="h-4 w-4 text-white/20 group-hover:text-primary transition-colors" />
                </div>
                
                <span className="flex-1 text-sm font-bold text-white/80 group-hover:text-white transition-colors">
                  {folder}
                </span>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeFolder(index)}
                  className="h-8 w-8 p-0 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <X className="h-4 w-4" />
                </Button>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {folders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.01]">
            <Folder className="h-10 w-10 text-white/5 mb-3" />
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
              No folders added yet
            </p>
          </div>
        )}
      </div>
      
      <p className="text-[9px] text-white/20 font-medium px-1">
        Drag and drop folders to reorder. These will be created in the project root.
      </p>
    </div>
  );
}
