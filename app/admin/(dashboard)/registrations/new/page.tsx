import Link from "next/link";
import RegistrationFormForm from "@/components/admin/RegistrationFormForm";
import { createRegistrationForm } from "../actions";

export default function NewRegistrationFormPage() {
  return (
    <div>
      <Link href="/admin/registrations" className="text-sm text-accent-dark hover:text-accent">
        ← Back to registrations
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">New registration form</h1>
      <div className="mt-6 max-w-3xl">
        <RegistrationFormForm action={createRegistrationForm} />
      </div>
    </div>
  );
}
