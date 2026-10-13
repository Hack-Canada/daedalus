"use client";

import { Control } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface MLHStepProps {
  control: Control<any>;
}

export function MLHStep({ control }: MLHStepProps) {
  return (
    <div className="max-w-3xl space-y-4 xl:space-y-6">
      <FormField
        control={control}
        name="mlhCheckbox1"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>
                I have read and agree to the{" "}
                <a
                  href="https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  MLH Code of Conduct
                </a>
                .<span className="text-error">*</span>
              </FormLabel>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="mlhCheckbox2"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>
                I authorize you to share my application/registration information
                with Major League Hacking for event administration, ranking, and
                MLH administration in-line with the{" "}
                <a
                  href="https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  MLH Privacy Policy
                </a>
                . I further agree to the terms of both the{" "}
                <a
                  href="https://github.com/MLH/mlh-policies/blob/main/contest-terms.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  MLH Contest Terms and Conditions
                </a>{" "}
                and the{" "}
                <a
                  href="https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  MLH Privacy Policy
                </a>
                .<span className="text-error">*</span>
              </FormLabel>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="mlhCheckbox3"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>
                I authorize MLH to send me occasional emails about relevant
                events, career opportunities, and community announcements.
              </FormLabel>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
