export interface Book {
  slug: string;
  titleFa: string;
  titleEn: string;
  authorFa: string;
  authorEn: string;
  year: number;
  category: string;
  categoryEn: string;
  description: string;
  descriptionEn: string;
  coverUrl: string;
  keyIdeas: readonly string[];
}

export const books: readonly Book[] = [
  {
    slug: "atomic-habits",
    titleFa: "عادت‌های اتمی",
    titleEn: "Atomic Habits",
    authorFa: "جیمز کلیر",
    authorEn: "James Clear",
    year: 2018,
    category: "توسعه فردی",
    categoryEn: "Personal development",
    description:
      "تغییرات کوچک، نتایج بزرگ. یک راهنمای عملی و علمی برای ساختن عادت‌های خوب و ترک عادت‌های بد. جیمز کلیر نشان می‌دهد چگونه بهبودهای کوچک می‌توانند در طول زمان اثر بزرگی بسازند.",
    descriptionEn:
      "Small changes, remarkable results. A practical framework for building better habits, breaking bad ones, and using tiny improvements to create meaningful long-term change.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg?default=false",
    keyIdeas: [
      "عادت‌ها چرخه‌ای از نشانه، تمایل، پاسخ و پاداش هستند.",
      "برای تغییر عادت، روی سیستم‌ها تمرکز کنید نه فقط اهداف.",
      "بهبودهای کوچک در طول زمان اثر مرکب می‌سازند.",
      "محیط را طوری طراحی کنید که رفتار مطلوب آسان‌تر شود.",
    ],
  },
  {
    slug: "deep-work",
    titleFa: "کار عمیق",
    titleEn: "Deep Work",
    authorFa: "کال نیوپورت",
    authorEn: "Cal Newport",
    year: 2016,
    category: "بهره‌وری",
    categoryEn: "Productivity",
    description:
      "در دنیای پر از حواس‌پرتی، توانایی تمرکز عمیق روی کارهای سخت یک مزیت مهم است. کال نیوپورت توضیح می‌دهد چگونه می‌توان تمرکز را به یک مهارت و عادت حرفه‌ای تبدیل کرد.",
    descriptionEn:
      "In a distracted world, the ability to focus deeply on demanding work is a major advantage. Cal Newport explains how to turn sustained concentration into a professional skill and repeatable practice.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg?default=false",
    keyIdeas: [
      "کار عمیق یعنی تمرکز بدون حواس‌پرتی روی یک کار شناختی دشوار.",
      "تمرکز عمیق مهارتی کمیاب و ارزشمند است.",
      "برای کار عمیق باید زمان و محیط را آگاهانه طراحی کرد.",
      "تمرکز با تمرین مداوم قوی‌تر می‌شود.",
    ],
  },
  {
    slug: "think-again",
    titleFa: "دوباره فکر کن",
    titleEn: "Think Again",
    authorFa: "آدام گرانت",
    authorEn: "Adam Grant",
    year: 2021,
    category: "تفکر و تصمیم‌گیری",
    categoryEn: "Thinking & decision making",
    description:
      "کتابی درباره هنر بازاندیشی؛ اینکه چگونه فرض‌های قدیمی را زیر سؤال ببریم، با فروتنی فکری از دانسته‌های خود فاصله بگیریم و برای یادگیری دوباره آماده باشیم.",
    descriptionEn:
      "A book about the art of rethinking: questioning old assumptions, practicing intellectual humility, and becoming more willing to revise what we think we know.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9781984878106-L.jpg?default=false",
    keyIdeas: [
      "باورها را مثل فرضیه‌هایی ببین که باید با شواهد تازه دوباره آزموده شوند.",
      "فروتنی فکری یعنی بتوانی احتمال خطای خودت را جدی بگیری بدون اینکه هویتت را به یک عقیده گره بزنی.",
      "به‌جای دفاع از موضع، دنبال داده‌هایی بگرد که ممکن است آن را رد یا اصلاح کنند.",
      "بازاندیشی یک عادت مداوم برای یادگیری بهتر و تصمیم‌گیری دقیق‌تر است.",
    ],
  },
  {
    slug: "zero-to-one",
    titleFa: "صفر به یک",
    titleEn: "Zero to One",
    authorFa: "پیتر تیل و بلیک مسترز",
    authorEn: "Peter Thiel with Blake Masters",
    year: 2014,
    category: "کارآفرینی",
    categoryEn: "Entrepreneurship",
    description:
      "درباره ساختن چیزهای واقعاً جدید به‌جای تکرار مدل‌های موجود؛ کتابی درباره نوآوری، خلق ارزش منحصربه‌فرد و پرسش‌هایی که بنیان‌گذاران باید درباره آینده بپرسند.",
    descriptionEn:
      "A guide to building genuinely new things instead of copying existing models, focused on innovation, unique value creation, and the questions founders should ask about the future.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg?default=false",
    keyIdeas: [
      "پیشرفت جهشی از ساخت چیزی تازه می‌آید، نه فقط بهتر تکرار کردن مدل‌های موجود.",
      "کسب‌وکار ماندگار باید ارزشی متمایز خلق کند که به‌سادگی قابل جایگزینی نباشد.",
      "مزیت واقعی وقتی شکل می‌گیرد که فناوری، توزیع و مدل کسب‌وکار در یک سیستم منسجم کنار هم قرار بگیرند.",
      "بنیان‌گذار باید درباره آینده یک فرض مشخص و قابل‌آزمون داشته باشد، نه صرفاً از روندهای رایج پیروی کند.",
    ],
  },
  {
    slug: "leading-teams",
    titleFa: "تیم ایدئال",
    titleEn: "Leading Teams",
    authorFa: "ریچارد هکمن",
    authorEn: "J. Richard Hackman",
    year: 2002,
    category: "مدیریت و تیم‌سازی",
    categoryEn: "Management & teams",
    description:
      "ریچارد هکمن با تکیه بر پژوهش تیم‌های واقعی توضیح می‌دهد که عملکرد عالی بیش از کنترل لحظه‌به‌لحظه اعضا، به طراحی شرایط درست برای کار تیمی وابسته است.",
    descriptionEn:
      "J. Richard Hackman draws on research with real teams to show that excellent performance depends less on constant supervision and more on designing the right conditions for teamwork.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9781578513338-L.jpg?default=false",
    keyIdeas: [
      "کیفیت تیم بیشتر از مدیریت لحظه‌به‌لحظه، به طراحی شرایط اولیه درست وابسته است.",
      "مرزهای روشن، جهت مشترک و ساختار مناسب، پایه‌های یک تیم واقعی و پایدار هستند.",
      "حمایت سازمانی و دسترسی به منابع مناسب، احتمال عملکرد خوب تیم را به‌طور جدی افزایش می‌دهد.",
      "رهبری مؤثر بیشتر به ایجاد و تقویت شرایط موفقیت تیم مربوط است تا کنترل دائمی اعضا.",
    ],
  },
];
