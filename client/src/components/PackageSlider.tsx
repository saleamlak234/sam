// import React, { useState, useEffect } from 'react';
// import { ChevronLeft, ChevronRight, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';

// const packages = [
//   {
//     id: 1,
//     name: 'Full Stock Package',
//     price: 70000,
//     monthlyReturn: '20%',
//     description: 'Complete stock market package with maximum returns',
//     features: ['Full market access', 'Premium support', 'Quarterly withdrawals', 'Maximum earnings'],
//     icon: TrendingUp,
//     gradient: 'from-blue-600 to-blue-800'
//   },
//   {
//     id: 2,
//     name: 'Half Stock Package',
//     price: 35000,
//     monthlyReturn: '20%',
//     description: 'Balanced investment for steady growth',
//     features: ['Market access', 'Standard support', 'Quarterly withdrawals', 'Good returns'],
//     icon: DollarSign,
//     gradient: 'from-green-600 to-green-800'
//   },
//   {
//     id: 3,
//     name: 'Quarter Stock Package',
//     price: 17500,
//     monthlyReturn: '20%',
//     description: 'Entry-level package for beginners',
//     features: ['Basic access', 'Email support', 'Quarterly withdrawals', 'Steady growth'],
//     icon: Users,
//     gradient: 'from-purple-600 to-purple-800'
//   },
//   {
//     id: 4,
//     name: 'Minimum Stock Package',
//     price: 7000,
//     monthlyReturn: '20%',
//     description: 'Starter package for new investors',
//     features: ['Limited access', 'Basic support', 'Quarterly withdrawals', 'Entry returns'],
//     icon: Calendar,
//     gradient: 'from-orange-600 to-orange-800'
//   }
// ];

// export default function PackageSlider() {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isAutoPlaying, setIsAutoPlaying] = useState(true);

//   useEffect(() => {
//     if (!isAutoPlaying) return;

//     const interval = setInterval(() => {
//       setCurrentIndex((prevIndex) => 
//         prevIndex === packages.length - 1 ? 0 : prevIndex + 1
//       );
//     }, 4000);

//     return () => clearInterval(interval);
//   }, [isAutoPlaying]);

//   const nextSlide = () => {
//     setCurrentIndex(currentIndex === packages.length - 1 ? 0 : currentIndex + 1);
//     setIsAutoPlaying(false);
//   };

//   const prevSlide = () => {
//     setCurrentIndex(currentIndex === 0 ? packages.length - 1 : currentIndex - 1);
//     setIsAutoPlaying(false);
//   };

//   const goToSlide = (index: number) => {
//     setCurrentIndex(index);
//     setIsAutoPlaying(false);
//   };

//   return (
//     <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white overflow-hidden">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//         <div className="relative">
//           {/* Slider Content */}
//           <div className="flex transition-transform duration-500 ease-in-out"
//                style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
//             {packages.map((pkg, index) => {
//               const IconComponent = pkg.icon;
//               return (
//                 <div key={pkg.id} className="w-full flex-shrink-0">
//                   <div className={`bg-gradient-to-r ${pkg.gradient} rounded-lg p-6 mx-2`}>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center space-x-4">
//                         <div className="bg-white/20 p-3 rounded-full">
//                           <IconComponent className="h-6 w-6" />
//                         </div>
//                         <div>
//                           <h3 className="text-lg font-bold">{pkg.name}</h3>
//                           <p className="text-sm opacity-90">{pkg.description}</p>
//                         </div>
//                       </div>

//                       <div className="text-right">
//                         <div className="text-2xl font-bold">
//                           {pkg.price.toLocaleString()} ETB
//                         </div>
//                         <div className="text-sm opacity-90">
//                           {pkg.monthlyReturn} Monthly Return
//                         </div>
//                       </div>
//                     </div>

//                     <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
//                       {pkg.features.map((feature, idx) => (
//                         <div key={idx} className="text-xs bg-white/10 rounded px-2 py-1 text-center">
//                           {feature}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Navigation Arrows */}
//           <button
//             onClick={prevSlide}
//             className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors z-10"
//           >
//             <ChevronLeft className="h-5 w-5" />
//           </button>

//           <button
//             onClick={nextSlide}
//             className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors z-10"
//           >
//             <ChevronRight className="h-5 w-5" />
//           </button>
//         </div>

//         {/* Dots Indicator */}
//         <div className="flex justify-center space-x-2 mt-4">
//           {packages.map((_, index) => (
//             <button
//               key={index}
//               onClick={() => goToSlide(index)}
//               className={`w-2 h-2 rounded-full transition-colors ${
//                 index === currentIndex ? 'bg-white' : 'bg-white/50'
//               }`}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';

