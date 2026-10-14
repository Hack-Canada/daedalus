"use client";

import { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";

import { TRAVEL_REIMBURSEMENT_MAX } from "@/config/apply";
import { THackerApplicationSubmission } from "@/lib/validations/application";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MLHStep } from "@/components/applications/MLHStep";
import { UploadResume } from "@/components/applications/UploadResume";

const requiredMark = <span className="text-error"> *</span>;

export function SocialsMlhTravel({
  control,
  watch,
  setValue,
}: {
  control: Control<THackerApplicationSubmission>;
  watch: UseFormWatch<THackerApplicationSubmission>;
  setValue: UseFormSetValue<THackerApplicationSubmission>;
}) {
  const needsTravel = watch("needsTravelReimbursement");

  return (
    <div className="space-y-10">
      <fieldset className="space-y-4">
        <legend className="font-display mb-6 text-3xl font-semibold text-white md:text-4xl">
          Socials
        </legend>

        <FormField
          control={control}
          name="personalWebsite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portfolio or other links</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="https://yoursite.com"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="linkedin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="url"
                  inputMode="url"
                  placeholder="https://www.linkedin.com/in/username"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="github"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GitHub</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="url"
                  inputMode="url"
                  placeholder="https://github.com/username"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <UploadResume control={control} watch={watch} />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display mb-6 text-3xl font-semibold text-white md:text-4xl">
          MLH agreements
        </legend>
        <MLHStep control={control} />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display mb-6 text-3xl font-semibold text-white md:text-4xl">
          Travel
        </legend>
        <FormField
          control={control}
          name="needsTravelReimbursement"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-white">
                  Need travel reimbursement?{requiredMark}
                </legend>
                <div className="flex gap-6">
                  <label className="flex min-h-11 items-center gap-2 text-sm text-white">
                    <input
                      type="radio"
                      name="needsTravelReimbursement"
                      className="size-4"
                      checked={!field.value}
                      onChange={() => {
                        field.onChange(false);
                        setValue("travelAmount", "");
                        setValue("travelFrom", "");
                      }}
                    />
                    No
                  </label>
                  <label className="flex min-h-11 items-center gap-2 text-sm text-white">
                    <input
                      type="radio"
                      name="needsTravelReimbursement"
                      className="size-4"
                      checked={field.value}
                      onChange={() => field.onChange(true)}
                    />
                    Yes
                  </label>
                </div>
              </fieldset>
              <FormMessage />
            </FormItem>
          )}
        />

        {needsTravel && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={control}
              name="travelAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    How much? (CAD, up to {TRAVEL_REIMBURSEMENT_MAX})
                    {requiredMark}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      required
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="67"
                      onChange={(event) => {
                        field.onChange(event.target.value.replace(/\D/g, ""));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="travelFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Where are you travelling from?{requiredMark}
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required placeholder="Vancouver, BC" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </fieldset>
    </div>
  );
}
