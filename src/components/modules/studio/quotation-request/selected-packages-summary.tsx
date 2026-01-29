"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SelectedPackagesSummaryProps {
  selectedIds: Id<"servicePackages">[];
}

export function SelectedPackagesSummary({
  selectedIds,
}: SelectedPackagesSummaryProps) {
  const packages = useQuery(api.servicePackages.getMany, { ids: selectedIds });
  const projectTypes = useQuery(api.projectTypes.getActiveProjectTypes);

  if (!selectedIds.length) {
    return (
      <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">
        Select packages to see what projects will be created.
      </div>
    );
  }

  // Calculate totals
  const totalLineItems =
    packages?.flatMap((p) =>
      p.lineItems.map((item) => ({ ...item, packageName: p.name })),
    ) ?? [];

  const subtotal = totalLineItems.reduce(
    (sum, item) => sum + item.rate * item.quantity,
    0,
  );
  const gstAmount = Math.round(subtotal * 0.18);
  const total = subtotal + gstAmount;

  return (
    <div className="space-y-6">
      {/* Projects Preview */}
      <Card>
        <CardHeader>
          <CardTitle>
            This will create {selectedIds.length} project(s):
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {packages?.map((pkg) => {
              const projectType = projectTypes?.find(
                (t) => t._id === pkg.projectTypeId,
              );
              return (
                <li key={pkg._id} className="flex items-center gap-2">
                  <Badge>{projectType?.name ?? "Loading..."}</Badge>
                  <span className="text-sm text-muted-foreground">
                    from {pkg.name}
                  </span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Combined Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Combined Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Group by package */}
          {packages?.map((pkg) => (
            <div key={pkg._id} className="mb-4">
              <h4 className="font-medium mb-2">{pkg.name}</h4>
              <div className="pl-4 space-y-1 text-sm">
                {pkg.lineItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.description}</span>
                    <span>₹{(item.rate * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Separator className="my-4" />

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>GST (18%)</span>
              <span>₹{gstAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
