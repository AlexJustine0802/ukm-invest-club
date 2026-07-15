"use client";

import ImageField from "@/components/admin/ImageField";
import SubmitButton from "@/components/admin/SubmitButton";

interface Props {
  action: (formData: FormData) => void;
  uploadEnabled: boolean;
  settings?: { homeAboutImage: string | null; aboutHeroImage: string | null };
}

export default function SettingsForm({ action, uploadEnabled, settings }: Props) {
  return (
    <form action={action} className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-navy">Home “About Us” image</h2>
        <p className="mb-2 text-sm text-slate-500">
          Picture next to the About Us text on the home page.
        </p>
        <ImageField
          label="Image"
          defaultUrl={settings?.homeAboutImage}
          uploadEnabled={uploadEnabled}
          fileName="homeAboutFile"
          urlName="homeAboutUrl"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-navy">About page hero image</h2>
        <p className="mb-2 text-sm text-slate-500">
          Background image at the top of the About page.
        </p>
        <ImageField
          label="Image"
          defaultUrl={settings?.aboutHeroImage}
          uploadEnabled={uploadEnabled}
          fileName="aboutHeroFile"
          urlName="aboutHeroUrl"
        />
      </div>

      <SubmitButton label="Save settings" />
    </form>
  );
}
