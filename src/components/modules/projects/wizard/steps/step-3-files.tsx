/**
 * Wizard Step 3: Reference Files Upload
 *
 * Upload reference files (mood boards, examples) for the project.
 * Uses shadcn Field components and Motion animations for premium UX.
 */

"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { useWizardForm } from "../wizard-form-context";
import { formatFileSize } from "@/lib/file";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  FileIcon,
  Image,
  Video,
  File,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function WizardStep3() {
  const {
    formData,
    setFormData,
    nextStep,
    prevStep,
    isLoading: wizardLoading,
  } = useWizardForm();
  const step3Data = formData.step3;

  // Handle file selection
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);

      // Filter valid files
      const validFiles = files.filter((file) => {
        if (file.size > MAX_FILE_SIZE) {
          console.warn(`File ${file.name} exceeds 50MB limit`);
          return false;
        }
        return true;
      });

      // Limit to MAX_FILES total
      const currentCount = step3Data.referenceFiles.length;
      const remaining = MAX_FILES - currentCount;
      const filesToAdd = validFiles.slice(0, remaining);

      if (filesToAdd.length > 0) {
        const newFileIds = filesToAdd.map((f) => `pending:${f.name}:${f.size}`);
        setFormData("step3", {
          referenceFiles: [...step3Data.referenceFiles, ...newFileIds],
        });
      }

      e.target.value = "";
    },
    [step3Data.referenceFiles, setFormData]
  );

  // Remove a file
  const removeFile = useCallback(
    (index: number) => {
      setFormData("step3", {
        referenceFiles: step3Data.referenceFiles.filter((_, i) => i !== index),
      });
    },
    [step3Data.referenceFiles, setFormData]
  );

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter((file) => file.size <= MAX_FILE_SIZE);

      const currentCount = step3Data.referenceFiles.length;
      const remaining = MAX_FILES - currentCount;
      const filesToAdd = validFiles.slice(0, remaining);

      if (filesToAdd.length > 0) {
        const newFileIds = filesToAdd.map((f) => `pending:${f.name}:${f.size}`);
        setFormData("step3", {
          referenceFiles: [...step3Data.referenceFiles, ...newFileIds],
        });
      }
    },
    [step3Data.referenceFiles, setFormData]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleNext = async () => {
    await nextStep();
  };

  const handlePrev = async () => {
    await prevStep();
  };

  // Parse file info from ID
  const parseFileInfo = (fileId: string) => {
    if (fileId.startsWith("pending:")) {
      const parts = fileId.split(":");
      return {
        name: parts[1] || "Unknown",
        size: Number(parts[2]) || 0,
        isPending: true,
      };
    }
    return { name: fileId, size: 0, isPending: false };
  };

  // Get file icon based on extension
  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split(".").pop();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    if (["mp4", "mov", "avi", "webm", "mkv"].includes(ext || "")) {
      return <Video className="h-5 w-5 text-purple-500" />;
    }
    if (["pdf"].includes(ext || "")) {
      return <FileIcon className="h-5 w-5 text-red-500" />;
    }
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">
            Reference Files
          </CardTitle>
          <CardDescription className="text-sm">
            Upload mood boards, examples, or any reference materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <FieldGroup className="space-y-4">
              {/* Upload Area */}
              <Field>
                <FieldLabel>Upload Files</FieldLabel>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
                    "hover:border-primary hover:bg-primary/5",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  )}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById("file-input")?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      document.getElementById("file-input")?.click();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload files"
                >
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={step3Data.referenceFiles.length >= MAX_FILES}
                  />
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                  </motion.div>
                  <h3 className="font-medium mb-1">
                    Drop files here or click to browse
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Up to {MAX_FILES} files, {formatFileSize(MAX_FILE_SIZE)}{" "}
                    each
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {step3Data.referenceFiles.length} / {MAX_FILES} files
                    selected
                  </p>
                </motion.div>
                <FieldDescription className="mt-2">
                  These files help us understand your vision. They don't count
                  against your storage quota.
                </FieldDescription>
              </Field>

              {/* File List */}
              <AnimatePresence mode="popLayout">
                {step3Data.referenceFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Field>
                      <FieldLabel>
                        Selected Files ({step3Data.referenceFiles.length})
                      </FieldLabel>
                      <ul className="divide-y rounded-lg border" role="list">
                        <AnimatePresence mode="popLayout">
                          {step3Data.referenceFiles.map((fileId, index) => {
                            const info = parseFileInfo(fileId);

                            return (
                              <motion.li
                                key={fileId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {getFileIcon(info.name)}
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {info.name}
                                    </p>
                                    {info.size > 0 && (
                                      <p className="text-xs text-muted-foreground">
                                        {formatFileSize(info.size)}
                                        {info.isPending && " • Pending upload"}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeFile(index)}
                                  className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
                                  aria-label={`Remove ${info.name}`}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </motion.li>
                            );
                          })}
                        </AnimatePresence>
                      </ul>
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>
            </FieldGroup>
          </FieldSet>
        </CardContent>
      </Card>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-between pt-6"
      >
        <Button
          type="button"
          variant="outline"
          onClick={handlePrev}
          disabled={wizardLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          disabled={wizardLoading}
          className="min-w-[120px]"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