// Define your translations (example)
const translations = {
  en: {
    minimumStockPackage: 'Minimum Stock Package',
    halfStockPackage: 'Half Stock Package',
    fullStockPackage: 'Full Stock Package',
    quarterStockPackage: 'Quarter Stock Package',
    completeStockMarketPackage: 'Complete stock market package with maximum returns',
    balancedInvestment: 'Balanced investment for steady growth',
    entryLevelPackage: 'Entry-level package for beginners',
    starterPackage: 'Starter package for new investors',
    fullMarketAccess: 'Full market access',
    premiumSupport: 'Premium support',
    dailyWithdrawals: 'Daily withdrawals',
    maximumEarnings: 'Maximum earnings',
    marketAccess: 'Market access',
    standardSupport: 'Standard support',
    goodReturns: 'Good returns',
    basicAccess: 'Basic access',
    emailSupport: 'Email support',
    steadyGrowth: 'Steady growth',
    limitedAccess: 'Limited access',
    basicSupport: 'Basic support',
    entryReturns: 'Entry returns'
  },
  om: { // Oromo
    minimumStockPackage: 'Xiqqaa Hissa Gabaa',
    halfStockPackage: 'Walakkaa Hissa Gabaa',
    fullStockPackage: 'Guutuu Hissa Gabaa',
    quarterStockPackage: 'Afur Hissa Gabaa',
    completeStockMarketPackage: 'Gabaa hissa guutuu deebii ol aanaa qabu',
    balancedInvestment: 'Invastimantii madaalamaa guddina tasgabbaa\'eef',
    entryLevelPackage: 'Paakeejii sadarkaa seensa jalqabtootaaf',
    starterPackage: 'Paakeejii jalqabaa invastaroota haaraaf',
    fullMarketAccess: 'Gabaa guutuu argachuu',
    premiumSupport: 'Deeggarsa olaanaa',
    dailyWithdrawals: 'Guyyaa guyyaan baasuu',
    maximumEarnings: 'Bu\'aa ol aanaa',
    marketAccess: 'Gabaa argachuu',
    standardSupport: 'Deeggarsa idilee',
    goodReturns: 'Deebii gaarii',
    basicAccess: 'Argama bu\'uuraa',
    emailSupport: 'Deeggarsa iimeelii',
    steadyGrowth: 'Guddina tasgabbaa\'aa',
    limitedAccess: 'Argama daangeffame',
    basicSupport: 'Deeggarsa bu\'uuraa',
    entryReturns: 'Deebii seensa'
  },
  am: { // Amharic
    minimumStockPackage: 'ትንሹ የአክሲዮን ጥቅል',
    halfStockPackage: 'ግማሽ የአክሲዮን ጥቅል',
    fullStockPackage: 'ሙሉ የአክሲዮን ጥቅል',
    quarterStockPackage: 'ሩብ የአክሲዮን ጥቅል',
    completeStockMarketPackage: 'ከፍተኛ ትርፍ ያለው የተሟላ የአክሲዮን ገበያ ጥቅል',
    balancedInvestment: 'ለተረጋጋ እድገት ሚዛናዊ ኢንቨስትመንት',
    entryLevelPackage: 'ለመጀመርያ ደረጃ ጥቅል',
    starterPackage: 'ለአዳዲስ ባለሀብቶች መነሻ ጥቅል',
    fullMarketAccess: 'ሙሉ የገበያ ተደራሽነት',
    premiumSupport: 'ፕሪሚየም ድጋፍ',
    dailyWithdrawals: 'ዕለታዊ ገንዘብ ማውጣት',
    maximumEarnings: 'ከፍተኛ ገቢ',
    marketAccess: 'የገበያ ተደራሽነት',
    standardSupport: 'መደበኛ ድጋፍ',
    goodReturns: 'ጥሩ ተመላሾች',
    basicAccess: 'መሰረታዊ ተደራሽነት',
    emailSupport: 'የኢሜል ድጋፍ',
    steadyGrowth: 'የተረጋጋ እድገት',
    limitedAccess: 'የተገደበ ተደራሽነት',
    basicSupport: 'መሰረታዊ ድጋፍ',
    entryReturns: 'የመግቢያ ተመላሾች'
  },
  ti: { // Tigrinya
    minimumStockPackage: 'ንእሽቶ ፓኬጅ ሸርፊ',
    halfStockPackage: 'ፍርቂ ፓኬጅ ሸርፊ',
    fullStockPackage: 'ምሉእ ፓኬጅ ሸርፊ',
    quarterStockPackage: 'ርብዒ ፓኬጅ ሸርፊ',
    completeStockMarketPackage: 'ምሉእ ዕዳጋ ሸርፊ ምስ ዝለዓለ ውጽኢት',
    balancedInvestment: 'ሚዛናዊ ኢንቨስትመንት ንተረጋጋኢ እድገት',
    entryLevelPackage: 'ፓኬጅ መእተዊ ደረጃ ንጀመርቲ',
    starterPackage: 'ፓኬጅ መበገሲ ንሓደስቲ ኢንቨስተራት',
    fullMarketAccess: 'ምሉእ ተበጻሕነት ዕዳጋ',
    premiumSupport: 'ፕሪሚየም ደገፍ',
    dailyWithdrawals: 'መዓልታዊ ገንዘብ ምውጻእ',
    maximumEarnings: 'ዝለዓለ ኣታዊ',
    marketAccess: 'ተበጻሕነት ዕዳጋ',
    standardSupport: 'መደበኛ ደገፍ',
    goodReturns: 'ጽቡቕ መኽሰብ',
    basicAccess: 'መሰረታዊ ተበጻሕነት',
    emailSupport: 'ደገፍ ብኢሜይል',
    steadyGrowth: 'ተረጋጋኢ እድገት',
    limitedAccess: 'ዝተሓተረ ተበጻሕነት',
    basicSupport: 'መሰረታዊ ደገፍ',
    entryReturns: 'መኽሰብ መእተዊ'
  }
};

