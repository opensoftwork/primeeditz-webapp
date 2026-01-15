"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Eye, ArrowLeft, Info, Sparkles, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import {
  hasAlbumConfig,
  filterAlbumFields,
  type FieldValue,
} from "@/components/shared/dynamic-form-fields";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { Id } from "@convex/_generated/dataModel";
import Link from "next/link";
import { FormFieldWrapper } from "../../projects/wizard/steps/step-2-details/form-field-wrapper";
import { AlbumConfigSection } from "../../projects/wizard/steps/step-2-details/album-config-section";

export function ProjectTypePreview() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as Id<"projectTypes">;

  const projectType = useQuery(
    api.functions.projectTypes.queries.getProjectTypeWithFields,
    { projectTypeId: id }
  );

  const form = useForm({
    defaultValues: {} as Record<string, FieldValue>,
  });

  if (projectType === undefined) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-7xl space-y-8 animate-pulse text-center">
          <Skeleton className="h-12 w-64 bg-white/5 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-20 bg-white/5 rounded-2xl" />
            <Skeleton className="h-20 bg-white/5 rounded-2xl" />
          </div>
          <Skeleton className="h-[600px] w-full bg-white/5 rounded-[4rem]" />
        </div>
      </div>
    );
  }

  if (!projectType) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <Info className="h-12 w-12 text-white/10 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">
          Project Type Not Found
        </h2>
        <Button variant="link" asChild className="text-primary">
          <Link href="/settings/project-types">Back to Project Types</Link>
        </Button>
      </div>
    );
  }

  const activeFields = (projectType.fields || []).filter((f) => f.isActive);
  const isAlbumProject = hasAlbumConfig(activeFields);
  const displayFields = filterAlbumFields(activeFields);

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-primary/30">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="w-full mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all"
            >
              <Link href={`/settings/project-types/${id}`}>
                <ArrowLeft className="h-4 w-4 text-white/60" />
              </Link>
            </Button>

            <div className="h-8 w-px bg-white/5 hidden md:block" />

            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-2 py-0.5 rounded">
                  Live Preview
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hidden sm:inline">
                  • Stage Mode
                </span>
              </div>
              <h1 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                {projectType.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-white/3 border border-white/5">
              <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-primary/80">
                Production Grade Rendering
              </span>
            </div>
            <Button
              variant="outline"
              disabled
              className="h-10 border-white/10 bg-white/5 text-white/40 font-bold uppercase tracking-widest text-[10px] px-6 hidden sm:flex"
            >
              <Layout className="mr-2 h-4 w-4" />
              Preview Config
            </Button>
          </div>
        </div>
      </header>

      <main className="w-full mx-auto p-6 md:p-12 lg:p-16">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Form Content */}
          <div className="w-full space-y-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 text-center"
            >
              <h2 className="text-4xl font-black uppercase tracking-tighter lg:text-6xl">
                Step 2: <span className="text-primary">Configuration</span>
              </h2>
              <p className="text-lg text-white/40 max-w-2xl mx-auto font-medium leading-relaxed">
                This is how the configuration step will appear to your clients.
                Interact with the fields below to verify the logic and
                validation rules.
              </p>
            </motion.div>

            {activeFields.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2 backdrop-blur-sm">
                <div className="h-20 w-20 rounded-3xl bg-white/5 flex items-center justify-center mb-8">
                  <Info className="h-10 w-10 text-white/10" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                  Stage is Empty
                </h3>
                <p className="text-white/20 font-bold uppercase tracking-[0.2em] text-xs max-w-xs leading-relaxed">
                  Go back and add some fields to see the live rendering in this
                  preview.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => e.preventDefault()}
                className="space-y-20 p-12 md:p-20 rounded-[4rem] bg-white/3 border border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden"
              >
                {/* Subtle Decorative Glows */}
                <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl opacity-50" />
                <div className="absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl opacity-50" />

                <FieldSet className="w-full border-none p-0 relative">
                  <FieldGroup className="space-y-12">
                    <div className="grid gap-x-12 gap-y-16 md:grid-cols-2">
                      {displayFields.map((fieldDef, index) => (
                        <motion.div
                          key={fieldDef._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className={cn(
                            "w-full",
                            fieldDef.type === "textarea" ? "md:col-span-2" : ""
                          )}
                        >
                          <FormFieldWrapper
                            form={form}
                            fieldDef={fieldDef}
                            isAlbumCountField={
                              isAlbumProject && fieldDef.name === "albumCount"
                            }
                          />
                        </motion.div>
                      ))}
                    </div>

                    {isAlbumProject && (
                      <form.Subscribe
                        selector={(state) =>
                          (state.values as Record<string, unknown>)
                            .albumCount as number
                        }
                      >
                        {(albumCount) => (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <AlbumConfigSection
                              form={form}
                              albumCount={albumCount ?? 0}
                            />
                          </motion.div>
                        )}
                      </form.Subscribe>
                    )}
                  </FieldGroup>
                </FieldSet>

                <div className="pt-20 border-t border-white/5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-primary">
                      Onboarding Flow
                    </p>
                    <p className="text-base font-bold text-white/40">
                      Step 2 of 5 Complete
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                        Preview Logic Active
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        Submissions Disabled
                      </p>
                    </div>
                    <Button
                      disabled
                      className="h-16 bg-primary/40 text-white font-black uppercase tracking-widest text-xs px-12 rounded-2xl"
                    >
                      Continue Wizard
                    </Button>
                  </div>
                </div>
              </form>
            )}

            <div className="flex justify-center pt-8">
              <Button
                variant="ghost"
                asChild
                className="text-white/20 hover:text-white font-black uppercase tracking-widest text-[10px]"
              >
                <Link href={`/settings/project-types/${id}`}>
                  <ArrowLeft className="mr-2 h-3 w-3" />
                  Return to Configurator
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
