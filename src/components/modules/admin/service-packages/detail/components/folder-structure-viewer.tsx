"use client";

import { FolderTree, Folder, AlertCircle, File, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface FolderStructureViewerProps {
  folderStructure: any[];
  templateName: string;
}

export function FolderStructureViewer({
  folderStructure,
  templateName,
}: FolderStructureViewerProps) {
  if (!folderStructure || folderStructure.length === 0) return null;

  const totalFolders = countFolders(folderStructure);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/10 opacity-0 group-hover/folder:opacity-100 transition-opacity"
        >
          View Structure
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:w-[450px] border-l border-white/10 bg-zinc-950/95 backdrop-blur-2xl p-0 flex flex-col shadow-2xl"
      >
        <SheetHeader className="px-6 py-5 border-b border-white/5 bg-white/2">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]">
               <FolderTree className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-0.5">
              <SheetTitle className="text-sm font-black uppercase tracking-widest text-white leading-none">
                {templateName}
              </SheetTitle>
              <SheetDescription className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">
                Directory Hierarchy Preview
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden relative bg-linear-to-b from-zinc-900/50 to-zinc-950/50">
           {/* Top Fade */}
          <div className="absolute inset-x-0 top-0 h-8 bg-linear-to-b from-zinc-950 to-transparent z-10 pointer-events-none" />
          
          <ScrollArea className="h-full">
            <div className="p-6 pb-20 space-y-6">
              
              {/* Stats Card */}
              <div className="relative group overflow-hidden rounded-2xl bg-white/3 border border-white/5 p-4 transition-all duration-300 hover:bg-white/5 hover:border-white/10 hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-start gap-4 relative z-10">
                   <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                     <AlertCircle className="h-4 w-4" />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white/50">Summary</h4>
                      <p className="text-xs text-white/80 font-medium leading-relaxed">
                        This configuration will automatically provision <span className="text-white font-bold">{totalFolders} folders</span> across your storage architecture.
                      </p>
                   </div>
                </div>
              </div>

              {/* Tree View */}
              <div className="space-y-1 pl-1">
                 {folderStructure.map((folder, i) => (
                   <FolderItem 
                     key={i} 
                     folder={folder} 
                     level={0} 
                   />
                 ))}
              </div>

            </div>
          </ScrollArea>
           
           {/* Bottom Fade */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-zinc-950 to-transparent z-10 pointer-events-none" />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function FolderItem({
  folder,
  level,
}: {
  folder: any;
  level: number;
}) {
  const hasChildren = folder.children && folder.children.length > 0;
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="relative">
      <motion.div
        initial={false}
        className={cn(
          "group relative flex items-center pr-3 py-2 pl-3 rounded-xl transition-all duration-300 cursor-pointer border border-transparent select-none",
          "hover:bg-white/5 hover:border-white/5",
           // Active/Open state styling if needed, currently kept subtle
           isOpen && hasChildren ? "bg-white/2" : ""
        )}
        style={{ marginLeft: `${level * 16}px` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
         {/* Tree Connector Line (Vertical) */}
         {level > 0 && (
           <div 
             className="absolute left-[-8px] top-[-14px] bottom-1/2 w-px bg-white/5" 
             style={{ marginLeft: "0px" }}
           />
         )}
          {/* Tree Connector Line (Horizontal) */}
         {level > 0 && (
           <div 
             className="absolute left-[-8px] top-1/2 w-3 h-px bg-white/5" 
             style={{ marginLeft: "0px" }}
           />
         )}

        {/* Icon Container */}
        <div className={cn(
            "relative z-10 shrink-0 h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300 mr-3",
            folder.isRequired 
              ? "bg-red-500/5 text-red-500/60 group-hover:bg-red-500/10 group-hover:text-red-400"
              : "bg-white/5 text-white/30 group-hover:bg-white/10 group-hover:text-white/80 group-hover:scale-105"
        )}>
           <Folder 
             className={cn(
               "h-4 w-4 transition-transform duration-300", 
               folder.isRequired && "fill-red-500/10"
              )} 
           />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 py-0.5">
           <div className="flex items-center justify-between">
              <span className={cn(
                "text-[13px] font-medium tracking-tight transition-colors truncate",
                folder.isRequired ? "text-white/90" : "text-white/60 group-hover:text-white/90"
              )}>
                {folder.name}
              </span>
              
              {/* Expand/Collapse Chevron */}
              {hasChildren && (
                <ChevronRight className={cn(
                  "h-3 w-3 text-white/20 transition-transform duration-300 ml-2",
                  isOpen ? "rotate-90" : ""
                )} />
              )}
           </div>
        </div>

        {/* Required Badge */}
        {folder.isRequired && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <span className="text-[8px] font-black text-red-400 uppercase tracking-widest bg-zinc-950/80 px-1.5 py-0.5 rounded border border-red-500/20 backdrop-blur-sm">
               Required
             </span>
          </div>
        )}
        
        {/* Hover Glow Effect */}
         <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none">
            <div className="absolute inset-0 bg-linear-to-r from-white/5 to-transparent" />
         </div>
      </motion.div>

      {/* Children Recursion */}
      <AnimatePresence initial={false}>
        {hasChildren && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden relative"
          >
             {/* Continuous Vertical Line for Children Scope */}
             <div 
               className="absolute left-[19px] top-0 bottom-0 w-px bg-linear-to-b from-white/5 via-white/5 to-transparent" 
               style={{ marginLeft: `${level * 16}px` }}
             />
             
            <div>
              {folder.children.map((child: any, i: number) => (
                <FolderItem 
                  key={i} 
                  folder={child} 
                  level={level + 1} 
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to count total folders recursively
function countFolders(folders: any[]): number {
  let count = 0;
  for (const folder of folders) {
    count++;
    if (folder.children) {
      count += countFolders(folder.children);
    }
  }
  return count;
}
