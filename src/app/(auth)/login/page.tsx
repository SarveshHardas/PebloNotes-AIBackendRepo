"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { Loader2 } from "lucide-react";

const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email.")
    .email("This doesn't look like a valid email address."),
  password: z
    .string()
    .min(1, "Password is required."),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const initialEmail = searchParams.get("email") || "";
  const redirectFrom = searchParams.get("from") || "/dashboard";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: initialEmail,
      password: "",
    },
    mode: "onBlur",
  });

  React.useEffect(() => {
    if (initialEmail) {
      setValue("email", initialEmail);
    }
  }, [initialEmail, setValue]);

  const onSubmit = async (data: LoginFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || "Invalid email or password.";
        throw new Error(errorMessage);
      }

      toast.success(`Welcome back, ${result.user?.name || "there"}!`, {
        icon: "✨",
      });
      setTimeout(() => {
        router.push(redirectFrom);
        router.refresh();
      }, 800);

    } catch (err: any) {
      toast.error(err.message || "Login failed. Please check your credentials.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full text-left">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="font-subheading text-2xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h2>
        <p className="font-sans text-sm text-muted-foreground">
          Sign in to resume your notes and learning nodes.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <FormInput
          label="Work email"
          type="email"
          placeholder="name@company.com"
          icon={Mail}
          error={errors.email?.message}
          disabled={isSubmitting}
          autoComplete="email"
          registerProps={register("email")}
        />

        <div className="space-y-1">
          <FormInput
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            disabled={isSubmitting}
            autoComplete="current-password"
            registerProps={register("password")}
          />
          <div className="flex justify-end px-0.5 pt-1">
            <Link
              href="#"
              className="text-xs font-sans font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 h-10 shadow-sm font-sans w-full bg-primary hover:bg-primary/90 transition-all disabled:opacity-80 disabled:cursor-not-allowed select-none"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Authenticating...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </Button>
      </form>

      <div className="mt-8 text-center border-t border-border/40 pt-6">
        <p className="font-sans text-sm text-muted-foreground">
          New to Peblo Notes?{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground hover:text-primary underline-offset-4 hover:underline transition-colors"
          >
            Create workspace
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={
      <div className="flex flex-col gap-6 w-full">
        <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
        <div className="h-16 w-full rounded-lg bg-muted animate-pulse" />
        <div className="h-16 w-full rounded-lg bg-muted animate-pulse" />
        <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
      </div>
    }>
      <LoginForm />
    </React.Suspense>
  );
}
