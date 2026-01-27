"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptionsBuilder } from "./options-builder";

interface TypeSpecificOptionsProps {
  type: string;
  form: any;
}

export function TypeSpecificOptions({ type, form }: TypeSpecificOptionsProps) {
  return (
    <div className="space-y-6 pt-4 border-t border-white/5">
      {type === "number" && (
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="min">
            {(field: any) => (
              <div className="space-y-2">
                <Label className="text-white/60 font-medium text-xs">
                  Min Value
                </Label>
                <Input
                  type="number"
                  value={field.state.value ?? ""}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            )}
          </form.Field>
          <form.Field name="max">
            {(field: any) => (
              <div className="space-y-2">
                <Label className="text-white/60 font-medium text-xs">
                  Max Value
                </Label>
                <Input
                  type="number"
                  value={field.state.value ?? ""}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            )}
          </form.Field>
        </div>
      )}

      {type === "select" && (
        <form.Field name="options">
          {(field: any) => (
            <div className="space-y-3">
              <Label className="text-white/60 font-medium">
                Select Options
              </Label>
              <OptionsBuilder
                value={field.state.value || "[]"}
                onChange={field.handleChange}
              />
            </div>
          )}
        </form.Field>
      )}

      {(type === "text" || type === "number" || type === "textarea") && (
        <form.Field name="placeholder">
          {(field: any) => (
            <div className="space-y-2">
              <Label className="text-white/60 font-medium text-xs">
                Placeholder Text
              </Label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Instructions for the user..."
              />
            </div>
          )}
        </form.Field>
      )}
    </div>
  );
}
