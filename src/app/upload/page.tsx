import type { Metadata } from "next";

import PrivateLibrary from "@/components/PrivateLibrary";
import UserFileIngestion from "@/components/UserFileIngestion";

export const metadata: Metadata = {
  title: "تبدیل فایل | زبدینو",
  description: "فایل متنی خود را برای ساخت خلاصه فارسی و تجربه شنیداری آماده کنید.",
};

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-20">
      <div className="mb-10 max-w-3xl">
        <span className="rounded-full border border-violet-300 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-300">آزمایشگاه فایل زبدینو</span>
        <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">یک فایل، دو تجربه شنیداری</h1>
        <p className="mt-5 text-lg leading-8 text-zinc-600 dark:text-zinc-300">فایل خود را به خلاصه فارسی ساختاریافته، پادکست خلاصه یا روایت کامل تبدیل کنید. خروجی‌های خصوصی این مرورگر در کتابخانه شخصی باقی می‌مانند و دوباره قابل بازکردن هستند.</p>
      </div>
      <UserFileIngestion />
      <PrivateLibrary />
    </div>
  );
}
