import { TextAnimate } from "@/components/ui/text-animate";

export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="border-b border-slate-200 bg-primary-light/40 py-16">
      <div className="container-page">
        <TextAnimate
          as="h1"
          animation="blurInUp"
          by="character"
          once
          className="text-4xl font-extrabold text-navy"
        >
          {title}
        </TextAnimate>
        {subtitle && (
          <TextAnimate
            as="p"
            animation="blurInUp"
            by="word"
            once
            className="mt-3 max-w-2xl text-slate-600"
          >
            {subtitle}
          </TextAnimate>
        )}
      </div>
    </div>
  );
}
