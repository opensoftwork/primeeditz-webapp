"use client";

import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Mail,
  Star,
  Trash2,
  Calendar,
  User,
  Quote,
  MessageSquare,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function FeedbackDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const feedbackId = params.id as Id<"feedbacks">;

  const feedback = useQuery(api.functions.feedbacks.queries.getFeedbackById, {
    id: feedbackId,
  });
  const deleteMutation = useMutation(
    api.functions.feedbacks.mutations.deleteFeedback,
  );

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteMutation({ id: feedbackId });
      toast.success("Feedback deleted successfully");
      router.push("/feedbacks");
    } catch (error) {
      toast.error("Failed to delete feedback");
    }
  };

  if (feedback === undefined) {
    return (
      <div className="space-y-8 animate-pulse p-6 md:p-10">
        <div className="flex items-center justify-between">
          <Skeleton className="h-12 w-12 rounded-2xl bg-white/5" />
          <Skeleton className="h-11 w-48 bg-white/5 rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full bg-white/5 rounded-[32px]" />
      </div>
    );
  }

  if (feedback === null) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center h-[60vh]">
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 mb-6">
          <MessageSquare className="h-10 w-10 text-white/20" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
          Feedback Not Found
        </h2>
        <p className="text-white/40 font-medium mt-2 max-w-md">
          The feedback submission you are looking for may have been deleted.
        </p>
        <Button
          variant="ghost"
          className="mt-8"
          onClick={() => router.push("/feedbacks")}
        >
          Back to Feedbacks
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-8 pb-20 p-6 md:p-10"
    >
      {/* Header — matches service package detail pattern */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 shrink-0"
          >
            <Link href="/feedbacks">
              <ArrowLeft className="h-5 w-5 text-white/60" />
            </Link>
          </Button>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-2 py-0.5 rounded">
                Feedback
              </span>
              <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-black gap-1 text-[10px] py-0 h-5 shadow-none">
                {feedback.rating} <Star className="h-2.5 w-2.5 fill-current" />
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
              {feedback.name}
            </h1>
          </motion.div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowDeleteDialog(true)}
            variant="outline"
            className="h-11 px-6 rounded-2xl border-white/10 hover:bg-white/5 text-white/60 hover:text-white font-black uppercase tracking-widest text-[10px] gap-2"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content — Feedback Quote */}
        <div className="lg:col-span-8 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-3 ml-1">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
                Feedback Message
              </h3>
            </div>
            <div className="relative bg-white/3 border border-white/5 rounded-[32px] p-10 lg:p-14">
              <Quote className="absolute top-8 left-8 h-12 w-12 text-white/3 rotate-180" />
              <p className="relative text-xl font-medium text-white/80 leading-relaxed italic">
                &ldquo;{feedback.feedback}&rdquo;
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar — Details */}
        <div className="lg:col-span-4 space-y-8">
          <div className="p-8 rounded-[32px] bg-white/3 border border-white/5 space-y-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              Feedback Details
            </span>

            <div className="space-y-5">
              <SidebarField icon={User} label="From" value={feedback.name} />
              <SidebarField
                icon={Mail}
                label="Email Address"
                value={feedback.email}
              />
              <SidebarField
                icon={Calendar}
                label="Date Submitted"
                value={format(feedback._creationTime, "PPP p")}
              />
            </div>

            <div className="pt-6 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  Rating
                </span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < feedback.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this feedback from{" "}
              <strong>{feedback.name}</strong>? This action is permanent and
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Feedback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

/** Reusable sidebar field for icon + label + value */
function SidebarField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-lg bg-primary/10 p-2 shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="space-y-0.5 min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
          {label}
        </p>
        <p className="text-sm font-medium text-white break-all">{value}</p>
      </div>
    </div>
  );
}
