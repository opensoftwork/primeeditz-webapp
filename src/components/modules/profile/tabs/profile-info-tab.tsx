import { User2, Phone, Building2, Briefcase } from "lucide-react";

import { ProfileField } from "../components/profile-field";
import type { EditFormState } from "../constants";

interface ProfileInfoTabProps {
  profile: any;
  isEditing: boolean;
  editForm: EditFormState;
  setEditForm: React.Dispatch<React.SetStateAction<EditFormState>>;
}

export function ProfileInfoTab({
  profile,
  isEditing,
  editForm,
  setEditForm,
}: ProfileInfoTabProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1">
          Personal Information
        </h3>
        <p className="text-sm text-white/40 font-medium">
          Your personal details and contact information.
        </p>
      </div>

      <div className="space-y-6">
        {/* Full Name */}
        <ProfileField
          icon={User2}
          label="Full Name"
          value={profile.name}
          isEditing={isEditing}
          editValue={editForm.name}
          onChange={(val) => setEditForm((prev) => ({ ...prev, name: val }))}
          placeholder="Enter your full name"
        />

        {/* Phone */}
        <ProfileField
          icon={Phone}
          label="Phone Number"
          value={profile.phone || "Not provided"}
          isEditing={isEditing}
          editValue={editForm.phone}
          onChange={(val) => setEditForm((prev) => ({ ...prev, phone: val }))}
          placeholder="Enter your phone number"
          isEmpty={!profile.phone}
        />

        {/* Company */}
        <ProfileField
          icon={Building2}
          label="Company"
          value={profile.company || "Not provided"}
          isEditing={isEditing}
          editValue={editForm.company}
          onChange={(val) => setEditForm((prev) => ({ ...prev, company: val }))}
          placeholder="Enter your company name"
          isEmpty={!profile.company}
        />

        {/* Designation (read-only) */}
        {profile.designation && (
          <ProfileField
            icon={Briefcase}
            label="Designation"
            value={profile.designation}
            isEditing={false}
            editValue=""
            onChange={() => {}}
          />
        )}
      </div>
    </div>
  );
}
