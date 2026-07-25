import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot Password?"
      subtitle="Enter your email and we will send you a link to reset your password."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
