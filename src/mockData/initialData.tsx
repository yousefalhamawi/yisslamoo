
import React from 'react';
import { Product, Testimonial, Feature } from '../types/index';

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "صندوق الورد الملكي",
    slug: "royal-flower-box",
    sku: "YSL-1001",
    description: "مجموعة فاخرة من الورود الطبيعية المنتقاة بعناية، مغلفة بتغليف يسلمو الخاص.",
    longDescription: "هذا الصندوق يمثل قمة الفخامة والرقي. تم اختيار كل وردة فيه يدوياً لضمان أعلى مستويات الجودة والجمال. يأتي الصندوق بتصميم عصري وأنيق يناسب جميع المناسبات السعيدة، من ذكرى الزواج إلى التخرج أو حتى كهدية شكر راقية.",
    price: 450000,
    image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519340333755-56e9c1d04579?q=80&w=800&auto=format&fit=crop"
    ],
    category: "صناديق المناسبات",
    isTrending: true,
    isNew: true,
    availableColors: ["#FFB6C1", "#FF69B4", "#FFFFFF"],
    canEngrave: true,
    stock: 15,
    features: [
      { name: "نوع الورد", value: "جوري هولندي فاخر" },
      { name: "عدد الورود", value: "٢٥-٣٠ وردة" },
      { name: "مدة النضارة", value: "٧-١٠ أيام" },
      { name: "التغليف", value: "صندوق مخملي أسود" }
    ],
    specifications: {
      material: "مخمل طبيعي",
      weight: "١.٥ كغ",
      dimensions: "٣٠ × ٣٠ × ٢٠ سم"
    }
  },
  {
    id: "2",
    name: "طقم المكتب الجلدي",
    slug: "leather-office-set",
    sku: "YSL-1002",
    description: "طقم مكتب متكامل من الجلد الطبيعي الفاخر، يضفي لمسة من الاحترافية على مكتبك.",
    longDescription: "صمم هذا الطقم للمدراء وكبار الشخصيات الذين يقدرون الجودة والتفاصيل. مصنوع من أجود أنواع الجلود الطبيعية التي تكتسب جمالاً مع مرور الوقت. يتضمن الطقم قاعدة مكتب، حامل أقلام، ومنظم أوراق، كلها منسقة بعناية لتوفير تجربة عمل مريحة وفاخرة.",
    price: 850000,
    discountPrice: 750000,
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop",
    category: "هدايا رجالية",
    availableColors: ["#4B3621", "#000000", "#8B4513"],
    canEngrave: true,
    stock: 8,
    features: [
      { name: "نوع الجلد", value: "جلد بقر طبيعي ١٠٠٪" },
      { name: "الصناعة", value: "يدوية بالكامل" },
      { name: "الضمان", value: "سنتان ضد عيوب التصنيع" }
    ],
    specifications: {
      material: "جلد طبيعي",
      weight: "٢.٢ كغ",
      dimensions: "٦٠ × ٤٠ سم (القاعدة)"
    }
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "فيصل العتيبي",
    role: "عميل متميز",
    content: "طلبت صندوق الورد لذكرى زواجي، كان التغليف يفوق الوصف والورود كانت كأنها قطفت للتو. شكراً لنخبة.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop"
  },
  {
    id: "2",
    name: "نورة القحطاني",
    role: "مصممة حفلات",
    content: "أفضل مكان للحصول على هدايا تليق بالمدراء وكبار الشخصيات. الدقة في النقش وجودة الجلد مذهلة.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
  }
];

export const FEATURES: Feature[] = [
  {
    title: "تغليف ملكي",
    description: "كل هدية مغلفة بأجود أنواع الورق والأشرطة الحريرية لتليق بمن تحب.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  },
  {
    title: "بطاقات مخصصة",
    description: "نكتب رسائلك بخط اليد أو بنقش احترافي لتصل مشاعرك بصدق.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  },
  {
    title: "توصيل للمناسبات",
    description: "نضمن وصول هديتك في الموعد المحدد والوقت الذي تختار لدقة المفاجأة.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
];
