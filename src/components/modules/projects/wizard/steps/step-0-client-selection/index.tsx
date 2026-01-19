/**
 * Step 0: Client Selection
 *
 * Admin-only wizard step for selecting or creating a client
 * before initiating a project.
 */

"use client";

import { useWizardForm } from "../../wizard-form-context";
import { toast } from "sonner";
import type { ClientSelectionMode, SelectedClientData } from "../../types";
import type { Doc } from "@convex/_generated/dataModel";

// Import extracted components
import { SELECTION_OPTIONS } from "./types";
import { ClientSummaryCard } from "./client-summary-card";
import { SelectionOptionCard } from "./selection-option-card";
import { NoClientContent } from "./no-client-content";
import { NewClientContent } from "./new-client-content";
import { ExistingClientContent } from "./existing-client-content";

type Client = Doc<"profiles">;

// ============================================================================
// Main Component
// ============================================================================

export function WizardStep0() {
  const { formData, setFormData } = useWizardForm();
  const { selectionMode, clientData, isNewClient, clientId } = formData.step0;

  const handleOptionSelect = (option: ClientSelectionMode) => {
    setFormData("step0", {
      selectionMode: option,
      clientId: null,
      clientData: null,
      isNewClient: option === "new",
    });
  };

  const handleSelectExistingClient = (client: Client) => {
    setFormData("step0", {
      selectionMode: "existing",
      clientId: client._id,
      clientData: {
        _id: client._id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        onboardingComplete: client.onboardingComplete,
        projectCount: 0,
        activeProjectCount: 0,
      },
      isNewClient: false,
    });
    toast.success(`Selected ${client.name}`);
  };

  const handleChangeClient = () => {
    setFormData("step0", {
      selectionMode: null,
      clientId: null,
      clientData: null,
      isNewClient: false,
    });
  };

  return (
    <div className="w-full flex flex-col h-full">
      {/* Header - Matching Step 1 style */}
      <div className="mb-8 space-y-1">
        <h2 className="text-xl font-black tracking-tight uppercase text-white">
          Client Selection
        </h2>
        <p className="text-sm text-white/40 font-medium">
          Select an existing client, create a new one, or proceed without a
          client
        </p>
      </div>

      <div className="flex-1">
        {/* Option Cards - Visible until a client is selected */}
        {!clientData && (
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

        {/* No Client Confirmation Content Area */}
        {selectionMode === "none" && !clientData && (
          <NoClientContent onCancel={handleChangeClient} />
        )}

        {/* New Client Form Content Area */}
        {selectionMode === "new" && !clientData && (
          <NewClientContent
            onCancel={handleChangeClient}
            onSuccess={() => {}}
          />
        )}

        {/* Existing Client Selection Table Area */}
        {selectionMode === "existing" && !clientData && (
          <ExistingClientContent
            onCancel={handleChangeClient}
            onSelectClient={handleSelectExistingClient}
            selectedId={clientId ?? undefined}
          />
        )}

        {/* Selected Client Summary Card */}
        {clientData && (
          <ClientSummaryCard
            client={clientData}
            isNewClient={isNewClient}
            onChangeClient={handleChangeClient}
          />
        )}
      </div>
    </div>
  );
}

// REMOVED: ClientSelectionDrawer (replaced by inline ClientDataTable)
