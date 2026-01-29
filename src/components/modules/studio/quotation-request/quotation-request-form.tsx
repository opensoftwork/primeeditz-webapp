"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

import { PackageSelector } from "./package-selector";
import { SelectedPackagesSummary } from "./selected-packages-summary";

const formSchema = z.object({
  selectedPackageIds: z.array(z.string()).min(1, {
    message: "Please select at least one service package.",
  }),
  endClientName: z.string().min(2, {
    message: "Client name must be at least 2 characters.",
  }),
  eventName: z.string().optional(),
  eventDate: z.date().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function QuotationRequestForm() {
  const router = useRouter();
  const requestQuotation = useMutation(
    api.quotations.mutations.requestQuotation,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedPackageIds: [],
      endClientName: "",
      eventName: "",
      notes: "",
    },
  });

  const selectedPackages = form.watch(
    "selectedPackageIds",
  ) as Id<"servicePackages">[];

  async function onSubmit(data: FormValues) {
    try {
      await requestQuotation({
        selectedPackageIds: data.selectedPackageIds as Id<"servicePackages">[],
        endClientName: data.endClientName,
        eventName: data.eventName || undefined,
        eventDate: data.eventDate ? data.eventDate.getTime() : undefined,
        notes: data.notes || undefined,
      });

      toast.success("Quotation requested successfully");
      router.push("/quotations"); // Redirect to quotations list
    } catch (error) {
      console.error(error);
      toast.error("Failed to request quotation");
    }
  }

  function handlePackageSelection(ids: Id<"servicePackages">[]) {
    form.setValue("selectedPackageIds", ids);
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">1. Select Packages</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Choose one or more distinct services you need. Each package will
                create a separate project.
              </p>
              <FormField
                control={form.control}
                name="selectedPackageIds"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <PackageSelector
                        selectedIds={selectedPackages}
                        onSelectionChange={handlePackageSelection}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">2. Project Details</h2>

                <FormField
                  control={form.control}
                  name="endClientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Acme Corp" {...field} />
                      </FormControl>
                      <FormDescription>
                        Who is this project for?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event / Project Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Annual Conference 2024"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Event Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us any specific requirements..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">3. Summary</h2>
                <div className="sticky top-4">
                  <SelectedPackagesSummary selectedIds={selectedPackages} />

                  <Button
                    type="submit"
                    className="w-full mt-6"
                    size="lg"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Requesting Quote...
                      </>
                    ) : (
                      "Request Quote"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
