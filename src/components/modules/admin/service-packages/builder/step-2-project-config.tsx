"use client";

import { useEffect } from "react";
import { api } from "@convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "convex/react";
import { Info, Plus, Package, Layers } from "lucide-react";
import { nanoid } from "nanoid";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBuilder } from "./builder-context";
import { ProjectConfigCard } from "./components/project-config-card";

const projectConfigSchema = z.object({
  id: z.string(),
  label: z.string().max(50, "Label too long"),
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
  const { step2Data, setStep2Data, setCurrentStep, setSubmitTrigger } =
    useBuilder();

  // Queries
  const projectTypes = useQuery(api.functions.projectTypes.queries.list) || [];
  const storageTiers =
    useQuery(api.functions.storageTiers.queries.listStorageTiers) || [];

  const form = useForm({
    defaultValues: {
      projectConfigs: step2Data?.projectConfigs ?? [
        {
          id: nanoid(),
          label: "Primary Project",
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
      setCurrentStep(3);
    },
  });

  // Register submit trigger
  useEffect(() => {
    setSubmitTrigger(() => form.handleSubmit());
    return () => setSubmitTrigger(null);
  }, [form, setSubmitTrigger]);

  return (
    <div className="max-w-7xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 space-y-2 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center justify-center gap-4">
          <Layers className="h-8 w-8 text-primary" />
          Project Configuration
        </h2>
        <p className="text-white/40 font-medium text-sm">
          Define what projects get created when this package is selected. A
          single package can spawn multiple separate projects.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Form Column */}
        <div className="lg:col-span-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-8"
          >
            <form.Field name="projectConfigs" mode="array">
              {(field) => (
                <div className="space-y-8">
                  {field.state.value.map((_, index) => (
                    <ProjectConfigCard
                      key={field.state.value[index].id}
                      form={form}
                      index={index}
                      onRemove={() => field.removeValue(index)}
                      canRemove={field.state.value.length > 1}
                      projectTypes={projectTypes}
                      storageTiers={storageTiers}
                    />
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-20 border-dashed border-white/5 hover:border-primary/50 hover:bg-primary/5 bg-white/2 rounded-[24px] text-white/40 hover:text-primary transition-all group"
                    onClick={() =>
                      field.pushValue({
                        id: nanoid(),
                        label: "",
                        projectTypeId: "",
                        folderTemplateId: "",
                        defaultStorageTierId: "",
                      })
                    }
                  >
                    <Plus className="h-6 w-6 mr-4 group-hover:scale-110 transition-transform" />
                    <span className="font-black uppercase tracking-[0.2em] text-[10px]">
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
          <div className="flex items-center gap-2 ml-1">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="text-[10px] font-black text-white/60 uppercase tracking-widest">
              Package Preview
            </h3>
          </div>

          <Card className="bg-zinc-900/40 border-white/5 rounded-[32px] overflow-hidden glass-subtle flex flex-col min-h-[400px]">
            <div className="p-6 border-b border-white/5">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                Unit Summary
              </p>
              <h4 className="text-sm font-black text-white uppercase tracking-tight mt-1 flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Spawned Projects
              </h4>
            </div>

            <div className="p-6 flex-1 space-y-4">
              <form.Subscribe selector={(state) => state.values.projectConfigs}>
                {(configs) => {
                  const validConfigs = configs.filter(
                    (c) => c.projectTypeId && c.folderTemplateId,
                  );

                  if (validConfigs.length === 0) {
                    return (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                          <Layers className="h-6 w-6 text-white/10" />
                        </div>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-loose">
                          No valid configurations
                          <br />
                          defined yet
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {validConfigs.map((config, i) => {
                        const type = projectTypes.find(
                          (t) => t._id === config.projectTypeId,
                        );
                        return (
                          <div
                            key={config.id}
                            className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 animate-in fade-in slide-in-from-right-2 duration-300"
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
                            <div className="flex items-center gap-2">
                              <div className="h-1 w-1 rounded-full bg-primary/40" />
                              <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                                Folder structure configured
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      <div className="pt-4 mt-6 border-t border-white/5">
                        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
                          <span className="text-[10px] font-bold text-primary/80 uppercase tracking-widest">
                            Total Projects
                          </span>
                          <span className="text-sm font-black text-primary">
                            {validConfigs.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </form.Subscribe>
            </div>
          </Card>

          <div className="p-6 bg-blue-500/5 rounded-[24px] border border-blue-500/10 space-y-3">
            <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
              <Info className="h-3 w-3" />
              Pro Tip
            </h5>
            <p className="text-[10px] font-medium text-blue-400/60 leading-relaxed uppercase tracking-wider">
              Use descriptive labels like "Hero Video" or "Social Cut" if your
              package spawns multiple projects of the same type.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
