import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  User, 
  ChevronDown, 
  ChevronRight,
  Award,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';
import axios from 'axios';
import { Phone } from 'lucide-react';

interface TreeNode {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  level: number;
  directReferrals: number;
  totalDeposits: number;
  totalCommissions: number;
  joinedAt: string;
  isActive: boolean;
  children: TreeNode[];
}

interface MLMStats {
  totalNetwork: number;
  directReferrals: number;
  level2Members: number;
  level3Members: number;
  level4Members: number;
  totalCommissionsEarned: number;
}

export default function MLMTree() {
  const { user } = useAuth();
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [stats, setStats] = useState<MLMStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMLMData();
  }, []);

  const fetchMLMData = async () => {
    try {
      const [treeResponse, statsResponse] = await Promise.all([
        axios.get('/mlm/tree'),
        axios.get('/mlm/stats')
      ]);
      
      setTreeData(treeResponse.data.tree);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to fetch MLM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    const getLevelColor = (level: number) => {
      switch (level) {
        case 1: return 'border-blue-200 bg-blue-50';
        case 2: return 'border-green-200 bg-green-50';
        case 3: return 'border-purple-200 bg-purple-50';
        case 4: return 'border-orange-200 bg-orange-50';
        default: return 'border-gray-200 bg-gray-50';
      }
    };

    const getLevelBadgeColor = (level: number) => {
      switch (level) {
        case 1: return 'bg-blue-100 text-blue-800';
        case 2: return 'bg-green-100 text-green-800';
        case 3: return 'bg-purple-100 text-purple-800';
        case 4: return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div key={node.id} className="ml-4">
        <div
          className={`border-2 rounded-lg p-4 mb-4 ${getLevelColor(level)} ${
            !node.isActive ? "opacity-60" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {hasChildren && (
                <button
                  onClick={() => toggleNode(node.id)}
                  className="p-1 hover:bg-white rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              )}

              <div className="bg-white p-2 rounded-full">
                <User className="h-5 w-5 text-gray-600" />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900">
                    {node.fullName}
                  </h4>
                
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(
                      level
                    )}`}
                  >
                    Level {level}
                  </span>
                  {!node.isActive && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{node.email}</p>
                <p className="text-xs text-gray-500">
                  Phone: {node.phoneNumber || 'N/A'}
                </p>
                <p className="text-xs text-gray-500">
                  Joined: {new Date(node.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Referrals</p>
                  <p className="font-semibold">{node.directReferrals}</p>
                </div>
                <div>
                  <p className="text-gray-600">Deposits</p>
                  <p className="font-semibold">
                    {node.totalDeposits.toLocaleString()} ETB
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Commissions</p>
                  <p className="font-semibold text-green-600">
                    {node.totalCommissions.toLocaleString()} ETB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-6 border-l-2 border-gray-200 pl-4">
            {node.children.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">MLM Network Tree</h1>
          <p className="text-gray-600 mt-1">Visualize your referral network and team structure</p>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Network</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalNetwork || 0}
                </p>
              </div>
              <div className="bg-primary-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Level 1</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.directReferrals || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Level 2</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.level2Members || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <User className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Level 3</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats?.level3Members || 0}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <User className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Level 4</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats?.level4Members || 0}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <User className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Commission Summary */}
        <div className="bg-gradient-to-r from-gold-50 to-gold-100 rounded-xl p-6 mb-8 border border-gold-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gold-200 p-3 rounded-full">
                <Award className="h-8 w-8 text-gold-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gold-900">Total Commissions Earned</h3>
                <p className="text-gold-700">From your entire network</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gold-900">
                {(stats?.totalCommissionsEarned || 0).toLocaleString()} ETB
              </p>
              <p className="text-gold-700">All time earnings</p>
            </div>
          </div>
        </div>

        {/* Network Tree */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Network Tree</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setExpandedNodes(new Set())}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Collapse All
                </button>
                <button
                  onClick={() => {
                    const allIds = new Set<string>();
                    const collectIds = (node: TreeNode) => {
                      allIds.add(node.id);
                      node.children?.forEach(collectIds);
                    };
                    if (treeData) collectIds(treeData);
                    setExpandedNodes(allIds);
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Expand All
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {treeData ? (
              <div>
                {/* Root Node (Current User) */}
                <div className="border-2 border-primary-200 bg-primary-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary-200 p-2 rounded-full">
                        <User className="h-6 w-6 text-primary-700" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-primary-900">{user?.fullName} (You)</h4>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-200 text-primary-800">
                            Root
                          </span>
                        </div>
                        <p className="text-sm text-primary-700">{user?.email}</p>
                        <p className="text-xs text-primary-600">
                          Member since: {new Date(user?.createdAt || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-primary-700">Direct Referrals</p>
                          <p className="font-bold text-primary-900">{user?.directReferrals || 0}</p>
                        </div>
                        <div>
                          <p className="text-primary-700">Total Deposits</p>
                          <p className="font-bold text-primary-900">{(user?.totalDeposits || 0).toLocaleString()} ETB</p>
                        </div>
                        <div>
                          <p className="text-primary-700">Total Commissions</p>
                          <p className="font-bold text-green-700">{(user?.totalCommissions || 0).toLocaleString()} ETB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Network Tree */}
                {treeData.children && treeData.children.length > 0 ? (
                  <div>
                    {treeData.children.map(child => renderTreeNode(child, 1))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No referrals yet</h3>
                    <p className="text-gray-600 mb-6">
                      Start building your network by sharing your referral code
                    </p>
                    <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-primary-800 font-medium mb-2">Your Referral Code:</p>
                      <p className="font-mono text-lg font-bold text-primary-600">
                        {user?.referralCode}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Failed to load network tree</p>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Structure</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium text-blue-900">Level 1</p>
                <p className="text-sm text-blue-700">8% Commission</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-900">Level 2</p>
                <p className="text-sm text-green-700">4% Commission</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <div>
                <p className="font-medium text-purple-900">Level 3</p>
                <p className="text-sm text-purple-700">2% Commission</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <div>
                <p className="font-medium text-orange-900">Level 4</p>
                <p className="text-sm text-orange-700">1% Commission</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}