"use client";

import { HardDrive, Pencil, Layers, Rocket, Database, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useBuilder } from "../../builder-context";
import { FolderPreview } from "../../components/folder-preview";

interface ConfigSummaryProps {
  projectTypes: any[];
  categories: any[];
  storageTiers: any[];
}

export function ConfigSummary({
  projectTypes,
  categories,
  storageTiers,
}: ConfigSummaryProps) {
  const { step2Data, setCurrentStep } = useBuilder();

  return (
    <div className="group space-y-4">
      <div className="flex items-center justify-between ml-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <HardDrive className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-[10px] font-black text-white/60 uppercase tracking-widest">
            Project Config Summary
          </h3>
        </div>
        <button
          onClick={() => setCurrentStep(2)}
          className="h-8 px-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {step2Data?.projectConfigs.map((config, index) => {
          const type = projectTypes.find((t) => t._id === config.projectTypeId);
          const tier = storageTiers.find(
            (t) => t._id === config.defaultStorageTierId,
          );

          return (
            <Card
              key={config.id}
              className="group bg-zinc-900/40 border-white/5 rounded-[24px] overflow-hidden glass-subtle hover:border-primary/20 transition-all duration-300 shadow-xl p-0 lg:col-span-2"
            >
              <CardContent className="p-0">
                {/* Compact Header */}
                <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Layers className="h-3 w-3 text-primary" />
                    </div>
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">
                      {config.label || "Untitled Project"}
                    </h4>
                  </div>
                  <Badge className="bg-white/5 text-white/40 border-white/10 font-bold text-[8px] uppercase tracking-[0.2em] px-2 py-0 rounded-sm leading-none h-5 flex items-center">
                    CFG {(index + 1).toString().padStart(2, "0")}
                  </Badge>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {/* Metadata Details - Left Side */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-1.5">
                          <Rocket className="h-2.5 w-2.5 text-primary/60" />{" "}
                          Framework
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {config.categoryId && (
                            <Badge className="bg-white/5 text-white/60 border-white/10 font-bold text-[8px] uppercase tracking-widest px-2 py-1 rounded-md">
                              {
                                categories.find((c) => c._id === config.categoryId)
                                  ?.name
                              }
                            </Badge>
                          )}
                          <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[9px] uppercase tracking-widest px-2 py-1 rounded-md">
                            {type?.name || "Standard"}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-1.5">
                          <HardDrive className="h-2.5 w-2.5 text-primary/60" />{" "}
                          Storage
                        </p>
                        <div className="flex items-center gap-2">
                          <Database className="h-3 w-3 text-primary/40" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                            {tier?.name || "Dynamic"}
                          </span>
                          <span className="text-[10px] text-white/20">•</span>
                          <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">
                            {tier?.sizeGB || "Uncapped"} GB
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Folder Structure - Right Side */}
                    <div className="relative pl-6 md:border-l border-white/5 flex flex-col justify-center space-y-3">
                      <div className="space-y-1">
                        <h5 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                          <FolderTree className="h-3.5 w-3.5 text-primary" />
                          Folder Hierarchy
                        </h5>
                        <p className="text-[9px] text-white/30 font-medium max-w-[200px] leading-relaxed">
                          Includes standardized directory structure for{" "}
                          {type?.name || "this project type"}.
                        </p>
                      </div>

                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-fit h-7 text-[9px] uppercase font-black tracking-[0.2em] bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30 text-white/60 hover:text-white rounded-lg transition-all px-3"
                          >
                            View Structure
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-xl bg-zinc-950 border-l border-white/10 p-0 shadow-2xl">
                          <SheetHeader className="p-8 border-b border-white/10 bg-zinc-900/20 backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <FolderTree className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <SheetTitle className="text-xl font-black uppercase tracking-tight text-white leading-none">
                                  Hierarchy Architecture
                                </SheetTitle>
                                <SheetDescription className="text-[9px] text-primary/60 font-black uppercase tracking-widest mt-2">
                                  {config.label || "Project Configuration"}
                                </SheetDescription>
                              </div>
                            </div>
                          </SheetHeader>
                          <div className="h-[calc(100vh-130px)] overflow-y-auto custom-scrollbar p-6">
                            <FolderPreview templateId={config.folderTemplateId} />
                          </div>
                        </SheetContent>
                      </Sheet>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
