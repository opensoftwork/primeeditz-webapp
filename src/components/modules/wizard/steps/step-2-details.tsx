/**
 * Step 2: Project Details
 * 
 * Dynamic fields based on project type.
 * For now, a placeholder.
 */

export function Step2Details() {
  return (
    <div className="space-y-6">
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-lg font-medium">Project-Specific Details</p>
        <p className="text-sm mt-2">
          This step will show dynamic fields based on the selected project type.
        </p>
        <p className="text-xs mt-4 bg-muted/50 rounded-lg p-4 max-w-md mx-auto">
          Implementation note: Fields will be configured per project type in the admin panel.
        </p>
      </div>
    </div>
  )
}
