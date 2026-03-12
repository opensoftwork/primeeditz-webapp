"use client";

import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Mail,
  Phone,
  Trash2,
  Instagram,
  User,
  Clock,
  CheckCircle2,
  ClipboardList,
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

export default function SurveyDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const surveyId = params.id as Id<"surveys">;

  const survey = useQuery(api.functions.surveys.queries.getSurveyById, {
    id: surveyId,
  });
  const deleteMutation = useMutation(
    api.functions.surveys.mutations.deleteSurvey,
  );

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteMutation({ id: surveyId });
      toast.success("Survey deleted successfully");
      router.push("/surveys");
    } catch (error) {
      toast.error("Failed to delete survey");
    }
  };

  if (survey === undefined) {
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

  if (survey === null) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center h-[60vh]">
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 mb-6">
          <ClipboardList className="h-10 w-10 text-white/20" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
          Survey Not Found
        </h2>
        <p className="text-white/40 font-medium mt-2 max-w-md">
          The survey submission you are looking for may have been deleted.
        </p>
        <Button
          variant="ghost"
          className="mt-8"
          onClick={() => router.push("/surveys")}
        >
          Back to Surveys
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
            <Link href="/surveys">
              <ArrowLeft className="h-5 w-5 text-white/60" />
            </Link>
          </Button>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-2 py-0.5 rounded">
                Survey
              </span>
              {survey.q1_role && (
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                  / {survey.q1_role}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
              {survey.name}
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
        {/* Main Content — Survey Responses */}
        <div className="lg:col-span-8 space-y-10">
          <QuestionGroup title="Basic Information">
            <Field label="Role" value={survey.q1_role} />
            <Field label="Other Role" value={survey.q1_roleOther} />
            <Field label="Frequency" value={survey.q2_frequency} />
            <Field label="Content Types" value={survey.q3_contentTypes} />
            <Field label="Other Content" value={survey.q3_contentTypesOther} />
            <Field label="Monthly Volume" value={survey.q4_monthlyVolume} />
          </QuestionGroup>

          <QuestionGroup title="Editing Workflow">
            <Field label="Current Editing" value={survey.q5_currentEditing} />
            <Field
              label="Editing Challenges"
              value={survey.q7_editingChallenges}
            />
            <Field
              label="Other Challenges"
              value={survey.q7_editingChallengesOther}
            />
            <Field label="Turnaround Time" value={survey.q8_turnaroundTime} />
            <Field
              label="Turnaround Satisfaction"
              value={survey.q9_turnaroundSatisfaction}
            />
            <Field label="Revision Rounds" value={survey.q10_revisionRounds} />
          </QuestionGroup>

          {survey.q6_frustrations && (
            <section className="space-y-4">
              <div className="flex items-center gap-3 ml-1">
                <ClipboardList className="h-5 w-5 text-primary" />
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
                  Frustrations
                </h3>
              </div>
              <div className="bg-white/3 border border-white/5 rounded-[32px] p-8">
                <pre className="text-sm text-white/70 whitespace-pre-wrap font-sans leading-relaxed">
                  {JSON.stringify(survey.q6_frustrations, null, 2)}
                </pre>
              </div>
            </section>
          )}

          <QuestionGroup title="Contact Preferences">
            <Field
              label="Preferred Contact Method"
              value={survey.preferredContactMethod}
            />
            <Field
              label="Best Time to Contact"
              value={survey.bestTimeToContact}
            />
            <Field label="May Contact?" value={survey.mayContact} />
          </QuestionGroup>
        </div>

        {/* Sidebar — Respondent Details */}
        <div className="lg:col-span-4 space-y-8">
          <div className="p-8 rounded-[32px] bg-white/3 border border-white/5 space-y-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              Respondent Details
            </span>

            <div className="space-y-5">
              <SidebarField icon={Mail} label="Email" value={survey.email} />

              {survey.phone && (
                <SidebarField icon={Phone} label="Phone" value={survey.phone} />
              )}

              {survey.instagramHandle && (
                <SidebarField
                  icon={Instagram}
                  label="Instagram"
                  value={survey.instagramHandle}
                />
              )}

              {survey.channelName && (
                <SidebarField
                  icon={User}
                  label="Channel"
                  value={survey.channelName}
                />
              )}

              <SidebarField
                icon={Clock}
                label="Best Time"
                value={survey.bestTimeToContact || "Not specified"}
              />

              <SidebarField
                icon={CheckCircle2}
                label="May Contact"
                value={survey.mayContact || "Not specified"}
              />
            </div>
          </div>

          {/* Submission Metadata */}
          <div className="p-8 rounded-[32px] bg-white/3 border border-white/5 space-y-5">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              Submission Info
            </span>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Submitted
              </span>
              <span className="text-xs font-medium text-white/60">
                {format(survey._creationTime, "PPP")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this survey submission from{" "}
              <strong>{survey.name}</strong>? This action is permanent and
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Submission
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                       */
/* ------------------------------------------------------------------ */

function QuestionGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 ml-1">
        <ClipboardList className="h-5 w-5 text-primary" />
        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
          {title}
        </h3>
      </div>
      <div className="bg-white/3 border border-white/5 rounded-[32px] p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  if (
    value === undefined ||
    value === null ||
    (Array.isArray(value) && value.length === 0)
  )
    return null;

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
        {label}
      </p>
      <div className="text-sm font-medium text-white/80">
        {Array.isArray(value) ? (
          <div className="flex flex-wrap gap-1.5">
            {value.map((v: string, i: number) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] uppercase font-black border border-white/5 text-white/60"
              >
                {v}
              </span>
            ))}
          </div>
        ) : (
          String(value)
        )}
      </div>
    </div>
  );
}

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
