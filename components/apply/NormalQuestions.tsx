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

const answerBox =
  "min-h-48 rounded-xl px-5 py-4 text-lg leading-relaxed md:text-lg";

const requiredMark = <span className="text-error"> *</span>;

export function NormalQuestions({
  control,
}: {
  control: Control<THackerApplicationSubmission>;
}) {
  return (
    <fieldset className="space-y-10">
      <legend className="font-display mb-6 text-3xl font-semibold text-white md:text-4xl">
        Normal application questions
      </legend>
      <FormField
        control={control}
        name="normalAnswer1"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="block text-lg leading-relaxed font-medium text-white md:text-xl">
              {NORMAL_PROMPTS.normalAnswer1}
              {requiredMark}
            </FormLabel>
            <FormControl>
              <Textarea {...field} required rows={7} className={answerBox} />
            </FormControl>
            <FormDescription>
              <WordCount
                value={field.value}
                limit={NORMAL_WORD_LIMIT}
                className="text-base"
              />
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="normalAnswer2"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="block text-lg leading-relaxed font-medium text-white md:text-xl">
              {NORMAL_PROMPTS.normalAnswer2}
              {requiredMark}
            </FormLabel>
            <FormControl>
              <Textarea {...field} required rows={9} className={answerBox} />
            </FormControl>
            <FormDescription>
              <WordCount
                value={field.value}
                limit={NORMAL_WORD_LIMIT}
                className="text-base"
              />
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </fieldset>
  );
}
