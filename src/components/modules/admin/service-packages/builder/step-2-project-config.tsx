"use client";

import { useEffect } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "convex/react";
import { Info, Plus, Package, Layers } from "lucide-react";
import { nanoid } from "nanoid";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useBuilder } from "./builder-context";
import { ProjectConfigCard } from "./components/project-config-card";

const projectConfigSchema = z.object({
  id: z.string(),
  label: z.string().max(50, "Label too long"),
  categoryId: z.string().min(1, "Category is required"),
  projectTypeId: z.string().min(1, "Project type is required"),
  folderTemplateId: z.string().min(1, "Folder template is required"),
  defaultStorageTierId: z.string().optional(),
});

const step2Schema = z.object({
  projectConfigs: z
    .array(projectConfigSchema)
    .min(1, "At least one project configuration is required"),
});

type Step2FormValues = z.infer<typeof step2Schema>;
export function Step2ProjectConfig() {
  const { step2Data, setStep2Data, setCurrentStep, setSubmitTrigger, setSyncCurrentStep, isEditor } =
    useBuilder();

  // Queries
  const projectTypes = useQuery(api.functions.projectTypes.queries.list) || [];
  const storageTiers =
    useQuery(api.functions.storageTiers.queries.listStorageTiers) || [];
  const categories =
    useQuery(api.functions.projectCategories.queries.getProjectCategories) || [];

  const form = useForm({
    defaultValues: {
      projectConfigs: step2Data?.projectConfigs ?? [
        {
          id: nanoid(),
          label: "Primary Project",
          categoryId: "",
          projectTypeId: "",
          folderTemplateId: "",
          defaultStorageTierId: "",
        },
      ],
    } as Step2FormValues,
    validators: {
      onChange: step2Schema,
    },
    onSubmit: async ({ value }) => {
      setStep2Data({
        projectConfigs: value.projectConfigs as any,
      });
      if (!isEditor) {
        setCurrentStep(3);
      }
    },
  });

  // Register submit trigger
  useEffect(() => {
    setSubmitTrigger(() => () => form.handleSubmit());
    return () => setSubmitTrigger(null);
  }, [form, setSubmitTrigger]);

  // Register sync callback - saves form data to context before navigation
  useEffect(() => {
    setSyncCurrentStep(() => () => {
      const values = form.state.values;
      setStep2Data({
        projectConfigs: values.projectConfigs as any,
      });
    });
    return () => setSyncCurrentStep(null);
  }, [form, setStep2Data, setSyncCurrentStep]);

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header Section - Matching Step 1 */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-8 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/60">
            Fulfillment Architecture
          </span>
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
          Project Configuration
        </h2>
        <p className="text-xs font-semibold text-white/40 max-w-lg leading-relaxed">
          Define what projects get created when this package is selected. A single package can spawn multiple separate projects.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Form Column */}
        <div className="lg:col-span-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field name="projectConfigs" mode="array">
              {(field) => (
                <div className="space-y-6">
                  {field.state.value.map((_, index) => (
                    <ProjectConfigCard
                      key={field.state.value[index].id}
                      form={form}
                      index={index}
                      onRemove={() => field.removeValue(index)}
                      canRemove={field.state.value.length > 1}
                      projectTypes={projectTypes}
                      storageTiers={storageTiers}
                      categories={categories}
                    />
                  ))}

                  {/* Add Button - Matching Step 1 aesthetic */}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      field.pushValue({
                        id: nanoid(),
                        label: "",
                        categoryId: "",
                        projectTypeId: "",
                        folderTemplateId: "",
                        defaultStorageTierId: "",
                      })
                    }
                    className={cn(
                      "group w-full h-16 rounded-2xl border border-dashed border-white/10",
                      "bg-black/20 hover:bg-black/30 hover:border-primary/30",
                      "flex items-center justify-center gap-3 transition-all duration-300"
                    )}
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Plus className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-primary transition-colors">
                      Add Another Project Configuration
                    </span>
                  </Button>
                </div>
              )}
            </form.Field>
          </form>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-8 space-y-6">
            <div className="flex items-center gap-2 ml-1">
              <Info className="h-4 w-4 text-primary" />
              <h3 className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                Package Preview
              </h3>
            </div>

            <Card className="bg-zinc-900/30 border-white/5 rounded-3xl backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[32px_32px] pointer-events-none" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none" />

              <div className="relative p-6 space-y-5">
                <div className="border-b border-white/5 pb-4">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                    Unit Summary
                  </p>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight mt-1 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Spawned Projects
                  </h4>
                </div>

                <div className="space-y-3">
                  <form.Subscribe selector={(state) => state.values.projectConfigs}>
                    {(configs) => {
                      const validConfigs = configs.filter(
                        (c) => c.projectTypeId && c.folderTemplateId,
                      );

                      if (validConfigs.length === 0) {
                        return (
                          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                              <Layers className="h-6 w-6 text-white/10" />
                            </div>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-loose">
                              No valid configurations<br />defined yet
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-2">
                          {validConfigs.map((config, i) => {
                            const type = projectTypes.find(
                              (t) => t._id === config.projectTypeId,
                            );
                            return (
                              <div
                                key={config.id}
                                className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-2 animate-in fade-in slide-in-from-right-2 duration-300"
                                style={{ animationDelay: `${i * 100}ms` }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black text-white uppercase tracking-tight">
                                    {config.label || `Project ${i + 1}`}
                                  </span>
                                  <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full">
                                    {type?.name || "Unknown Type"}
                                  </Badge>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-primary/40" />
                                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                                      Folder structure configured
                                    </span>
                                  </div>
                                  {config.defaultStorageTierId && (
                                    <div className="flex items-center gap-2">
                                      <div className="h-1 w-1 rounded-full bg-green-500/40" />
                                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                                        Storage: {storageTiers.find(s => s._id === config.defaultStorageTierId)?.name} 
                                        ({storageTiers.find(s => s._id === config.defaultStorageTierId)?.sizeGB}GB)
                                      </span>
                                    </div>
                                  )}
                                  {!config.defaultStorageTierId && (
                                    <div className="flex items-center gap-2">
                                      <div className="h-1 w-1 rounded-full bg-zinc-500/40" />
                                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                                        No Default Storage
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }}
                  </form.Subscribe>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <form.Subscribe selector={(state) => state.values.projectConfigs}>
                    {(configs) => (
                      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
                        <span className="text-[10px] font-bold text-primary/80 uppercase tracking-widest">
                          Total Projects
                        </span>
                        <span className="text-sm font-black text-primary">
                          {configs.filter((c) => c.projectTypeId && c.folderTemplateId).length}
                        </span>
                      </div>
                    )}
                  </form.Subscribe>
                </div>
              </div>
            </Card>

            <div className="p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10 space-y-2">
              <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <Info className="h-3 w-3" />
                Pro Tip
              </h5>
              <p className="text-[10px] font-medium text-blue-400/60 leading-relaxed">
                Use descriptive labels like "Hero Video" or "Social Cut" if your package spawns multiple projects of the same type.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
