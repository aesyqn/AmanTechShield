import React from 'react';
import { ShieldAlertIcon, AlertTriangleIcon, CheckCircleIcon } from 'lucide-react';
interface RiskScoreDisplayProps {
  riskScore: {
    overall: number;
    technical: number;
    ethical: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}
export function RiskScoreDisplay({
  riskScore
}: RiskScoreDisplayProps) {
  const getRiskLevel = (score: number) => {
    if (score >= 75) return {
      label: 'Critical',
      color: 'text-red-500',
      bgColor: 'bg-red-500'
    };
    if (score >= 50) return {
      label: 'High',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500'
    };
    if (score >= 25) return {
      label: 'Medium',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500'
    };
    return {
      label: 'Low',
      color: 'text-green-500',
      bgColor: 'bg-green-500'
    };
  };
  const riskLevel = getRiskLevel(riskScore.overall);
  return <div className="space-y-6">
      {/* Overall Risk Score */}
      <div className="glass p-8 rounded-xl text-center">
        <ShieldAlertIcon className={`w-16 h-16 mx-auto mb-4 ${riskLevel.color}`} />
        <h2 className="text-4xl font-bold mb-2">
          <span className={riskLevel.color}>
            {riskScore.overall.toFixed(1)}%
          </span>
        </h2>
        <p className="text-xl text-gray-300 mb-4">Overall Risk Score</p>
        <div className={`inline-block px-6 py-2 rounded-full ${riskLevel.bgColor}/20 ${riskLevel.color} font-bold text-lg`}>
          {riskLevel.label} Risk
        </div>
      </div>

      {/* Risk Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Technical Risk */}
        <div className="glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">
            Technical Risk
          </h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">Score</span>
            <span className="text-2xl font-bold text-cyan-400">
              {riskScore.technical.toFixed(1)}/5
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full transition-all duration-1000" style={{
            width: `${riskScore.technical / 5 * 100}%`
          }}></div>
          </div>
        </div>

        {/* Ethical Risk */}
        <div className="glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-purple-400 mb-4">
            Ethical Risk
          </h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">Score</span>
            <span className="text-2xl font-bold text-purple-400">
              {riskScore.ethical.toFixed(1)}/5
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full transition-all duration-1000" style={{
            width: `${riskScore.ethical / 5 * 100}%`
          }}></div>
          </div>
        </div>
      </div>

      {/* Vulnerability Breakdown */}
      <div className="glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">
          Vulnerability Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="text-3xl font-bold text-red-500 mb-1">
              {riskScore.critical}
            </div>
            <div className="text-sm text-gray-400">Critical</div>
          </div>
          <div className="text-center p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <div className="text-3xl font-bold text-orange-500 mb-1">
              {riskScore.high}
            </div>
            <div className="text-sm text-gray-400">High</div>
          </div>
          <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="text-3xl font-bold text-yellow-500 mb-1">
              {riskScore.medium}
            </div>
            <div className="text-sm text-gray-400">Medium</div>
          </div>
          <div className="text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="text-3xl font-bold text-blue-500 mb-1">
              {riskScore.low}
            </div>
            <div className="text-sm text-gray-400">Low</div>
          </div>
        </div>
      </div>

      {/* Priority Actions */}
      <div className="glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <AlertTriangleIcon className="w-5 h-5 text-orange-500 mr-2" />
          Priority Actions Required
        </h3>
        <ul className="space-y-3">
          {riskScore.critical > 0 && <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <span className="text-gray-300">
                <span className="text-red-400 font-semibold">Immediate:</span>{' '}
                Address {riskScore.critical} critical{' '}
                {riskScore.critical === 1 ? 'vulnerability' : 'vulnerabilities'}{' '}
                within 24 hours
              </span>
            </li>}
          {riskScore.high > 0 && <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <span className="text-gray-300">
                <span className="text-orange-400 font-semibold">Urgent:</span>{' '}
                Resolve {riskScore.high} high-severity{' '}
                {riskScore.high === 1 ? 'issue' : 'issues'} within 7 days
              </span>
            </li>}
          {riskScore.medium > 0 && <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <span className="text-gray-300">
                <span className="text-yellow-400 font-semibold">
                  Important:
                </span>{' '}
                Plan remediation for {riskScore.medium} medium-risk{' '}
                {riskScore.medium === 1 ? 'item' : 'items'} within 30 days
              </span>
            </li>}
          {riskScore.critical === 0 && riskScore.high === 0 && <li className="flex items-start space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
              <span className="text-gray-300">
                No critical or high-severity vulnerabilities detected. Continue
                monitoring.
              </span>
            </li>}
        </ul>
      </div>

      {/* Islamic Ethics Note */}
      <div className="glass p-6 rounded-xl border-2 border-purple-500/30 bg-purple-500/5">
        <h3 className="text-lg font-semibold text-purple-400 mb-3">
          Islamic Ethical Considerations
        </h3>
        <p className="text-gray-300 mb-3 italic">
          "Do not betray the trust (amanah) placed in you." — Surah Al-Anfal: 27
        </p>
        <p className="text-gray-400 text-sm">
          This assessment aligns with Islamic principles of{' '}
          <span className="text-purple-400 font-semibold">Amanah</span> (trust),
          <span className="text-purple-400 font-semibold"> Maslahah</span>{' '}
          (public benefit), and
          <span className="text-purple-400 font-semibold"> Ihsan</span>{' '}
          (excellence). Addressing these vulnerabilities fulfills your duty to
          protect user data and maintain stakeholder trust.
        </p>
      </div>
    </div>;
}