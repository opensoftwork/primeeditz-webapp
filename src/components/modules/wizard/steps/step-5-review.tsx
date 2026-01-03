/**
 * Step 5: Review
 * 
 * Review all entered information before submitting.
 */

import { useWizardForm } from '../wizard-form-context'

export function Step5Review() {
  const { values } = useWizardForm()

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="font-medium mb-4">Review Your Project Request</h3>
        
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Event Name:</dt>
            <dd className="font-medium">{values.eventName || '—'}</dd>
          </div>
          
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Client Name:</dt>
            <dd className="font-medium">{values.endClientName || '—'}</dd>
          </div>
          
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Event Date:</dt>
            <dd className="font-medium">
              {values.eventDate 
                ? new Date(values.eventDate).toLocaleDateString() 
                : '—'}
            </dd>
          </div>
          
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Venue:</dt>
            <dd className="font-medium">{values.venue || '—'}</dd>
          </div>
          
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Preferred Delivery:</dt>
            <dd className="font-medium">
              {values.preferredDeliveryDate 
                ? new Date(values.preferredDeliveryDate).toLocaleDateString() 
                : '—'}
            </dd>
          </div>
          
          {values.description && (
            <div className="pt-3 border-t">
              <dt className="text-muted-foreground mb-1">Description:</dt>
              <dd className="text-sm">{values.description}</dd>
            </div>
          )}
        </dl>
      </div>
      
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm">
        <p className="font-medium text-primary">Ready to Submit</p>
        <p className="text-muted-foreground mt-1">
          Click "Submit Request" to send your project for review. 
          You'll receive a confirmation and can track its status from your dashboard.
        </p>
      </div>
    </div>
  )
}
