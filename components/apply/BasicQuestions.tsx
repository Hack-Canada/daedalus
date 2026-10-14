"use client";

import { Control, UseFormWatch } from "react-hook-form";

import { levelsOfStudy } from "@/lib/data/levelsOfStudy";
import { schools } from "@/lib/data/schools";
import { THackerApplicationSubmission } from "@/lib/validations/application";
import { AdvancedSelect } from "@/components/ui/advanced-select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CountrySelector } from "@/components/applications/CountrySelector";

const requiredMark = <span className="text-error"> *</span>;

export function BasicQuestions({
  control,
  watch,
}: {
  control: Control<THackerApplicationSubmission>;
  watch: UseFormWatch<THackerApplicationSubmission>;
}) {
  const school = watch("school");

  return (
    <fieldset className="space-y-4">
      <legend className="font-display mb-6 text-3xl font-semibold text-white md:text-4xl">
        Basic questions
      </legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First name{requiredMark}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  required
                  autoComplete="given-name"
                  placeholder="John"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last name{requiredMark}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  required
                  autoComplete="family-name"
                  placeholder="Doe"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age{requiredMark}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  required
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="18"
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email{requiredMark}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  readOnly
                  aria-readonly="true"
                  autoComplete="email"
                  className="cursor-not-allowed opacity-70"
                />
              </FormControl>
              <p className="text-sm text-white/50">
                This is the email on your account.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="school.value"
        render={({ field }) => (
          <FormItem>
            <FormLabel>School{requiredMark}</FormLabel>
            <FormControl>
              <AdvancedSelect
                name="school.value"
                value={
                  field.value
                    ? { value: field.value, label: field.value }
                    : null
                }
                onChange={field.onChange}
                loadOptions={(inputValue) =>
                  Promise.resolve(
                    schools
                      .filter((schoolName) =>
                        schoolName
                          .toLowerCase()
                          .includes(inputValue.toLowerCase()),
                      )
                      .map((schoolName) => ({
                        value: schoolName,
                        label: schoolName,
                      })),
                  )
                }
                placeholder="Search for your school"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {school?.value === "Other (please specify)" && (
        <FormField
          control={control}
          name="school.customValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>School (other){requiredMark}</FormLabel>
              <FormControl>
                <Input {...field} required placeholder="Enter your school" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <CountrySelector
        control={control}
        name="country"
        label="Country of residence"
      />

      <FormField
        control={control}
        name="levelOfStudy"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Current level of study{requiredMark}</FormLabel>
            <FormControl>
              <AdvancedSelect
                name="levelOfStudy"
                value={
                  field.value
                    ? { value: field.value, label: field.value }
                    : null
                }
                onChange={field.onChange}
                loadOptions={(inputValue) =>
                  Promise.resolve(
                    levelsOfStudy
                      .filter((level) =>
                        level.toLowerCase().includes(inputValue.toLowerCase()),
                      )
                      .map((level) => ({ value: level, label: level })),
                  )
                }
                placeholder="Select your level of study"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </fieldset>
  );
}
