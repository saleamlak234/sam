import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Crown, Users, TrendingUp, Award, Star, Trophy, Zap } from 'lucide-react';
import VipLevelCard from '../components/VipLevelCard';
import { getTranslation } from '../utils/translations';
import axios from 'axios';

interface VipStats {
  vipLevel: number;
  vipBadge: string;
  vipMonthlyBonus: number;
  directReferrals: number;
  totalTeamSize: number;
  totalVipEarnings: number;
  monthlyVipEarnings: number;
  nextLevelRequirement: any;
}

export default function VipLevels() {
  const { user } = useAuth();
  const [vipStats, setVipStats] = useState<VipStats | null>(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('am');

  useEffect(() => {
    fetchVipData();
  }, []);

  const fetchVipData = async () => {
    try {
      const [statsResponse, leaderboardResponse] = await Promise.all([
        axios.get('/vip/stats'),
        axios.get('/vip/leaderboard')
      ]);

      setVipStats(statsResponse.data);
      setLeaderboard(leaderboardResponse.data.leaderboard);
    } catch (error) {
      console.error('Failed to fetch VIP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const vipLevels = [
    { level: 1, badge: 'bronze', monthlyBonus: 10000, requiredReferrals: 13 },
    { level: 2, badge: 'silver', monthlyBonus: 17000, requiredReferrals: 20 },
    { level: 3, badge: 'gold', monthlyBonus: 25000, requiredReferrals: 30 },
    { level: 4, badge: 'platinum', monthlyBonus: 35000, requiredReferrals: 40 },
    { level: 5, badge: 'diamond', monthlyBonus: 80000, requiredReferrals: 40, requiredTeam: 540 },
    { level: 6, badge: 'master', monthlyBonus: 150000, requiredReferrals: 40, requiredTeam: 1000 }
  ];

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'bronze': return <Award className="w-5 h-5 text-orange-600" />;
      case 'silver': return <Star className="w-5 h-5 text-gray-500" />;
      case 'gold': return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'platinum': return <Crown className="w-5 h-5 text-purple-600" />;
      case 'diamond': return <Trophy className="w-5 h-5 text-blue-600" />;
      case 'master': return <Zap className="w-5 h-5 text-red-600" />;
      default: return <Users className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4 space-x-2">
            <Crown className="w-8 h-8 text-gold-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              {getTranslation('vipLevels', language)}
            </h1>
          </div>
          <p className="max-w-2xl mx-auto text-gray-600">
            በኢትዮጵያ ውስጥ ተጨማሪ ገቢ ለማግኘት የሚያስችል የVIP ደረጃ መረጃ
          </p>

          {/* Language Selector */}
          <div className="flex justify-center mt-4 space-x-2">
            {[
              { code: 'am', name: 'አማርኛ' },
              { code: 'ti', name: 'ትግርኛ' },
              { code: 'or', name: 'ኦሮምኛ' },
              { code: 'en', name: 'English' }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${language === lang.code
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Current VIP Status */}
        {vipStats && (
          <div className="p-6 mb-8 border bg-gradient-to-r from-gold-50 to-gold-100 rounded-xl border-gold-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-gold-200">
                  {getBadgeIcon(vipStats.vipBadge)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gold-900">
                    {vipStats.vipLevel > 0
                      ? `${getTranslation('vipLevel', language)} ${vipStats.vipLevel} - ${getTranslation(vipStats.vipBadge, language)}`
                      : 'No VIP Level Yet'
                    }
                  </h3>
                  <p className="text-gold-700">
                    {getTranslation('directReferrals', language)}: {vipStats.directReferrals}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gold-900">
                  {vipStats.vipMonthlyBonus.toLocaleString()} {getTranslation('birr', language)}
                </p>
                <p className="text-gold-700">{getTranslation('monthlyBonus', language)}</p>
              </div>
            </div>
          </div>
        )}

        {/* VIP Level Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          {vipLevels.map((level) => (
            <VipLevelCard
              key={level.level}
              level={level.level}
              badge={level.badge}
              monthlyBonus={level.monthlyBonus}
              directReferrals={vipStats?.directReferrals || 0}
              requiredReferrals={level.requiredReferrals}
              language={language}
              isCurrentLevel={vipStats?.vipLevel === level.level}
            />
          ))}
        </div>

        {/* VIP Leaderboard */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="p-6 border-b border-gray-200">
            <h3 className="flex items-center space-x-2 text-xl font-semibold text-gray-900">
              <Trophy className="w-6 h-6 text-gold-500" />
              <span>VIP Leaderboard</span>
            </h3>
          </div>

          {leaderboard.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {leaderboard.slice(0, 10).map((leader: any, index) => (
                <div key={leader._id} className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-gold-500' :
                      index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' :
                          'bg-gray-300 text-gray-700'
                      }`}>
                      {index + 1}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getBadgeIcon(leader.vipBadge)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{leader.fullName}</h4>
                        <p className="text-sm text-gray-600">
                          {getTranslation('vipLevel', language)} {leader.vipLevel} - {getTranslation(leader.vipBadge, language)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {leader.directReferrals} {getTranslation('directReferrals', language)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {leader.totalTeamSize} {getTranslation('teamSize', language)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No VIP members yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}