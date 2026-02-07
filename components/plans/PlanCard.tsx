import React from 'react';
import { Check, Crown } from 'lucide-react';
import { Plan } from '../../types';
import useLanguage from '../../hooks/useLanguage';

interface PlanCardProps {
  plan: Plan;
  selected: boolean;
  onSelect: (plan: Plan) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, selected, onSelect }) => {
  const { t } = useLanguage();

  return (
    <div
      className={`border rounded-lg p-6 cursor-pointer transition-all relative ${
        selected
          ? 'border-emerald-500 bg-emerald-50'
          : 'border-gray-200 hover:border-emerald-200'
      } ${plan.isVip ? 'bg-gradient-to-br from-amber-50 to-amber-100' : ''}`}
      onClick={() => onSelect(plan)}
    >
      {plan.isVip && (
        <div className="absolute -top-4 -right-4 bg-amber-500 text-white px-3 py-1 rounded-full flex items-center shadow-lg">
          <Crown className="w-4 h-4 mr-1" />
          VIP
        </div>
      )}
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold text-emerald-600">${plan.price}</span>
        <span className="text-gray-700">
          {plan.type === 'monthly' ? `/${t('packages.monthly').toLowerCase()}` : ''}
        </span>
      </div>
      <div className="mb-4 bg-emerald-100 rounded-md p-2">
        <p className="text-sm font-medium text-emerald-800">
          {t('packages.features.commission').replace('{percentage}', plan.commission.toString())}
        </p>
      </div>
      <ul className="space-y-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="w-5 h-5 text-emerald-500 mr-2" />
            <span className="text-gray-800">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlanCard;