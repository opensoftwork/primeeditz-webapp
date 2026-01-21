"use client";

import * as React from "react";
import { Check, ChevronDown, Globe, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

// Country data with dial codes and flags (emoji flags for simplicity)
const countries = [
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
  { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬" },
  { code: "NL", name: "Netherlands", dialCode: "+31", flag: "🇳🇱" },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹" },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸" },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽" },
  { code: "RU", name: "Russia", dialCode: "+7", flag: "🇷🇺" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
  { code: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷" },
  { code: "SE", name: "Sweden", dialCode: "+46", flag: "🇸🇪" },
  { code: "NO", name: "Norway", dialCode: "+47", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", dialCode: "+45", flag: "🇩🇰" },
  { code: "FI", name: "Finland", dialCode: "+358", flag: "🇫🇮" },
  { code: "PL", name: "Poland", dialCode: "+48", flag: "🇵🇱" },
  { code: "BE", name: "Belgium", dialCode: "+32", flag: "🇧🇪" },
  { code: "AT", name: "Austria", dialCode: "+43", flag: "🇦🇹" },
  { code: "CH", name: "Switzerland", dialCode: "+41", flag: "🇨🇭" },
  { code: "NZ", name: "New Zealand", dialCode: "+64", flag: "🇳🇿" },
  { code: "IE", name: "Ireland", dialCode: "+353", flag: "🇮🇪" },
  { code: "PT", name: "Portugal", dialCode: "+351", flag: "🇵🇹" },
  { code: "TH", name: "Thailand", dialCode: "+66", flag: "🇹🇭" },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾" },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩" },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: "🇵🇭" },
  { code: "VN", name: "Vietnam", dialCode: "+84", flag: "🇻🇳" },
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩" },
  { code: "LK", name: "Sri Lanka", dialCode: "+94", flag: "🇱🇰" },
  { code: "NP", name: "Nepal", dialCode: "+977", flag: "🇳🇵" },
  { code: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬" },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪" },
  { code: "GH", name: "Ghana", dialCode: "+233", flag: "🇬🇭" },
  { code: "TR", name: "Turkey", dialCode: "+90", flag: "🇹🇷" },
  { code: "IL", name: "Israel", dialCode: "+972", flag: "🇮🇱" },
  { code: "QA", name: "Qatar", dialCode: "+974", flag: "🇶🇦" },
  { code: "KW", name: "Kuwait", dialCode: "+965", flag: "🇰🇼" },
  { code: "BH", name: "Bahrain", dialCode: "+973", flag: "🇧🇭" },
  { code: "OM", name: "Oman", dialCode: "+968", flag: "🇴🇲" },
] as const;

export type Country = (typeof countries)[number];

// Validation helper - checks if phone number has exactly 10 digits
const REQUIRED_DIGITS = 10;

function getDigitsOnly(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, "");
}

function validatePhoneNumber(phoneNumber: string): {
  isValid: boolean;
  digitCount: number;
  error?: string;
} {
  const digits = getDigitsOnly(phoneNumber);
  const digitCount = digits.length;
  
  if (digitCount === 0) {
    return { isValid: true, digitCount, error: undefined }; // Empty is valid (optional field)
  }
  
  if (digitCount < REQUIRED_DIGITS) {
    return { 
      isValid: false, 
      digitCount, 
      error: `Phone number must be ${REQUIRED_DIGITS} digits (${digitCount}/${REQUIRED_DIGITS})` 
    };
  }
  
  if (digitCount > REQUIRED_DIGITS) {
    return { 
      isValid: false, 
      digitCount, 
      error: `Phone number must be ${REQUIRED_DIGITS} digits (${digitCount}/${REQUIRED_DIGITS})` 
    };
  }
  
  return { isValid: true, digitCount, error: undefined };
}

// Export validation helper for external use
function isValidPhoneNumber(fullPhoneNumber: string): boolean {
  if (!fullPhoneNumber || fullPhoneNumber.trim() === "") return true; // Empty is valid (optional)
  
  // Extract the phone number part (after the dial code)
  const parts = fullPhoneNumber.trim().split(" ");
  if (parts.length < 2) return false;
  
  const phoneNumber = parts.slice(1).join("");
  const { isValid } = validatePhoneNumber(phoneNumber);
  return isValid;
}

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onValidationChange?: (isValid: boolean, error?: string) => void;
  defaultCountry?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  id?: string;
  showValidation?: boolean;
  required?: boolean;
}

