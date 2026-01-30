"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  categories: { _id: string; name: string }[];
}

export function ListFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  categoryId,
  onCategoryChange,
  categories,
}: ListFiltersProps) {
  const hasFilters = search !== "" || status !== "all" || categoryId !== "all";

  const clearFilters = () => {
    onSearchChange("");
    onStatusChange("all");
    onCategoryChange("all");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-end md:items-center bg-white/2 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
      <div className="relative flex-1 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Search packages..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-transparent border-white/5 h-10 rounded-xl focus:ring-1 focus:ring-primary/50"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="w-[140px]">
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="bg-transparent border-white/5 h-10 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[160px]">
          <Select value={categoryId} onValueChange={onCategoryChange}>
            <SelectTrigger className="bg-transparent border-white/5 h-10 rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
          >
            <X className="mr-2 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
