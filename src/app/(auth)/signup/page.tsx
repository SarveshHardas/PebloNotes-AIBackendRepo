"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { Loader2 } from "lucide-react";

const signupFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name.")
    .max(50, "Name cannot exceed 50 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email.")
    .email("This doesn't look like a valid email address."),
  password: z
    .string()
    .min(6, "Use at least 6 characters for security."),
});

type SignupFormData = z.infer<typeof signupFormSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    mode: "onBlur", 
  });

  const onSubmit = async (data: SignupFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || (result.errors && result.errors[0]) || "Registration failed.";
        throw new Error(errorMessage);
      }
      toast.success("Account created! Let's get you signed in.", {
        duration: 4000,
      });
      
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(data.email)}`);
      }, 1200);

    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full text-left">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="font-subheading text-2xl font-semibold tracking-tight text-foreground">
          Create your account
        </h2>
        <p className="font-sans text-sm text-muted-foreground">
          Get started with Peblo's intuitive AI universe.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <FormInput
          label="Full name"
          placeholder="E.g., John Doe"
          icon={User}
          error={errors.name?.message}
          disabled={isSubmitting}
          autoComplete="name"
          registerProps={register("name")}
        />

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

        <FormInput
          label="Create password"
          type="password"
          placeholder="Min 6 characters"
          icon={Lock}
          error={errors.password?.message}
          disabled={isSubmitting}
          autoComplete="new-password"
          registerProps={register("password")}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-10 shadow-sm font-sans w-full bg-primary hover:bg-primary/90 transition-all disabled:opacity-80 disabled:cursor-not-allowed select-none"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Setting up your workspace...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          )}
        </Button>
      </form>

      <div className="mt-8 text-center border-t border-border/40 pt-6">
        <p className="font-sans text-sm text-muted-foreground">
          Already have a workspace?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground hover:text-primary underline-offset-4 hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
