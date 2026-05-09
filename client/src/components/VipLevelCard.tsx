import React from 'react';
import { Crown, Star, Award, Users, Trophy, Zap } from 'lucide-react';
import { getTranslation } from '../utils/translations';

interface VipLevelCardProps {
  level: number;
  badge: string;
  monthlyBonus: number;
  directReferrals: number;
  requiredReferrals: number;
  language?: string;
  isCurrentLevel?: boolean;
}

export default function VipLevelCard({
  level,
  badge,
  monthlyBonus,
  directReferrals,
  requiredReferrals,
  language = 'am',
  isCurrentLevel = false
}: VipLevelCardProps) {
  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'bronze': return <Award className="h-6 w-6 text-orange-600" />;
      case 'silver': return <Star className="h-6 w-6 text-gray-500" />;
      case 'gold': return <Crown className="h-6 w-6 text-yellow-500" />;
      case 'platinum': return <Crown className="h-6 w-6 text-purple-600" />;
      case 'diamond': return <Trophy className="h-6 w-6 text-blue-600" />;
      case 'master': return <Zap className="h-6 w-6 text-red-600" />;
      default: return <Users className="h-6 w-6 text-gray-400" />;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'bronze': return 'from-orange-400 to-orange-600';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-purple-400 to-purple-600';
      case 'diamond': return 'from-blue-400 to-blue-600';
      case 'master': return 'from-red-400 to-red-600';
      default: return 'from-gray-300 to-gray-500';
    }
  };

  const progress = Math.min((directReferrals / requiredReferrals) * 100, 100);

  return (
    <div className={`relative bg-white rounded-xl shadow-lg p-6 border-2 transition-all duration-300 hover:shadow-xl ${isCurrentLevel ? 'border-gold-400 ring-2 ring-gold-200' : 'border-gray-200'
      }`}>
      {isCurrentLevel && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gold-500 text-black px-3 py-1 rounded-full text-xs font-bold">
            {getTranslation('currentLevel', language)}
          </span>
        </div>
      )}

      <div className="text-center">
        {/* VIP Badge */}
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${getBadgeColor(badge)} mb-4`}>
          {getBadgeIcon(badge)}
        </div>

        {/* Level Info */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {getTranslation('vipLevel', language)} {level}
        </h3>
        <p className="text-lg font-semibold text-gray-700 mb-1">
          {getTranslation(badge, language)}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          {getTranslation(`vipLevel${level}`, language)}
        </p>

        {/* Monthly Bonus */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 mb-4">
          <p className="text-sm text-green-700 mb-1">
            {getTranslation('monthlyBonus', language)}
          </p>
          <p className="text-2xl font-bold text-green-800">
            {monthlyBonus.toLocaleString()} {getTranslation('birr', language)}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{directReferrals} / {requiredReferrals}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${getBadgeColor(badge)}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {requiredReferrals - directReferrals > 0
              ? `${requiredReferrals - directReferrals} more needed`
              : 'Level achieved!'
            }
          </p>
        </div>

        {/* Requirements */}
        <div className="text-sm text-gray-600">
          <p className="font-medium">{getTranslation('directReferrals', language)}: {requiredReferrals}</p>
        </div>
      </div>
    </div>
  );
}