function PhoneInput({
  value = "",
  onChange,
  onBlur,
  onValidationChange,
  defaultCountry = "IN",
  placeholder = "Enter phone number",
  disabled = false,
  className,
  inputClassName,
  id,
  showValidation = true,
  required = false,
}: PhoneInputProps) {
  const [open, setOpen] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState<Country>(
    () => countries.find((c) => c.code === defaultCountry) || countries[0]
  );

  // Parse the phone number to extract country code and number
  const parsePhoneNumber = React.useCallback(
    (phoneValue: string): { dialCode: string; number: string } => {
      if (!phoneValue) return { dialCode: selectedCountry.dialCode, number: "" };

      // Check if starts with a dial code
      const trimmedValue = phoneValue.trim();
      if (trimmedValue.startsWith("+")) {
        // Find the matching country by dial code
        const matchingCountry = countries.find((c) =>
          trimmedValue.startsWith(c.dialCode)
        );
        if (matchingCountry) {
          return {
            dialCode: matchingCountry.dialCode,
            number: trimmedValue.slice(matchingCountry.dialCode.length).trim(),
          };
        }
      }

      return { dialCode: selectedCountry.dialCode, number: trimmedValue };
    },
    [selectedCountry]
  );

  const { number: phoneNumber } = parsePhoneNumber(value);
  
  // Validation state
  const validation = React.useMemo(() => {
    if (!phoneNumber && !required) {
      return { isValid: true, digitCount: 0, error: undefined };
    }
    if (!phoneNumber && required) {
      return { isValid: false, digitCount: 0, error: "Phone number is required" };
    }
    return validatePhoneNumber(phoneNumber);
  }, [phoneNumber, required]);

  // Notify parent of validation changes
  React.useEffect(() => {
    onValidationChange?.(validation.isValid, validation.error);
  }, [validation.isValid, validation.error, onValidationChange]);

  // Handle phone number change with digit limit
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Only allow numbers, spaces, and hyphens
    const sanitized = inputValue.replace(/[^\d\s-]/g, "");
    
    // Extract only digits to check count
    const digitsOnly = getDigitsOnly(sanitized);
    
    // Limit to 10 digits
    if (digitsOnly.length > REQUIRED_DIGITS) {
      return; // Don't allow more than 10 digits
    }
    
    const fullNumber = `${selectedCountry.dialCode} ${sanitized}`.trim();
    onChange?.(fullNumber);
  };

  // Handle blur
  const handleBlur = () => {
    setTouched(true);
    onBlur?.();
  };

  // Handle country selection
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setOpen(false);
    // Update the full number with new country code
    const fullNumber = `${country.dialCode} ${phoneNumber}`.trim();
    onChange?.(fullNumber);
  };

  const showError = showValidation && touched && !validation.isValid && phoneNumber.length > 0;
  const showDigitCounter = showValidation && phoneNumber.length > 0;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex w-full">
        {/* Country Selector */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "flex items-center justify-between gap-1 rounded-r-none border-r-0 px-2.5",
                "h-11 min-w-[90px] shrink-0",
                "bg-background/50 border-border/50 hover:bg-background/80",
                "focus:border-primary/50 focus:ring-0",
                "transition-colors duration-200",
                disabled && "opacity-50 cursor-not-allowed",
                showError && "border-destructive/50"
              )}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-lg leading-none">{selectedCountry.flag}</span>
                <span className="text-sm font-medium text-foreground/80">
                  {selectedCountry.dialCode}
                </span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[280px] p-0 bg-popover/95 backdrop-blur-xl border-border/50"
            align="start"
          >
            <Command>
              <CommandInput
                placeholder="Search country..."
                className="border-0"
              />
              <CommandList>
                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                  <Globe className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No country found.
                </CommandEmpty>
                <CommandGroup className="max-h-[280px] overflow-auto">
                  {countries.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={`${country.name} ${country.dialCode}`}
                      onSelect={() => handleCountrySelect(country)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 cursor-pointer",
                        "hover:bg-accent/50 transition-colors",
                        selectedCountry.code === country.code && "bg-accent/30"
                      )}
                    >
                      <span className="text-xl leading-none">{country.flag}</span>
                      <div className="flex flex-1 items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">
                          {country.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {country.dialCode}
                        </span>
                      </div>
                      {selectedCountry.code === country.code && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Phone Number Input */}
        <Input
          id={id}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={14} // Allow for spaces/hyphens formatting
          aria-invalid={showError}
          className={cn(
            "flex-1 rounded-l-none",
            "h-11 bg-background/50 border-border/50",
            "focus:border-primary/50 transition-colors",
            showError && "border-destructive/50 focus:border-destructive/50",
            inputClassName
          )}
        />
      </div>
      
      {/* Validation feedback */}
      {showValidation && (
        <div className="flex items-center justify-between text-xs px-1">
          {showError ? (
            <div className="flex items-center gap-1 text-destructive">
              <AlertCircle className="h-3 w-3" />
              <span>{validation.error}</span>
            </div>
          ) : (
            <span></span>
          )}
          {showDigitCounter && (
            <span className={cn(
              "font-mono tabular-nums",
              validation.isValid ? "text-muted-foreground" : "text-destructive"
            )}>
              {validation.digitCount}/{REQUIRED_DIGITS}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export { PhoneInput, countries, isValidPhoneNumber, validatePhoneNumber, REQUIRED_DIGITS };
export type { PhoneInputProps };

