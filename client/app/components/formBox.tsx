import type {
  UseFormReturn,
  FieldValues,
  Path,
  ControllerRenderProps,
  FieldError as RHFFieldError,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import { Suspense, lazy, useEffect, useState } from "react";
import { type E164Number } from "libphonenumber-js/core";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldSet,
  FieldLegend,
} from "./ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Eye, EyeClosed, Square, SquareCheck } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { type ReactNode } from "react";
import PhoneInput from "react-phone-number-input";
import { cn } from "~/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";

// Lazy load the SimpleMDE component to avoid SSR issues
const SimpleMDE = lazy(() => import("react-simplemde-editor"));

type SelectOption = {
  name: string;
  id: string | number;
};

interface FormFieldConfig {
  name: string;
  type: any;
  label: string;
  placeholder?: string;
  options?: SelectOption[];
  disabled?: boolean;
}

export interface FormBoxProps<TFormData extends FieldValues = FieldValues> {
  form: UseFormReturn<TFormData>;
  toggleVisibility?: () => void;
  isVisible?: boolean;
  id?: string;
  data?: FormFieldConfig[];
  classname?: string;
  getSelectData?: SelectOption[];
  getCommandData?: SelectOption[];
  onValueChangeMap?: Record<string, (value: string) => void>;
  onValueChange?: (value: string) => void;
  disabledMap?: Record<string, boolean>;
  placeholder?: string;
  disabled?: string[];
}

