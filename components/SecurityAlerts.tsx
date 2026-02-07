import React from 'react';
import { AlertTriangle, Shield, Info } from 'lucide-react';
import { useSecurityMonitor } from '../hooks/useSecurityMonitor';

const SecurityAlerts: React.FC = () => {
  const { alerts, loading } = useSecurityMonitor();

  if (loading || alerts.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'medium':
        return <Shield className="h-5 w-5 text-yellow-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-2">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`rounded-md border p-4 ${getSeverityColor(alert.severity)}`}
        >
          <div className="flex">
            {getSeverityIcon(alert.severity)}
            <div className="ml-3">
              <h3 className="text-sm font-medium">
                Alerta de Segurança
              </h3>
              <div className="mt-2 text-sm">
                <p>{alert.message}</p>
              </div>
              <div className="mt-1">
                <p className="text-xs opacity-75">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SecurityAlerts;