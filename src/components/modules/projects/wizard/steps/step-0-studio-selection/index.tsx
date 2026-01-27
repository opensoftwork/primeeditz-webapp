/**
 * Step 0: Studio Selection
 *
 * Admin-only wizard step for selecting or creating a studio
 * before initiating a project.
 */

"use client";

import { useWizardForm } from "../../wizard-form-context";
import { toast } from "sonner";
import type { StudioSelectionMode, SelectedStudioData } from "../../types";
import type { Doc } from "@convex/_generated/dataModel";

// Import extracted components
import { SELECTION_OPTIONS } from "./types";
import { StudioSummaryCard } from "./studio-summary-card";
import { SelectionOptionCard } from "./selection-option-card";
import { NoStudioContent } from "./no-studio-content";
import { NewStudioContent } from "./new-studio-content";
import { ExistingStudioContent } from "./existing-studio-content";

type Studio = Doc<"profiles">;

// ============================================================================
// Main Component
// ============================================================================

export function WizardStep0() {
  const { formData, setFormData } = useWizardForm();
  const { selectionMode, studioData, isNewStudio, studioId } = formData.step0;

  const handleOptionSelect = (option: StudioSelectionMode) => {
    setFormData("step0", {
      selectionMode: option,
      studioId: null,
      studioData: null,
      isNewStudio: option === "new",
    });
  };

  const handleSelectExistingStudio = (studio: Studio) => {
    setFormData("step0", {
      selectionMode: "existing",
      studioId: studio._id,
      studioData: {
        _id: studio._id,
        name: studio.name,
        email: studio.email,
        phone: studio.phone,
        company: studio.company,
        onboardingComplete: studio.onboardingComplete,
        projectCount: 0,
        activeProjectCount: 0,
      },
      isNewStudio: false,
    });
    toast.success(`Selected ${studio.name}`);
  };

  const handleChangeStudio = () => {
    setFormData("step0", {
      selectionMode: null,
      studioId: null,
      studioData: null,
      isNewStudio: false,
    });
  };

  return (
    <div className="w-full flex flex-col h-full">
      {/* Header - Matching Step 1 style */}
      <div className="mb-8 space-y-1">
        <h2 className="text-xl font-black tracking-tight uppercase text-white">
          Studio Selection
        </h2>
        <p className="text-sm text-white/40 font-medium">
          Select an existing studio, create a new one, or proceed without a
          studio
        </p>
      </div>

      <div className="flex-1">
        {/* Option Cards - Visible until a studio is selected */}
        {!studioData && (
          <div className="grid gap-x-8 gap-y-6 md:grid-cols-3">
            {SELECTION_OPTIONS.map((option) => (
              <SelectionOptionCard
                key={option.id}
                option={option}
                isSelected={selectionMode === option.id}
                onSelect={handleOptionSelect}
              />
            ))}
          </div>
        )}

        {/* No Studio Confirmation Content Area */}
        {selectionMode === "none" && !studioData && (
          <NoStudioContent onCancel={handleChangeStudio} />
        )}

        {/* New Studio Form Content Area */}
        {selectionMode === "new" && !studioData && (
          <NewStudioContent
            onCancel={handleChangeStudio}
            onSuccess={() => {}}
          />
        )}

        {/* Existing Studio Selection Table Area */}
        {selectionMode === "existing" && !studioData && (
          <ExistingStudioContent
            onCancel={handleChangeStudio}
            onSelectStudio={handleSelectExistingStudio}
            selectedId={studioId ?? undefined}
          />
        )}

        {/* Selected Studio Summary Card */}
        {studioData && (
          <StudioSummaryCard
            studio={studioData}
            isNewStudio={isNewStudio}
            onChangeStudio={handleChangeStudio}
          />
        )}
      </div>
    </div>
  );
}

// REMOVED: StudioSelectionDrawer (replaced by inline StudioDataTable)
