import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWizardStore } from '@/store/useWizardStore';
import { calcUrineOutputTarget } from '@/domain/fluids';

export default function FluidPlan() {
  const { fluidResult, patientData } = useWizardStore();

  if (!fluidResult) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Complete patient assessment to view fluid plan.</p>
        </CardContent>
      </Card>
    );
  }

  const urineTarget = calcUrineOutputTarget(patientData.weightKg, patientData.ageMonths);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluid Resuscitation Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notice for small burns */}
        {fluidResult.notice && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ {fluidResult.notice}
            </p>
          </div>
        )}

        {/* Parkland Formula Results */}
        <div className="space-y-4">
          <h3 className="font-semibold">Parkland Formula (Educational)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                <p className="text-sm font-medium">Total Resuscitation</p>
                <p className="text-2xl font-bold text-blue-600">{fluidResult.parkland.totalMl} mL</p>
                <p className="text-xs text-muted-foreground">Over 24 hours</p>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded">
                <p className="text-sm font-medium">Current Rate Needed</p>
                <p className="text-xl font-bold text-orange-600">{fluidResult.parkland.rateNowMlPerHr} mL/hr</p>
                <p className="text-xs text-muted-foreground">
                  Phase: {fluidResult.parkland.phase === 'first8' ? 'First 8 hours' : 'Next 16 hours'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                <p className="text-sm font-medium">First 8 Hours</p>
                <p className="text-lg font-bold">{fluidResult.parkland.first8hMl} mL</p>
                <p className="text-xs">Remaining: {fluidResult.parkland.remainingFirst8hMl} mL</p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                <p className="text-sm font-medium">Next 16 Hours</p>
                <p className="text-lg font-bold">{fluidResult.parkland.next16hMl} mL</p>
                <p className="text-xs">Remaining: {fluidResult.parkland.remainingNext16hMl} mL</p>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Fluids */}
        <div className="space-y-2">
          <h3 className="font-semibold">Maintenance Fluids</h3>
          <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded">
            <p className="text-sm font-medium">Holliday-Segar ({fluidResult.maintenance.method})</p>
            <p className="text-lg font-bold">{fluidResult.maintenance.mlPerHr} mL/hr</p>
            <p className="text-xs text-muted-foreground">Separate from resuscitation fluids</p>
          </div>
        </div>

        {/* Monitoring Targets */}
        <div className="space-y-2">
          <h3 className="font-semibold">Monitoring Targets</h3>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded">
            <p className="text-sm font-medium">Urine Output Goal</p>
            <p className="text-lg font-bold">{urineTarget.min} - {urineTarget.max} mL/hr</p>
            <p className="text-xs text-muted-foreground">
              {patientData.ageMonths < 180 ? '1-2 mL/kg/hr (pediatric)' : '0.5-1 mL/kg/hr (adult)'}
            </p>
          </div>
        </div>

        {/* Timeline Table */}
        <div className="space-y-2">
          <h3 className="font-semibold">Fluid Timeline (First 12 Hours)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-200 dark:border-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="border border-gray-200 dark:border-gray-700 p-2 text-left">Hour</th>
                  <th className="border border-gray-200 dark:border-gray-700 p-2 text-left">Cumulative (mL)</th>
                  <th className="border border-gray-200 dark:border-gray-700 p-2 text-left">Phase</th>
                </tr>
              </thead>
              <tbody>
                {fluidResult.timeline.slice(0, 13).map((point, index) => (
                  <tr key={point.hourFromInjury} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                    <td className="border border-gray-200 dark:border-gray-700 p-2">{point.hourFromInjury}h</td>
                    <td className="border border-gray-200 dark:border-gray-700 p-2">{point.targetCumulativeMl}</td>
                    <td className="border border-gray-200 dark:border-gray-700 p-2 capitalize">{point.phase.replace('8', ' 8').replace('16', ' 16')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Educational Disclaimer */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md p-3 text-xs">
          <p className="font-medium">Educational Disclaimer:</p>
          <p>These calculations are for educational purposes only. Actual fluid management must be individualized based on patient response, institutional protocols, and clinical judgment. Monitor urine output, vital signs, and overall clinical status.</p>
        </div>
      </CardContent>
    </Card>
  );
}