export default function FormBox<TFormData extends FieldValues = FieldValues>({
  form,
  toggleVisibility,
  isVisible,
  data,
  classname,
  getSelectData,
  getCommandData,
  onValueChangeMap,
  onValueChange,
  disabledMap,
  disabled,
}: FormBoxProps<TFormData>) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleToggleVisibility = toggleVisibility ?? (() => {});
  const visible = isVisible ?? false;

  const FormType = (
    type: string,
    item: FormFieldConfig,
    field: ControllerRenderProps<TFormData, Path<TFormData>>,
    errors: RHFFieldError | undefined,
  ): ReactNode => {
    switch (type) {
      case "command":
        return (
          <Command
            className={cn(
              "rounded-sm focus:outline-blue-500 focus:ring-blue-500",
              errors ? "border-red-500" : "",
            )}
          >
            <CommandInput placeholder="Type to search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {getCommandData?.map((item: any) => (
                  <CommandItem
                    value={item.name}
                    key={item.id}
                    onSelect={() => {
                      const currentValues: any[] = Array.isArray(field.value)
                        ? field.value
                        : [];
                      const newValue = item.id;
                      if (currentValues.includes(newValue)) {
                        field.onChange(
                          currentValues.filter((v: any) => v !== newValue),
                        );
                      } else {
                        field.onChange([...currentValues, newValue]);
                      }
                    }}
                  >
                    {(Array.isArray(field.value)
                      ? field.value
                      : ([] as any[])
                    ).includes(item.id) ? (
                      <SquareCheck className="mr-1 h-4 w-4" />
                    ) : (
                      <Square className="mr-1 h-4 w-4" />
                    )}
                    {item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        );
      case "textarea":
        return (
          <Textarea
            placeholder={item.placeholder}
            {...field}
            className={cn(
              "rounded-sm focus:outline-blue-500 focus:ring-blue-500",
              errors ? "border-red-500" : "",
            )}
          />
        );
      case "select":
        return (
          <Select
            onValueChange={(value) => {
              field.onChange(value);
              onValueChangeMap?.[item.name]?.(value);
              onValueChange?.(value);
            }}
            value={field.value ?? ""}
            disabled={
              disabledMap?.[item.name] ||
              disabled?.includes(item.name) ||
              item.disabled
            }
          >
            <SelectTrigger
              className={cn(
                "capiatlize py-4 rounded-sm focus:outline-blue-500 focus:ring-blue-500",
                errors ? "border-red-500" : "",
              )}
            >
              <SelectValue placeholder={"Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {(item.options || getSelectData)?.map(
                (item: SelectOption, index: number) => (
                  <SelectItem
                    key={item.id || index}
                    value={item.id as string}
                    className="capitalize"
                  >
                    {item.name}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        );
      case "checkbox":
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              id={item.name}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={
                disabledMap?.[item.name] ||
                disabled?.includes(item.name) ||
                item.disabled
              }
            />
            <Label htmlFor={item.name} className="text-sm font-medium">
              {item.label}
            </Label>
          </div>
        );
      case "editor":
        if (!isMounted) {
          return (
            <div className="h-[300px] w-full rounded-sm animate-pulse bg-slate-50 flex items-center justify-center text-muted-foreground text-xs">
              Loading editor...
            </div>
          );
        }
        return (
          <Suspense fallback={<div>Loading editor...</div>}>
            <SimpleMDE
              value={field.value ?? ""}
              onChange={field.onChange}
              style={{
                border: "none",
                borderRadius: "4px",
                padding: "4px",
                resize: "none",
                backgroundColor: "transparent",
                fontSize: "14px",
              }}
            />
          </Suspense>
        );
      case "tel":
        return (
          <PhoneInput
            defaultCountry="NG"
            placeholder={item.placeholder}
            international
            withCountryCallingCode
            value={field.value as E164Number | undefined}
            onChange={field.onChange}
            className={`p-[5.5px] text-sm border bg-inherit rounded-sm focus:outline-blue-500 focus:ring-blue-500 ${errors ? "border-red-500" : ""}`}
          />
        );
      default:
        return (
          <Input
            type={
              item.type === "password"
                ? visible
                  ? "text"
                  : "password"
                : item.type
            }
            value={field.value ?? ""}
            onChange={field.onChange}
            placeholder={item.placeholder}
            disabled={
              disabledMap?.[item.name] ||
              disabled?.includes(item.name) ||
              item.disabled
            }
            className={cn(
              "focus:outline-blue-500 focus:ring-blue-500 py-4 rounded-sm",
              errors ? "border-red-500" : "",
            )}
          />
        );
    }
  };
  return (
    <>
      {data?.map((item: FormFieldConfig, index: number) => (
        <FieldSet className="w-full" key={index}>
          <Controller
            control={form.control}
            name={item.name as Path<TFormData>}
            key={item.name}
            render={({ field }) => (
              <FieldLegend className={`relative ${classname}`}>
                <FieldLabel
                  htmlFor={item.name}
                  className={cn(
                    "mb-1 text-gray-800 dark:text-muted-foreground font-medium",
                    form.formState.errors[item.name as Path<TFormData>]
                      ? "text-red-500"
                      : "",
                  )}
                >
                  {item.type === "checkbox" ? "" : item.label}
                </FieldLabel>
                <Field className="text-gray-800 dark:text-white">
                  {FormType(
                    item.type,
                    item,
                    field,
                    form.formState.errors[item.name as Path<TFormData>] as
                      | RHFFieldError
                      | undefined,
                  )}
                </Field>
                <FieldError className="text-xs">
                  {
                    (
                      form.formState.errors[item.name as Path<TFormData>] as
                        | RHFFieldError
                        | undefined
                    )?.message
                  }
                </FieldError>
                {item.type === "password" && (
                  <button
                    type="button"
                    className={`absolute ${
                      form.formState.errors.password ||
                      form.formState.errors.newPassword
                        ? "inset-y-[30%]"
                        : "inset-y-[50%]"
                    } right-2 text-xs border-0 focus:outline-none font-semibold cursor-pointer text-zinc-800 dark:text-white`}
                    onClick={handleToggleVisibility}
                  >
                    {visible ? <Eye /> : <EyeClosed />}
                  </button>
                )}
              </FieldLegend>
            )}
          />
        </FieldSet>
      ))}
    </>
  );
}
