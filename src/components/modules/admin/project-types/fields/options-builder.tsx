"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, Reorder } from "motion/react";

interface Option {
  id: string;
  label: string;
  value: string;
}

interface OptionsBuilderProps {
  value: string; // JSON string
  onChange: (value: string) => void;
}

export function OptionsBuilder({ value, onChange }: OptionsBuilderProps) {
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        setOptions(
          parsed.map((opt, i) => ({
            id: opt.id || `opt-${i}-${Date.now()}`,
            label: opt.label || "",
            value: opt.value || "",
          }))
        );
      }
    } catch (e) {
      setOptions([]);
    }
  }, [value]);

  const updateOptions = (newOptions: Option[]) => {
    setOptions(newOptions);
    onChange(
      JSON.stringify(newOptions.map(({ label, value }) => ({ label, value })))
    );
  };

  const addOption = () => {
    const newOptions = [
      ...options,
      { id: `opt-${Date.now()}`, label: "", value: "" },
    ];
    updateOptions(newOptions);
  };

  const removeOption = (id: string) => {
    updateOptions(options.filter((opt) => opt.id !== id));
  };

  const handleOptionChange = (
    id: string,
    field: "label" | "value",
    val: string
  ) => {
    const newOptions = options.map((opt) => {
      if (opt.id === id) {
        const updated = { ...opt, [field]: val };
        if (field === "label" && !opt.value) {
          updated.value = val.toLowerCase().replace(/\s+/g, "_");
        }
        return updated;
      }
      return opt;
    });
    updateOptions(newOptions);
  };

  return (
    <div className="space-y-4">
      <Reorder.Group
        axis="y"
        values={options}
        onReorder={updateOptions}
        className="space-y-2"
      >
        {options.map((option) => (
          <Reorder.Item
            key={option.id}
            value={option}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-2 group"
          >
            <div className="cursor-grab active:cursor-grabbing p-1 text-white/20 hover:text-white/40 transition-colors">
              <GripVertical className="h-4 w-4" />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Input
                placeholder="Label"
                value={option.label}
                onChange={(e) =>
                  handleOptionChange(option.id, "label", e.target.value)
                }
                className="bg-white/5 border-white/10 text-xs h-9"
              />
              <Input
                placeholder="Value"
                value={option.value}
                onChange={(e) =>
                  handleOptionChange(option.id, "value", e.target.value)
                }
                className="bg-zinc-900 border-white/5 text-xs h-9 font-mono"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeOption(option.id)}
              className="h-9 w-9 text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {options.length === 0 && (
        <div className="py-8 text-center border border-dashed border-white/5 rounded-xl bg-white/2">
          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
            No options defined
          </p>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={addOption}
        className="w-full h-9 border-dashed border-white/10 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest"
      >
        <Plus className="mr-2 h-3 w-3" />
        Add Dropdown Option
      </Button>
    </div>
  );
}
