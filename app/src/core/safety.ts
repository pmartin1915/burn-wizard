import React from 'react';

export const SAFETY_DISCLAIMER = `
⚠️ EDUCATIONAL TOOL ONLY: This application provides educational calculations and is not intended for direct patient care, diagnosis, or treatment decisions. Always verify with institutional protocols and clinical judgment.
`;

export const SCOPE_STATEMENT = `
This tool is designed for educational and documentation support only. It does not diagnose, prescribe medications, or replace clinical decision-making. All calculations must be verified with local protocols.
`;

export const DATA_SAFETY_NOTICE = `
All data remains on your device. No patient information is transmitted over the network. Use the "Clear Local Data" function to remove all stored information.
`;

export function SafetyBanner() {
  return React.createElement(
    'div',
    { className: 'burn-wizard-disclaimer text-center py-2 px-4' },
    '⚠️ Educational Tool Only - Not for Direct Patient Care - Verify All Calculations'
  );
}