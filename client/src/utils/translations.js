export const translations = {
  am: {
    // VIP Levels
    vipLevels: "የVIP ደረጃዎች",
    vipLevel: "VIP ደረጃ",
    vipBadge: "VIP ባッጅ",
    monthlyBonus: "ወርሃዊ ጉርሻ",
    directReferrals: "ቀጥታ ግብዣዎች",
    teamSize: "የቡድን መጠን",

    // VIP Badges
    bronze: "ብሮንዝ",
    silver: "ሲልቨር",
    gold: "ጎልድ",
    platinum: "ፕላቲነም",

    // VIP Descriptions
    vipLevel1: "መነሻ VIP - 13 ቀጥታ ግብዣ",
    vipLevel2: "መካከለኛ VIP - 20 ቀጥታ ግብዣ",
    vipLevel3: "ከፍተኛ VIP - 30 ቀጥታ ግብዣ",
    vipLevel4: "ፕሪሚየም VIP - 40 ቀጥታ ግብዣ",

    // Common
    birr: "ብር",
    level: "ደረጃ",
  },

  ti: {
    // VIP Levels
    vipLevels: "VIP ደረጃታት",
    vipLevel: "VIP ደረጃ",
    vipBadge: "VIP ምልክት",
    monthlyBonus: "ወርሓዊ ጉርሻ",
    directReferrals: "ቀጥታዊ ዓድማት",
    teamSize: "ናይ ጉጅለ ዓቐን",

    // VIP Badges
    bronze: "ብሮንዝ",
    silver: "ብሩር",
    gold: "ወርቂ",
    platinum: "ፕላቲነም",

    // VIP Descriptions
    vipLevel1: "መጀመርታ VIP - 10 ቀጥታዊ ዓድማት",
    vipLevel2: "ማእከላይ VIP - 20 ቀጥታዊ ዓድማት",
    vipLevel3: "ላዕለዋይ VIP - 30 ቀጥታዊ ዓድማት",
    vipLevel4: "ፕሪሚየም VIP - 40 ቀጥታዊ ዓድማት",

    // Common
    birr: "ብር",
    level: "ደረጃ",
  },

  or: {
    // VIP Levels
    vipLevels: "Sadarkaalee VIP",
    vipLevel: "Sadarkaa VIP",
    vipBadge: "Mallattoo VIP",
    monthlyBonus: "Badhaasa Ji'aa",
    directReferrals: "Afeerraa Kallattii",
    teamSize: "Bal'ina Garee",

    // VIP Badges
    bronze: "Naasii",
    silver: "Meetii",
    gold: "Warqee",
    platinum: "Palaatiinaam",

    // VIP Descriptions
    vipLevel1: "VIP Jalqabaa - Afeerraa kallattii 10",
    vipLevel2: "VIP Giddugaleessaa - Afeerraa kallattii 20",
    vipLevel3: "VIP Olaanaa - Afeerraa kallattii 30",
    vipLevel4: "VIP Piriimiyaam - Afeerraa kallattii 40",

    // Common
    birr: "birr",
    level: "sadarkaa",
  },

  en: {
    // VIP Levels
    vipLevels: "VIP Levels",
    vipLevel: "VIP Level",
    vipBadge: "VIP Badge",
    monthlyBonus: "Monthly Bonus",
    directReferrals: "Direct Referrals",
    teamSize: "Team Size",

    // VIP Badges
    bronze: "Bronze",
    silver: "Silver",
    gold: "Gold",
    platinum: "Platinum",

    // VIP Descriptions
    vipLevel1: "Starter VIP - 10 Direct Referrals",
    vipLevel2: "Intermediate VIP - 20 Direct Referrals",
    vipLevel3: "Advanced VIP - 30 Direct Referrals",
    vipLevel4: "Premium VIP - 40 Direct Referrals",

    // Common
    birr: "ETB",
    level: "level",
  },
};

export const getTranslation = (key, language = "am") => {
  return translations[language]?.[key] || translations.en[key] || key;
};
