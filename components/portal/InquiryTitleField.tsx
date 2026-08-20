import { Input } from "@/components/ui/input";

export function InquiryTitleField({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  required: boolean;
}) {
  return (
    <Input
      aria-label="Inquiry title"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={required ? "Inquiry title (required until color configuration is selected)" : "Inquiry title (optional)"}
      required={required}
    />
  );
}
