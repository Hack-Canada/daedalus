"use client";

import { Control } from "react-hook-form";

import { NORMAL_PROMPTS, NORMAL_WORD_LIMIT } from "@/config/apply";
import { THackerApplicationSubmission } from "@/lib/validations/application";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

import { WordCount } from "./WordCount";

const requiredMark = <span className="text-error"> *</span>;

export function NormalQuestions({
  control,
}: {
  control: Control<THackerApplicationSubmission>;
}) {
  return (
    <fieldset className="space-y-6">
      <legend className="mb-4 font-display text-2xl font-semibold text-white">
        Normal application questions
      </legend>
      <FormField
        control={control}
        name="normalAnswer1"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {NORMAL_PROMPTS.normalAnswer1}
              {requiredMark}
            </FormLabel>
            <FormControl>
              <Textarea {...field} required rows={5} />
            </FormControl>
            <FormDescription>
              <WordCount value={field.value} limit={NORMAL_WORD_LIMIT} />
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="normalAnswer2"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {NORMAL_PROMPTS.normalAnswer2}
              {requiredMark}
            </FormLabel>
            <FormControl>
              <Textarea {...field} required rows={6} />
            </FormControl>
            <FormDescription>
              <WordCount value={field.value} limit={NORMAL_WORD_LIMIT} />
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </fieldset>
  );
}
