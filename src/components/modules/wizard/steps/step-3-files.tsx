/**
 * Step 3: Reference Files
 * 
 * Upload reference files for the project.
 * Uses the useFileUploader hook.
 */

import { Upload } from 'lucide-react'

export function Step3Files() {
  // TODO: Integrate useFileUploader and file upload UI
  
  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
        <Upload className="h-10 w-10 mx-auto text-muted-foreground/50" />
        <p className="mt-4 text-lg font-medium">Upload Reference Files</p>
        <p className="text-sm text-muted-foreground mt-2">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-xs text-muted-foreground/70 mt-4">
          Maximum 20 files, 50MB each. Supported: Images, Videos, PDFs
        </p>
      </div>
      
      <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
        <p className="font-medium">Implementation Note:</p>
        <p className="mt-1">
          File upload will be connected to MinIO storage in a future task.
          The uploaded file IDs will be saved to the project.
        </p>
      </div>
    </div>
  )
}