const packages = [
  {
    id: 1,
    nameKey: 'low Stock Package',
    price: 7000,
    descriptionKey: 'completeStockMarketPackage',
    featuresKeys: ['fullMarketAccess', 'premiumSupport', 'dailyWithdrawals', 'maximumEarnings'],
    icon: TrendingUp,
    gradient: 'from-blue-600 to-blue-800'
  },
  {
    id: 2,
    nameKey: 'Quarter Stock Package',
    price: 17500,
    descriptionKey: 'balancedInvestment',
    featuresKeys: ['marketAccess', 'standardSupport', 'dailyWithdrawals', 'goodReturns'],
    icon: DollarSign,
    gradient: 'from-green-600 to-green-800'
  },
  {
    id: 3,
    nameKey: 'Half Stock Package',
    price: 35000,
    descriptionKey: 'entryLevelPackage',
    featuresKeys: ['basicAccess', 'emailSupport', 'dailyWithdrawals', 'steadyGrowth'],
    icon: Users,
    gradient: 'from-purple-600 to-purple-800'
  },
  {
    id: 4,
    nameKey: 'full Stocke Package',
    price: 70000,
    descriptionKey: 'starterPackage',
    featuresKeys: ['limitedAccess', 'basicSupport', 'dailyWithdrawals', 'entryReturns'],
    icon: Calendar,
    gradient: 'from-orange-600 to-orange-800'
  }
];

const PackageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [language, setLanguage] = useState('en'); // Default language

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === packages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentIndex(currentIndex === packages.length - 1 ? 0 : currentIndex + 1);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex(currentIndex === 0 ? packages.length - 1 : currentIndex - 1);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
    setIsAutoPlaying(false); // Reset auto-play on language change
  };

  const t = (key: string) => {
    return translations[language][key] || key; // Fallback to key if translation not found
  };

  return (
    <div className="relative overflow-hidden text-white bg-gradient-to-r from-gray-900 to-gray-800">
      <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

        {/* Language Dropdown */}
        <div className="absolute z-20 top-2 right-2">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="p-1 text-sm text-white bg-gray-700 rounded-md"
          >
            <option value="en">English</option>
            <option value="om">Oromo</option>
            <option value="am">Amharic</option>
            <option value="ti">Tigrinya</option>
          </select>
        </div>

        <div className="relative">
          {/* Slider Content */}
          <div className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {packages.map((pkg, index) => {
              const IconComponent = pkg.icon;
              return (
                <div key={pkg.id} className="flex-shrink-0 w-full">
                  <div className={`bg-gradient-to-r ${pkg.gradient} rounded-lg p-6 mx-2`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-white/20">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{t(pkg.nameKey)}</h3>
                          <p className="text-sm opacity-90">{t(pkg.descriptionKey)}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {pkg.price.toLocaleString()} ETB
                        </div>
                        {/* <div className="text-sm opacity-90">
                          {pkg.monthlyReturn} Monthly Return
                        </div> */}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 md:grid-cols-4">
                      {pkg.featuresKeys.map((featureKey, idx) => (
                        <div key={idx} className="px-2 py-1 text-xs text-center rounded bg-white/10">
                          {t(featureKey)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 z-10 p-2 transition-colors -translate-y-1/2 rounded-full top-1/2 bg-white/20 hover:bg-white/30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 z-10 p-2 transition-colors -translate-y-1/2 rounded-full top-1/2 bg-white/20 hover:bg-white/30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-4 space-x-2">
          {packages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export default PackageSlider