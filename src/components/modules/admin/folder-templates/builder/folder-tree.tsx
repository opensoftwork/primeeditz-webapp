"use client";

import { FolderNode } from "./folder-node";
import { Button } from "@/components/ui/button";
import { Plus, LayoutTemplate } from "lucide-react";
import type { FolderLevel1, FolderLevel2, FolderLevel3 } from "@convex/schema";

interface FolderTreeProps {
  folders: FolderLevel1[];
  onAddRoot: () => void;
  onAddChild: (parentPath: string) => void;
  onEdit: (path: string, folder: FolderLevel1 | FolderLevel2 | FolderLevel3) => void;
  onDelete: (path: string) => void;
}

export function FolderTree({
  folders,
  onAddRoot,
  onAddChild,
  onEdit,
  onDelete,
}: FolderTreeProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
            <LayoutTemplate className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white/90">Folder Structure</h3>
            <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Manage your template hierarchy</p>
          </div>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onAddRoot} 
          className="h-9 px-4 gap-2 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Root Folder
        </Button>
      </div>

      <div className="space-y-6">
        {folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 border border-white/5 rounded-3xl bg-white/2">
            <div className="p-5 rounded-2xl bg-white/5 mb-6">
               <LayoutTemplate className="h-10 w-10 text-white/20" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Structure Empty</h3>
            <p className="text-xs text-white/30 font-medium mb-6">Start by adding your first root folder</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onAddRoot}
              className="bg-white/5 border-white/5 hover:bg-white/10 hover:text-white text-white/60 font-bold uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl transition-all"
            >
              Create Root Folder
            </Button>
          </div>
        ) : (
          folders.map((folder1, idx1) => (
            <div key={`${idx1}-${folder1.name}`} className="space-y-2">
              <FolderNode
                folder={folder1}
                level={1}
                path={`${idx1}`}
                onAddChild={onAddChild}
                onEdit={onEdit}
                onDelete={onDelete}
              />
              
              {folder1.children && folder1.children.length > 0 && (
                <div className="space-y-2 relative ml-5 pl-6 border-l border-white/10 pt-2 pb-1">
                  {folder1.children.map((folder2, idx2) => (
                    <div key={`${idx1}-${idx2}-${folder2.name}`} className="space-y-2 relative">
                      {/* Connector Line for Node */}
                      <div className="absolute top-4 -left-6 w-4 h-px bg-white/10" />
                      
                      <FolderNode
                        folder={folder2}
                        level={2}
                        path={`${idx1}.children.${idx2}`}
                        onAddChild={onAddChild}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />

                      {folder2.children && folder2.children.length > 0 && (
                        <div className="space-y-2 relative ml-4 pl-6 border-l border-white/10 pt-2 pb-1">
                          {folder2.children.map((folder3, idx3) => (
                            <div key={`${idx1}-${idx2}-${idx3}-${folder3.name}`} className="relative">
                              {/* Connector Line for Node */}
                              <div className="absolute top-4 -left-6 w-4 h-px bg-white/10" />
                              
                              <FolderNode
                                folder={folder3}
                                level={3}
                                path={`${idx1}.children.${idx2}.children.${idx3}`}
                                onEdit={onEdit}
                                onDelete={onDelete}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="pt-8 border-t border-white/5">
        <div className="flex items-center justify-center gap-2">
          <div className="h-1 w-1 rounded-full bg-white/20" />
          <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold text-center">
            Maximum 3 levels of nesting
          </p>
          <div className="h-1 w-1 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
}

