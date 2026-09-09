export const company = {
  name: "United Aluminum",
  tagline: "Built for Arizona. Built to Last.",
  phone: "(602) 263-0834",
  phoneHref: "tel:+16022630834",
  email: "sales@unitedalum.com",
  address: "2229 W Indian School Rd",
  city: "Phoenix",
  state: "AZ",
  zip: "85015",
  hours: {
    weekday: "Mon – Fri: 7 AM – 4 PM",
    saturday: "Sat: 10 AM – 2 PM",
  },
  founded: 1968,
  serviceAreas: [
    "Phoenix",
    "Glendale",
    "Chandler",
    "Gilbert",
    "Surprise",
    "Mesa",
    "Tempe",
    "Scottsdale",
  ],
};

export const navLinks = [
  { label: "Products", href: "/products" },
  { label: "Why Aluminum", href: "/#why-aluminum" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Reviews", href: "/#reviews" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/contact" },
];

export const products = [
  {
    id: "storage-sheds",
    title: "Storage Sheds",
    shortDescription:
      "The coolest non-climate-controlled outdoor storage in Arizona heat. Maintenance-free with a 20-year baked enamel warranty.",
    description:
      "Our aluminum storage sheds don't extend heat, keeping your tools, equipment, and belongings cooler than wood or steel alternatives. Available in multiple sizes and three colors, fully customizable for HOA compliance.",
    features: [
      "Stays cooler in direct sun",
      "20-year baked enamel warranty",
      "Installation included",
      "HOA-friendly customization",
      "Never rots, rusts, or corrodes",
    ],
    image: "/images/shed.jpg",
    href: "/products/storage-sheds",
    featured: true,
  },
  {
    id: "pergolas",
    title: "Pergolas",
    shortDescription:
      "Custom Alumawood pergolas that add shade, style, and lasting value to your home.",
    description:
      "Transform your backyard with a custom-designed pergola built to withstand Arizona's extreme climate while elevating your outdoor living space.",
    features: [
      "Custom design to your specs",
      "Alumawood construction",
      "Lifetime durability",
      "Increases home value",
    ],
    image: "/images/pergola.jpg",
    href: "/products/pergolas",
    featured: true,
  },
  {
    id: "patio-covers",
    title: "Patio & Carport Covers",
    shortDescription:
      "Protect yourself and your vehicles from the Arizona sun with virtually maintenance-free aluminum covers.",
    description:
      "Our aluminum patio and carport covers provide reliable shade and protection, engineered for the desert climate with minimal upkeep required.",
    features: [
      "Vehicle & patio protection",
      "Virtually maintenance-free",
      "Custom sizing available",
      "Built for desert heat",
    ],
    image: "/images/patio-cover.jpg",
    href: "/products/patio-covers",
    featured: true,
  },
  {
    id: "screen-rooms",
    title: "Screen Rooms",
    shortDescription:
      "Insect-free outdoor living with natural breeze — perfect for Arizona evenings.",
    description:
      "Create a comfortable outdoor gathering space protected from insects while enjoying the natural airflow that makes Arizona evenings special.",
    features: [
      "Insect-free outdoor space",
      "Natural ventilation",
      "Aluminum frame construction",
      "Custom configurations",
    ],
    image: "/images/screen-room.jpg",
    href: "/products/screen-rooms",
    featured: false,
  },
  {
    id: "sun-screens",
    title: "Sun Screens",
    shortDescription:
      "Deflect solar heat before it reaches your windows — stay cooler and save on energy.",
    description:
      "Our exterior sun control screens block solar heat at the source, keeping your home comfortable through Phoenix's hottest months.",
    features: [
      "Reduces cooling costs",
      "Blocks heat before it enters",
      "Exterior-mounted efficiency",
      "Multiple style options",
    ],
    image: "/images/sun-screens.jpg",
    href: "/products/sun-screens",
    featured: false,
  },
  {
    id: "window-awnings",
    title: "Window Awnings",
    shortDescription:
      "Shade your windows from the Arizona sun while boosting curb appeal.",
    description:
      "Aluminum window awnings reduce interior heat gain and add architectural character to your home — a smart investment in comfort and aesthetics.",
    features: [
      "Reduces interior heat",
      "Enhances curb appeal",
      "Durable aluminum build",
      "Custom fit available",
    ],
    image: "/images/awning.jpg",
    href: "/products/window-awnings",
    featured: false,
  },
  {
    id: "siding-soffit",
    title: "Siding & Soffit",
    shortDescription:
      "Durable vinyl and aluminum siding and soffit panels that stand the test of time.",
    description:
      "Improve your home's appearance and protection with our range of siding and soffit products in various textures and thicknesses.",
    features: [
      "Vinyl & aluminum options",
      "Multiple textures",
      "Long-lasting protection",
      "Improves home appearance",
    ],
    image: "/images/siding.jpg",
    href: "/products/siding-soffit",
    featured: false,
  },
  {
    id: "fascia",
    title: "Standard & Custom Fascia",
    shortDescription:
      "Superior aluminum fascia — no more scraping, painting, or worrying about rot.",
    description:
      "Protect your home's wood trim with custom or standard aluminum fascia that eliminates maintenance headaches for good.",
    features: [
      "Custom & standard options",
      "No painting required",
      "Prevents wood rot",
      "Precision fabrication",
    ],
    image: "/images/fascia.jpg",
    href: "/products/fascia",
    featured: false,
  },
  {
    id: "custom-metal",
    title: "Custom Metal Brake Work",
    shortDescription:
      "Precision cutting, bending, and shaping — four baked enamel colors plus mill finish.",
    description:
      "Our in-house shear and sheet aluminum brake handles custom metal work for contractors and homeowners who need exact specifications.",
    features: [
      "In-house fabrication",
      "4 baked enamel colors",
      "Mill finish available",
      "Contractor-friendly service",
    ],
    image: "/images/custom-metal.jpg",
    href: "/products/custom-metal",
    featured: false,
  },
];

export const benefits = [
  {
    title: "Stays Cooler in the Sun",
    description:
      "Aluminum disperses heat efficiently and reflects radiant energy — your shed stays cooler inside than wood or steel alternatives.",
    icon: "sun" as const,
  },
  {
    title: "Zero Maintenance",
    description:
      "No painting, no rotting, no warping. Resistant to rust and weathering even in Maricopa County's high-UV environment.",
    icon: "shield" as const,
  },
  {
    title: "20-Year Warranty",
    description:
      "Every shed comes with a 20-year baked enamel finish warranty and a lifetime guarantee on door rollers.",
    icon: "award" as const,
  },
  {
    title: "Installation Included",
    description:
      "We handle delivery and installation with every shed purchase — you just enjoy the result.",
    icon: "truck" as const,
  },
];

export const stats = [
  { value: "55+", label: "Years in Business" },
  { value: "A+", label: "BBB Rating" },
  { value: "20yr", label: "Paint Warranty" },
  { value: "8", label: "Cities Served" },
];

export const testimonials = [
  {
    name: "Michael R.",
    location: "Scottsdale, AZ",
    text: "We looked at several shed companies and United Aluminum was the clear winner. The aluminum shed stays noticeably cooler than our old one, and the installation crew was professional and fast.",
    rating: 5,
  },
  {
    name: "Sarah & Tom K.",
    location: "Gilbert, AZ",
    text: "Our HOA had strict height requirements and United Aluminum customized our shed perfectly. Three years later it still looks brand new — no fading, no maintenance.",
    rating: 5,
  },
  {
    name: "David L.",
    location: "Phoenix, AZ",
    text: "We got a pergola and patio cover from them. The quality is outstanding and they clearly know Arizona construction. Family-owned business that actually cares.",
    rating: 5,
  },
];

export const faqs = [
  {
    question: "Do aluminum sheds retain heat in the Arizona sun?",
    answer:
      "No — this is one of our biggest advantages. Aluminum disperses heat efficiently and reflects radiant energy, keeping the interior significantly cooler than wood or steel sheds in direct sun.",
  },
  {
    question: "Are your sheds customizable for HOA guidelines?",
    answer:
      "Yes. We offer various sizes and three standard colors, and we can customize height and dimensions to comply with your HOA regulations.",
  },
  {
    question: "Do I need a foundation for an aluminum shed?",
    answer:
      "Aluminum sheds don't require a specific foundation type. We'll assess your property and recommend the best surface preparation for long-term stability.",
  },
  {
    question: "Is installation included?",
    answer:
      "Yes — delivery and installation are included with every shed purchase. A small trip charge may apply depending on your location.",
  },
  {
    question: "What warranty do you offer?",
    answer:
      "Our sheds include a 20-year baked enamel finish warranty on the exterior paint, plus a lifetime guarantee on door rollers.",
  },
  {
    question: "What areas do you serve?",
    answer:
      "We serve the greater Phoenix metro area including Glendale, Chandler, Gilbert, Surprise, Mesa, Tempe, and Scottsdale.",
  },
];

export const galleryImages = [
  {
    src: "/images/storage-buildings.jpg",
    alt: "Aluminum storage shed installed in a Phoenix backyard",
    category: "Sheds",
  },
  {
    src: "/images/pergola.jpg",
    alt: "Custom aluminum pergola over an outdoor kitchen",
    category: "Pergolas",
  },
  {
    src: "/images/patio-cover.jpg",
    alt: "Solid-roof aluminum patio cover beside a pool",
    category: "Patio Covers",
  },
  {
    src: "/images/awning.jpg",
    alt: "Aluminum window awning on a Phoenix home",
    category: "Awnings",
  },
  {
    src: "/images/siding.jpg",
    alt: "Home with vinyl and aluminum siding",
    category: "Siding",
  },
  {
    src: "/images/screen-room.jpg",
    alt: "Aluminum-framed screen room patio enclosure",
    category: "Screen Rooms",
  },
];

export const shedColors = [
  { name: "Desert Sand", hex: "#D4C4A8" },
  { name: "Navy Blue", hex: "#002868" },
  { name: "Adobe White", hex: "#F5F0E8" },
];

export const shedSizes = [
  { size: "6×8", sqft: 48 },
  { size: "8×10", sqft: 80 },
  { size: "10×12", sqft: 120 },
  { size: "10×16", sqft: 160 },
  { size: "12×20", sqft: 240 },
  { size: "Custom", sqft: 0 },
];
