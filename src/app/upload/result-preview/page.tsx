export default function UploadResultPreviewPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-emerald-400">نتیجه پردازش خصوصی</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">خلاصه و فایل صوتی آماده است</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                این صفحه قرارداد نهایی تجربه کاربری خروجی فایل شخصی را نشان می‌دهد. در نسخه متصل به Runtime، متن خلاصه و فایل صوتی فقط پس از عبور از کنترل کیفیت و تأیید checksum نمایش داده می‌شوند.
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
                این بخش نمونه نمایشی رابط خروجی است. خلاصه واقعی در Runtime از متن فایل کاربر تولید می‌شود، به منبع وفادار می‌ماند و همراه با شناسه مدل، checksum و provenance ذخیره می‌شود.
              </p>
              <p>
                بعد از تأیید خلاصه، همان متن بدون بازتولید غیرضروری وارد مسیر صدای رسمی زبدینو می‌شود تا خروجی صوتی بخش‌بندی‌شده، قابل ادامه و مقاوم در برابر محدودیت سهمیه ساخته شود.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
            <h2 className="text-xl font-semibold">خلاصه صوتی</h2>
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">صدای انتخاب‌شده</p>
                  <p className="mt-1 text-xs text-zinc-500">مسیر رسمی صدای زبدینو</p>
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

              <button
                type="button"
                disabled
                className="mt-6 w-full cursor-not-allowed rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-400"
              >
                پخش پس از اتصال asset خصوصی Runtime
              </button>
            </div>
          </section>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            ["خلاصه", "تأییدشده"],
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
