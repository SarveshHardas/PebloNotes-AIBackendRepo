import * as React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { Eye, EyeOff, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: LucideIcon;
  registerProps?: UseFormRegisterReturn;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, type = "text", icon: Icon, registerProps, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full flex flex-col gap-1.5 font-sans text-left">
        <div className="flex items-center justify-between px-0.5">
          <label
            className={cn(
              "text-xs font-medium transition-colors",
              error ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {label}
          </label>
        </div>
        
        <div className="relative group">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground/70 group-focus-within:text-primary transition-colors">
              <Icon className="h-4 w-4" />
            </div>
          )}
          
          <Input
            type={resolvedType}
            ref={ref}
            className={cn(
              "h-10 w-full transition-all text-sm rounded-lg border bg-background focus-visible:ring-3 font-medium tracking-normal px-3.5 py-2",
              Icon && "pl-10",
              isPassword && "pr-10",
              error
                ? "border-destructive/60 focus-visible:ring-destructive/20"
                : "border-border hover:border-border-hover focus-visible:border-primary/60 focus-visible:ring-primary/10",
              className
            )}
            {...registerProps}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 outline-none focus-visible:ring-2 ring-ring/50 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
              <span className="sr-only">Toggle password visibility</span>
            </button>
          )}
        </div>

        {error && (
          <span className="px-0.5 text-[11px] text-destructive font-medium flex items-center gap-1 animate-in fade-in-50 slide-in-from-top-1 duration-200">
            <span>•</span> {error}
          </span>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
