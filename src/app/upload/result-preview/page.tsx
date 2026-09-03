import SourceEvidenceList from "@/components/SourceEvidenceList";
import { APPROVED_VOICE_PROFILES } from "@/lib/voices";

const previewEvidence = [
  {
    sourceRef: "page:1",
    startOffset: 0,
    endOffset: 842,
  },
  {
    sourceRef: "page:2:part:1",
    startOffset: 843,
    endOffset: 1710,
  },
];

export default function UploadResultPreviewPage() {
  const approvedVoices = Object.values(APPROVED_VOICE_PROFILES);

  return (
    <main dir="rtl" className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-emerald-400">نتیجه پردازش خصوصی</p>
                <span className="rounded-full border border-zinc-700 bg-zinc-950/60 px-2.5 py-1 text-[11px] text-zinc-400">قرارداد تجربه نهایی</span>
              </div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">خلاصه، منبع و فایل صوتی در یک تجربه واحد</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                این صفحه شکل نهایی تجربه خروجی فایل شخصی را نشان می‌دهد. در Runtime واقعی، خلاصه، Evidence و صوت فقط بعد از کنترل کیفیت، checksum و تأیید provenance نمایش داده می‌شوند.
              </p>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
              تأییدشده
            </span>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">خلاصه فارسی</h2>
              <span className="text-xs text-zinc-500">خصوصی · قابل انتشار نیست</span>
            </div>
            <div className="mt-6 space-y-4 text-[15px] leading-8 text-zinc-300">
              <p>
                خلاصه واقعی در Runtime از متن فایل کاربر تولید می‌شود، به منبع وفادار می‌ماند و همراه با شناسه مدل، checksum و provenance ذخیره می‌شود.
              </p>
              <p>
                بعد از تأیید خلاصه، همان متن وارد مسیر صدای رسمی زبدینو می‌شود تا خروجی صوتی بخش‌بندی‌شده، قابل ادامه و مقاوم در برابر محدودیت سهمیه ساخته شود.
              </p>
            </div>

            <div className="mt-6 border-t border-zinc-800 pt-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-zinc-100">منابع و شواهد</h3>
                  <p className="mt-1 text-xs leading-6 text-zinc-500">کاربر باید بداند هر خلاصه از کدام بخش فایل آمده است.</p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">Evidence</span>
              </div>
              <SourceEvidenceList evidence={previewEvidence} />
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
            <h2 className="text-xl font-semibold">خلاصه صوتی</h2>
            <p className="mt-2 text-sm leading-7 text-zinc-500">در Runtime واقعی فقط asset تأییدشده قابل پخش است.</p>

            <div className="mt-5 space-y-3">
              {approvedVoices.map((voice) => (
                <div key={voice.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{voice.labelFa}</p>
                      <p className="mt-1 text-xs text-zinc-500" dir="ltr">{voice.providerVoice}</p>
                    </div>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">Approved</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">پخش امن Runtime</p>
                  <p className="mt-1 text-xs text-zinc-500">segmentهای verified با session/resume token</p>
                </div>
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">Verified asset</span>
              </div>

              <div className="mt-6">
                <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full w-2/3 rounded-full bg-zinc-200" />
                </div>
                <div className="mt-2 flex justify-between text-xs text-zinc-500">
                  <span>۰۳:۱۸</span>
                  <span>۰۵:۰۲</span>
                </div>
              </div>

              <p className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-center text-xs leading-6 text-zinc-500">
                پلیر واقعی داخل مسیر Upload و کتابخانه خصوصی فعال است؛ این صفحه فقط قرارداد UX خروجی را نمایش می‌دهد.
              </p>
            </div>
          </section>
        </div>

        <section className="grid gap-4 sm:grid-cols-4">
          {[
            ["خلاصه", "تأییدشده"],
            ["Evidence", "قابل مشاهده"],
            ["صوت", "بخش‌بندی و checkpoint"],
            ["حریم خصوصی", "فقط کتابخانه شخصی"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
              <p className="text-xs text-zinc-500">{label}</p>
              <p className="mt-2 text-sm font-medium text-zinc-200">{value}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
