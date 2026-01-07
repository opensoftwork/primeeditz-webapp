/**
 * Project Type Selection Drawer
 *
 * A slide-out drawer for selecting project type.
 * Premium UX with smooth animations and visual feedback.
 */

"use client";

import { CheckCircle2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProjectType {
  _id: string;
  name: string;
  category?: string;
}

interface ProjectTypeSelectionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTypes: ProjectType[] | undefined;
  selectedProjectTypeId: string | null;
  onSelect: (projectTypeId: string) => void;
}

export function ProjectTypeSelectionDrawer({
  open,
  onOpenChange,
  projectTypes,
  selectedProjectTypeId,
  onSelect,
}: ProjectTypeSelectionDrawerProps) {
  // Group project types by category
  const groupedTypes = projectTypes?.reduce((acc, type) => {
    const category = type.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(type);
    return acc;
  }, {} as Record<string, ProjectType[]>);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="data-[vaul-drawer-direction=right]:w-full! data-[vaul-drawer-direction=right]:sm:w-[420px]! data-[vaul-drawer-direction=right]:max-w-none! overflow-y-auto p-0 h-full">
        <DrawerTitle className="sr-only">Select Project Type</DrawerTitle>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-10 border-b bg-muted/30 backdrop-blur-sm px-6 py-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold">Select Project Type</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose the type of project you need
              </p>
            </motion.div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {!projectTypes || projectTypes.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-sm text-muted-foreground text-center">
                    {projectTypes === undefined
                      ? "Loading project types..."
                      : "No project types available"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {Object.entries(groupedTypes || {}).map(
                    ([category, types], categoryIndex) => (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: categoryIndex * 0.1,
                        }}
                      >
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                          {category}
                        </h3>
                        <div className="space-y-2">
                          {types.map((projectType, typeIndex) => {
                            const isSelected =
                              selectedProjectTypeId === projectType._id;
                            return (
                              <motion.div
                                key={projectType._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.2,
                                  delay: categoryIndex * 0.1 + typeIndex * 0.05,
                                }}
                              >
                                <Card
                                  className={cn(
                                    "cursor-pointer transition-all duration-200",
                                    isSelected
                                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                                      : "hover:bg-muted/50 hover:border-primary/50 hover:shadow-sm"
                                  )}
                                  onClick={() => {
                                    onSelect(projectType._id);
                                    onOpenChange(false);
                                  }}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <p className="font-medium">
                                          {projectType.name}
                                        </p>
                                      </div>
                                      {isSelected ? (
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 30,
                                          }}
                                        >
                                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 ml-4" />
                                        </motion.div>
                                      ) : (
                                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-4" />
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
