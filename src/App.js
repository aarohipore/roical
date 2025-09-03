import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// Helper function to convert empty string to 0 for calculations
const toNumber = (value) => value === '' ? 0 : Number(value);

// Automation Cost calculation based on tiered pricing (annual ranges)
const calculateAutomationCost = (monthlyCredits) => {
  const annualCredits = monthlyCredits * 12; // Convert to annual volume for tier determination
  
  if (annualCredits <= 25000) {
    return monthlyCredits * 1.00;
  } else if (annualCredits <= 100000) {
    return monthlyCredits * 0.80;
  } else if (annualCredits <= 500000) {
    return monthlyCredits * 0.60;
  } else if (annualCredits <= 1000000) {
    return monthlyCredits * 0.50;
  } else if (annualCredits <= 2000000) {
    return monthlyCredits * 0.30;
  } else {
    return monthlyCredits * 0.30; // Default to highest tier for credits above 2M annually
  }
};

function App() {
  const [section, setSection] = useState('invoices');
  const [automationPercent, setAutomationPercent] = useState(50);
  
  // State for invoices section input fields
  const [invoicesNumDocs, setInvoicesNumDocs] = useState('');
  const [invoicesTimePerDoc, setInvoicesTimePerDoc] = useState('');
  const [invoicesAnnualCost, setInvoicesAnnualCost] = useState('');
  const [invoicesErrorRate, setInvoicesErrorRate] = useState('');
  const [invoicesAvgInvoiceValue, setInvoicesAvgInvoiceValue] = useState('');
  const [invoicesAutomationCost, setInvoicesAutomationCost] = useState('');
  

  
  // Page 3 state
  const [showPage3Results, setShowPage3Results] = useState(false);
  const [hasInitialCalculation, setHasInitialCalculation] = useState(false);
  const [showNewPage, setShowNewPage] = useState(false);
  
  // New page state
  const [activeTab, setActiveTab] = useState('simple');
  const [fteCount, setFteCount] = useState(5);
  const [fteAnnualCost, setFteAnnualCost] = useState(50000);
  const [monthlyCredits, setMonthlyCredits] = useState(10000);
  const [pagesPerMonth, setPagesPerMonth] = useState(10000);
  

  

  
  // Common inputs for all advanced tabs
  const [commonMonthlyDocumentVolume, setCommonMonthlyDocumentVolume] = useState(10000);
  const [commonCurrentFTEs, setCommonCurrentFTEs] = useState(5);
  const [commonAnnualCostPerFTE, setCommonAnnualCostPerFTE] = useState(50000);
  
  // Error Handling specific inputs (removing monthlyDocumentVolume since it's now common)
  const [misinterpretationErrors, setMisinterpretationErrors] = useState(2);
  const [matchingErrors, setMatchingErrors] = useState(1.5);
  const [workflowErrors, setWorkflowErrors] = useState(1);
  const [avgCostPerError, setAvgCostPerError] = useState(80);
  const [errorReductionFactor, setErrorReductionFactor] = useState(80);
  const [quickEstimateMode, setQuickEstimateMode] = useState(false);
  const [whatIfAnalysis, setWhatIfAnalysis] = useState(false);
  const [showDetailedErrors, setShowDetailedErrors] = useState(false);
  const [showQuickEstimateInfo, setShowQuickEstimateInfo] = useState(false);
  const [showCreditsInfo, setShowCreditsInfo] = useState(false);
  const [showErrorHandlingTooltip, setShowErrorHandlingTooltip] = useState(false);
  const [creditsInputEnabled, setCreditsInputEnabled] = useState(false);
  const [showDocumentVolumeInfo, setShowDocumentVolumeInfo] = useState(false);
  const [showSimpleFTECostInfo, setShowSimpleFTECostInfo] = useState(false);
  const [showAdvancedFTECostInfo, setShowAdvancedFTECostInfo] = useState(false);
  const [showSimpleAdditionalCosts, setShowSimpleAdditionalCosts] = useState(false);
  const [showAdvancedAdditionalCosts, setShowAdvancedAdditionalCosts] = useState(false);
  const [simpleAdditionalCosts, setSimpleAdditionalCosts] = useState('');
  const [advancedAdditionalCosts, setAdvancedAdditionalCosts] = useState('');
  const [advancedMonthlyCredits, setAdvancedMonthlyCredits] = useState('');
  const [showAdvancedCreditsInput, setShowAdvancedCreditsInput] = useState(false);
  const [showSmartProjectionTooltip, setShowSmartProjectionTooltip] = useState(false);
  const [smartProjectionMode, setSmartProjectionMode] = useState(false);
  const [panelsCollapsed, setPanelsCollapsed] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState({
    common: true,
    scalability: true,
    errorHandling: true
  });
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  
  // Scalability specific inputs
  const [annualGrowthRate, setAnnualGrowthRate] = useState(25);
  const [targetAutomation, setTargetAutomation] = useState(70);
  const [peakVsNormalIncrease, setPeakVsNormalIncrease] = useState(50);
  

  
  // Customer Experience calculations
  const timeTakenPerDocBeforeAI = (commonCurrentFTEs * 60 * 160) / commonMonthlyDocumentVolume;
  const timeSavedPerDoc = timeTakenPerDocBeforeAI - 1; // 1 min assumed reduction
  const processingTimeReduction = timeSavedPerDoc > 0 ? (timeSavedPerDoc / timeTakenPerDocBeforeAI) * 100 : 0;
  
  // Scalability calculations - Updated Framework
  
  // Calculate FTEs Required After AI (%) = 100 - Target Automation (%)
  const ftesNeededAfterAI = 100 - targetAutomation;
  
  // 1. Productivity Multiplier
  const baselineDocumentsPerFTE = toNumber(commonMonthlyDocumentVolume) / toNumber(commonCurrentFTEs);
  const documentsPerFTEAfterAI = commonMonthlyDocumentVolume / (commonCurrentFTEs * (ftesNeededAfterAI / 100));
  const productivityMultiplier = documentsPerFTEAfterAI / baselineDocumentsPerFTE;
  
  // 2. FTEs Saved (Headcount) + Annual Cost Savings ($)
  const futureDocumentVolume = commonMonthlyDocumentVolume * (1 + (annualGrowthRate / 100));
  const baselineFTEsRequired = futureDocumentVolume / baselineDocumentsPerFTE;
  const ftesRequiredAfterAI = commonCurrentFTEs * (ftesNeededAfterAI / 100);
  const scalabilityFtesSaved = baselineFTEsRequired - ftesRequiredAfterAI;
  const annualCostSavings = scalabilityFtesSaved * commonAnnualCostPerFTE;
  
  // 3. Peak Handling Capacity (%)
  const peakMonthVolume = commonMonthlyDocumentVolume * (1 + (peakVsNormalIncrease / 100));
  const processingCapacityAfterAI = ftesRequiredAfterAI * documentsPerFTEAfterAI;
  const peakHandlingCapacity = (processingCapacityAfterAI / peakMonthVolume) * 100;
  
  // Advanced Section - Additional KPIs
  // Automation Cost calculation - use custom credits if provided, otherwise use document volume
  const advancedAutomationCost = (() => {
    if (advancedMonthlyCredits && advancedMonthlyCredits > 0) {
      // Use custom monthly credits with same formula as simple section
      const monthlyCost = calculateAutomationCost(toNumber(advancedMonthlyCredits));
      return monthlyCost * 12; // Convert to annual
    } else {
      // Use existing framework based on document volume
      const annualCredits = commonMonthlyDocumentVolume * 12;
      
      if (annualCredits <= 25000) {
        return annualCredits * 1.00;
      } else if (annualCredits <= 100000) {
        return annualCredits * 0.80;
      } else if (annualCredits <= 500000) {
        return annualCredits * 0.60;
      } else if (annualCredits <= 1000000) {
        return annualCredits * 0.50;
      } else if (annualCredits <= 2000000) {
        return annualCredits * 0.30;
      }
      return annualCredits * 0.30; // Default for >2M
    }
  })();
  
  // Error Cost Savings (from error handling section)
  const advancedErrorCostSavings = (() => {
    const totalErrorRate = quickEstimateMode ? 5 : (misinterpretationErrors + matchingErrors + workflowErrors);
    const costPerError = quickEstimateMode ? 80 : avgCostPerError;
    const errorsBefore = commonMonthlyDocumentVolume * totalErrorRate / 100;
    
    // Dynamic error reduction based on initial error rate
    let errorReductionRate;
    if (totalErrorRate > 10) {
      errorReductionRate = 0.90; // 90% reduction for >10%
    } else if (totalErrorRate > 8) {
      errorReductionRate = 0.85; // 85% reduction for >8% and ≤10%
    } else if (totalErrorRate > 5) {
      errorReductionRate = 0.75; // 75% reduction for >5% and ≤8%
    } else {
      errorReductionRate = 0.70; // 70% reduction for ≤5%
    }
    
    const errorsAfter = errorsBefore * (1 - errorReductionRate);
    const costBefore = errorsBefore * costPerError;
    const costAfter = errorsAfter * costPerError;
    const monthlySavings = costBefore - costAfter;
    return monthlySavings * 12;
  })();
  
  // FTE Cost Savings
  const fteCostSavings = scalabilityFtesSaved * commonAnnualCostPerFTE;
  
  // Annual Savings = Error Cost Savings + FTE Cost Savings - Automation Cost - Additional Costs
  const advancedAnnualSavings = advancedErrorCostSavings + fteCostSavings - advancedAutomationCost - toNumber(advancedAdditionalCosts);
  
  // ROI = (Net Savings Ã· Automation Cost) Ã— 100
  const advancedROI = (advancedAnnualSavings / advancedAutomationCost) * 100;

  // State for Page 3 calculation results
  const [hoursSaved, setHoursSaved] = useState(0);
  const [ftesSaved, setFtesSaved] = useState(0);
  const [dsoImpact, setDsoImpact] = useState(0);
  const [annualSavings, setAnnualSavings] = useState(0);
  const [claimsAutoAdjRate, setClaimsAutoAdjRate] = useState(0);
  




  // Validation: all except errorRate must be filled
  const allRequiredFilled = (invoicesNumDocs && invoicesTimePerDoc && invoicesAnnualCost && invoicesAvgInvoiceValue && invoicesAutomationCost);

  // Calculation function for Page 3
  const calculatePage3Results = useCallback(() => {
    if (section === 'invoices') {
      // Invoices calculation logic
      const pagesProcessedMonthly = parseFloat(invoicesNumDocs) || 0;
      const timeTakenPerPage = parseFloat(invoicesTimePerDoc) || 0;
      const annualFTECost = parseFloat(invoicesAnnualCost) || 0;
      const monthlyCredits = parseFloat(invoicesErrorRate) || 0;
      const currentDSO = parseFloat(invoicesAvgInvoiceValue) || 0;
      const avgInvoiceValueAmount = parseFloat(invoicesAutomationCost) || 0;
      const discount = parseFloat(automationPercent) || 0;

      // Hours Saved calculation
      const totalTimeBeforeAutomation = pagesProcessedMonthly * timeTakenPerPage * (1 + 0.05);
      const totalTimeAfterAutomation = pagesProcessedMonthly * timeTakenPerPage * (1 + 0.01);
      const timeSaved = totalTimeBeforeAutomation - totalTimeAfterAutomation;
      const hoursSavedValue = timeSaved / 60;

      // FTEs Saved calculation
      const ftesSavedValue = hoursSavedValue / 160;

      // DSO Impact calculation
      const dsoImpactValue = currentDSO - 30;

      // Automation Cost (annualized)
      const automationCostValue = monthlyCredits * (1 - (discount / 100)) * 12;

      // Error Reduction Savings (annualized)
      const errorReductionSavingsValue = avgInvoiceValueAmount * 0.04 * 12;

      // Annual Savings calculation (includes error reduction savings)
      const annualSavingsValue = (ftesSavedValue * 12 * annualFTECost) + (dsoImpactValue * avgInvoiceValueAmount) + errorReductionSavingsValue - automationCostValue;
      setAnnualSavings(annualSavingsValue);

      // Set the calculated values (multiply by 12 for annual values)
      setHoursSaved(hoursSavedValue * 12);
      setFtesSaved(ftesSavedValue * 12);
      setDsoImpact(dsoImpactValue);



    }
  }, [section, invoicesNumDocs, invoicesTimePerDoc, invoicesAnnualCost, invoicesErrorRate, invoicesAvgInvoiceValue, invoicesAutomationCost, automationPercent]);

  // Debounced effect for real-time calculations
  useEffect(() => {
    if (hasInitialCalculation) {
      const timeoutId = setTimeout(() => {
        calculatePage3Results();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [hasInitialCalculation, calculatePage3Results]);

  const handleCalculate = () => {
    // Perform initial calculation
    calculatePage3Results();
    setHasInitialCalculation(true);
    setShowPage3Results(true);
  };

  const handleLeftArrowClick = () => {
    setShowNewPage(true);
  };

  const handleNewPageBack = () => {
    setShowNewPage(false);
  };



  // New page calculations - Time Saved Per Doc Framework
  const automationCost = calculateAutomationCost(toNumber(monthlyCredits));
  const annualAutomationCost = automationCost * 12;
  
  // Time Saved Per Doc Calculation Framework
  // Step 1: Time per doc before AI = (current FTEs * (60 * 160)) / pages processed monthly
  const timePerDocBefore = (toNumber(fteCount) * (60 * 160)) / toNumber(pagesPerMonth);
  // Step 2: Time per doc after AI = time per doc before * (1 - 0.80) = 20% of original time
  const timePerDocAfter = timePerDocBefore * (1 - 0.80);
  // Step 3: Time saved per doc = time per doc before - time per doc after
  const simpleTimeSavedPerDoc = timePerDocBefore - timePerDocAfter;
  
  // Calculate FTEs saved using new framework
  // FTEs saved = (time saved per doc × pages per month) ÷ (60 × 160)
  const simpleFtesSaved = (simpleTimeSavedPerDoc * toNumber(pagesPerMonth)) / (60 * 160);
  const fteAfter = toNumber(fteCount) - simpleFtesSaved;
  
  // Calculate total monthly hours saved for other calculations
  const newPageHoursSaved = (simpleTimeSavedPerDoc * toNumber(pagesPerMonth)) / 60.0;
  // Simple Annual Savings = FTEs saved × FTE annual cost - automation cost - additional costs
  const newPageAnnualSavings = (simpleFtesSaved * toNumber(fteAnnualCost)) - annualAutomationCost - toNumber(simpleAdditionalCosts);
  
  // Advanced calculations
  const totalErrorRate = misinterpretationErrors + matchingErrors + workflowErrors;
  const totalErrorsBefore = commonMonthlyDocumentVolume * (totalErrorRate / 100);
  
  // Dynamic error reduction based on initial error rate
  let dynamicErrorReductionRate;
  if (totalErrorRate > 10) {
    dynamicErrorReductionRate = 0.90; // 90% reduction for >10%
  } else if (totalErrorRate > 8) {
    dynamicErrorReductionRate = 0.85; // 85% reduction for >8% and ≤10%
  } else if (totalErrorRate > 5) {
    dynamicErrorReductionRate = 0.75; // 75% reduction for >5% and ≤8%
  } else {
    dynamicErrorReductionRate = 0.70; // 70% reduction for ≤5%
  }
  
  const totalErrorsAfter = totalErrorsBefore * (1 - dynamicErrorReductionRate);
  const costOfErrorsBefore = totalErrorsBefore * avgCostPerError;
  const costOfErrorsAfter = totalErrorsAfter * avgCostPerError;
  const annualErrorSavings = (costOfErrorsBefore - costOfErrorsAfter) * 12;
  const accuracyBefore = (1 - (totalErrorsBefore / commonMonthlyDocumentVolume)) * 100;
  const accuracyAfter = (1 - (totalErrorsAfter / commonMonthlyDocumentVolume)) * 100;
  
  // Quick estimate calculations
  const quickErrorRate = 5; // 5% default
  const quickTotalErrorsBefore = commonMonthlyDocumentVolume * (quickErrorRate / 100);
  
  // Apply same dynamic error reduction logic for quick estimates
  let quickErrorReductionRate;
  if (quickErrorRate > 10) {
    quickErrorReductionRate = 0.90; // 90% reduction for >10%
  } else if (quickErrorRate > 8) {
    quickErrorReductionRate = 0.85; // 85% reduction for >8% and ≤10%
  } else if (quickErrorRate > 5) {
    quickErrorReductionRate = 0.75; // 75% reduction for >5% and ≤8%
  } else {
    quickErrorReductionRate = 0.70; // 70% reduction for ≤5%
  }
  
  const quickTotalErrorsAfter = quickTotalErrorsBefore * (1 - quickErrorReductionRate);
  const quickCostOfErrorsBefore = quickTotalErrorsBefore * 80; // $80 default
  const quickCostOfErrorsAfter = quickTotalErrorsAfter * 80;
  const quickAnnualErrorSavings = (quickCostOfErrorsBefore - quickCostOfErrorsAfter) * 12;

  const generateReportHTML = () => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>ROI Calculator Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Times New Roman', Times, serif; 
            margin: 0; 
            padding: 20px; 
            line-height: 1.5; 
            color: #2c3e50; 
            background: #f8fafc;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white; 
            padding: 40px; 
            text-align: center;
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="1" fill="white" opacity="0.1"/><circle cx="80" cy="40" r="1" fill="white" opacity="0.1"/><circle cx="40" cy="80" r="1" fill="white" opacity="0.1"/></svg>');
        }
        .header h1 { 
            font-size: 2.5rem; 
            font-weight: 700; 
            margin-bottom: 10px; 
            position: relative;
            z-index: 1;
        }
        .header p { 
            font-size: 1.1rem; 
            opacity: 0.9; 
            margin-bottom: 5px;
            position: relative;
            z-index: 1;
        }
        .content { padding: 40px; }
        .section { margin-bottom: 50px; }
        .section-title { 
            color: #1e3a8a; 
            font-size: 1.8rem; 
            font-weight: 700; 
            margin-bottom: 25px; 
            border-bottom: 3px solid #3b82f6; 
            padding-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .kpi-grid { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 25px; 
            margin-bottom: 40px; 
        }
        .analysis-card { 
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 20px; 
            text-align: center;
        }
        .kpi-value { 
            font-size: 2.2rem; 
            font-weight: 800; 
            color: #1e3a8a; 
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(30, 58, 138, 0.1);
        }
        .kpi-label { 
            font-size: 0.95rem; 
            color: #64748b; 
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .executive-layout {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 40px;
            margin: 30px 0;
        }
        .chart-container { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 30px; 
            background: #f8fafc;
            padding: 20px;
            border: 1px solid #e2e8f0;
        }
        .insights-panel h4 {
            color: #1e3a8a;
            font-weight: 700;
            margin-bottom: 20px;
            font-size: 1.2rem;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 8px;
        }
        .insight-item {
            margin-bottom: 15px;
            padding: 12px 0;
            border-bottom: 1px solid rgba(203, 213, 225, 0.5);
            line-height: 1.6;
        }
        .insight-item:last-child {
            border-bottom: none;
        }
        .insight-item strong {
            color: #1e3a8a;
        }
        .chart-section { 
            text-align: center; 
            background: white;
            padding: 20px;
            border: 1px solid #e2e8f0;
        }
        .chart-section h4 { 
            margin-bottom: 20px; 
            color: #1e3a8a; 
            font-weight: 600;
            font-size: 1.1rem;
        }
        .bar-chart { margin: 0 auto 20px; }
        .pie-chart { margin: 0 auto; }
        .input-summary { 
            background: #f1f5f9; 
            padding: 20px; 
            margin-bottom: 25px;
            border: 1px solid #cbd5e1;
        }
        .input-summary h3 {
            color: #1e3a8a;
            font-weight: 700;
            margin-bottom: 20px;
            font-size: 1.2rem;
        }
        .input-row { 
            display: grid; 
            grid-template-columns: 2fr 1fr; 
            gap: 20px; 
            margin-bottom: 12px; 
            padding: 12px 0; 
            border-bottom: 1px solid rgba(203, 213, 225, 0.5);
        }
        .input-row:last-child { border-bottom: none; }
        .input-label { font-weight: 600; color: #475569; }
        .input-value { color: #1e3a8a; font-weight: 700; text-align: right; }
        .calculation-section { 
            background: white; 
            border: 1px solid #e2e8f0; 
            padding: 20px; 
            margin-bottom: 25px;
        }
        .calc-title { 
            font-weight: 700; 
            color: #1e3a8a; 
            margin-bottom: 20px; 
            font-size: 1.2rem;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 8px;
        }
        .calc-row { 
            display: grid; 
            grid-template-columns: 2fr 1fr; 
            gap: 20px; 
            padding: 12px 0; 
            border-bottom: 1px solid #f1f5f9;
        }
        .calc-row:last-child { 
            border-bottom: none; 
            background: #f1f5f9;
            margin: 15px -20px -20px -20px;
            padding: 15px 20px;
            font-weight: 700;
        }
        .calc-label { color: #475569; font-weight: 500; }
        .calc-value { font-weight: 700; color: #1e3a8a; text-align: right; }
        .footer { 
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white; 
            padding: 30px; 
            text-align: center;
            margin-top: 0;
        }
        .footer p { margin-bottom: 8px; opacity: 0.9; }
        @media print { 
            body { background: white; padding: 0; }
            .container { box-shadow: none; }
            .chart-container { break-inside: avoid; }
            .calculation-section { page-break-inside: avoid; }
            .input-summary { page-break-inside: avoid; }
            .advanced-analysis { page-break-before: always; }
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ROI Calculator Report</h1>
            <p>Comprehensive Analysis & Financial Projections</p>
            <p>Generated on ${currentDate} at ${currentTime}</p>
        </div>

        <div class="content">

    <!-- Simple Mode Analysis -->
    <div class="section">
        <h2 class="section-title">Simple Mode Analysis</h2>
        
        <!-- Input Parameters and Key Calculations -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
            <div class="input-summary">
                <h3>Input Parameters</h3>
                <div class="input-row">
                    <span class="input-label">Number of FTEs:</span>
                    <span class="input-value">${fteCount}</span>
                </div>
                <div class="input-row">
                    <span class="input-label">Annual FTE Cost:</span>
                    <span class="input-value">$${toNumber(fteAnnualCost).toLocaleString()}</span>
                </div>
                ${simpleAdditionalCosts ? `<div class="input-row"><span class="input-label">Additional Costs:</span><span class="input-value">$${toNumber(simpleAdditionalCosts).toLocaleString()}</span></div>` : ''}
                <div class="input-row">
                    <span class="input-label">Monthly Credits:</span>
                    <span class="input-value">${toNumber(monthlyCredits).toLocaleString()}</span>
                </div>
                <div class="input-row">
                    <span class="input-label">Documents Per Month:</span>
                    <span class="input-value">${toNumber(pagesPerMonth).toLocaleString()}</span>
                </div>
            </div>
            
            <div class="calculation-section">
                <div class="calc-title">Key Calculations</div>
                <div class="calc-row">
                    <span class="calc-label">Time Saved per Document:</span>
                    <span class="calc-value">${simpleTimeSavedPerDoc.toFixed(2)} minutes</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Processing Time Reduction:</span>
                    <span class="calc-value">${((simpleTimeSavedPerDoc / timePerDocBefore) * 100).toFixed(1)}%</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">FTEs Saved:</span>
                    <span class="calc-value">${simpleFtesSaved.toFixed(2)}</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">FTEs Remaining After AI:</span>
                    <span class="calc-value">${fteAfter.toFixed(2)}</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Annual Savings:</span>
                    <span class="calc-value">$${newPageAnnualSavings.toLocaleString()}</span>
                </div>
            </div>
        </div>
        
        <!-- Charts Section -->
        <div class="chart-container">
            <div class="chart-section">
                <h4>FTE Impact Analysis</h4>
                <svg class="bar-chart" width="300" height="200" viewBox="0 0 300 200">
                    <rect x="0" y="0" width="300" height="200" fill="none" stroke="#e0e0e0"/>
                    <!-- Y-axis -->
                    <line x1="40" y1="20" x2="40" y2="160" stroke="#666" stroke-width="1"/>
                    <text x="20" y="90" text-anchor="middle" fill="#666" font-size="10" transform="rotate(-90 20 90)">FTE Count</text>
                    <!-- X-axis -->
                    <line x1="40" y1="160" x2="260" y2="160" stroke="#666" stroke-width="1"/>
                    <!-- Before AI bar -->
                    <rect x="80" y="${160 - (fteCount * 20)}" width="60" height="${fteCount * 20}" fill="#1e3a8a"/>
                    <text x="110" y="175" text-anchor="middle" fill="#333" font-size="11">Before AI</text>
                    <text x="110" y="${155 - (fteCount * 20)}" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">${fteCount}</text>
                    <!-- After AI bar -->
                    <rect x="180" y="${160 - (fteAfter * 20)}" width="60" height="${fteAfter * 20}" fill="#3b82f6"/>
                    <text x="210" y="175" text-anchor="middle" fill="#333" font-size="11">After AI</text>
                    <text x="210" y="${155 - (fteAfter * 20)}" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">${fteAfter.toFixed(1)}</text>
                </svg>
            </div>
            
            <div class="chart-section">
                <h4>Cost vs Savings Breakdown</h4>
                <svg class="pie-chart" width="200" height="200" viewBox="0 0 200 200">
                    ${(() => {
                        const total = Math.abs(newPageAnnualSavings) + (automationCost * 12);
                        const savingsPercentage = (Math.abs(newPageAnnualSavings) / total) * 100;
                        const costPercentage = 100 - savingsPercentage;
                        const savingsAngle = (savingsPercentage / 100) * 360;
                        const costAngle = (costPercentage / 100) * 360;
                        
                        // Calculate arc paths
                        const centerX = 100, centerY = 100, radius = 70;
                        const savingsEndAngle = savingsAngle * Math.PI / 180;
                        const costStartAngle = savingsAngle * Math.PI / 180;
                        const costEndAngle = 2 * Math.PI;
                        
                        const savingsX = centerX + radius * Math.cos(savingsEndAngle);
                        const savingsY = centerY + radius * Math.sin(savingsEndAngle);
                        
                        const largeSavingsArc = savingsAngle > 180 ? 1 : 0;
                        const largeCostArc = costAngle > 180 ? 1 : 0;
                        
                        // Donut chart with inner radius
                        const innerRadius = 35;
                        
                        const savingsXInner = centerX + innerRadius * Math.cos(savingsEndAngle);
                        const savingsYInner = centerY + innerRadius * Math.sin(savingsEndAngle);
                        
                        const costXInner = centerX + innerRadius * Math.cos(0);
                        const costYInner = centerY + innerRadius * Math.sin(0);
                        
                        return `
                            <!-- Savings slice (donut) -->
                            <path d="M ${centerX + radius} ${centerY} A ${radius} ${radius} 0 ${largeSavingsArc} 1 ${savingsX} ${savingsY} L ${savingsXInner} ${savingsYInner} A ${innerRadius} ${innerRadius} 0 ${largeSavingsArc} 0 ${centerX + innerRadius} ${centerY} Z" fill="#1e3a8a" stroke="#fff" stroke-width="2"/>
                            <!-- Cost slice (donut) -->
                            <path d="M ${savingsX} ${savingsY} A ${radius} ${radius} 0 ${largeCostArc} 1 ${centerX + radius} ${centerY} L ${centerX + innerRadius} ${centerY} A ${innerRadius} ${innerRadius} 0 ${largeCostArc} 0 ${savingsXInner} ${savingsYInner} Z" fill="#ffffff" stroke="#1e3a8a" stroke-width="2"/>
                            <!-- Center text -->
                            <text x="${centerX}" y="${centerY - 5}" text-anchor="middle" fill="#1e3a8a" font-size="14" font-weight="bold">${savingsPercentage.toFixed(0)}%</text>
                            <text x="${centerX}" y="${centerY + 10}" text-anchor="middle" fill="#1e3a8a" font-size="11">Savings</text>
                        `;
                    })()}
                </svg>
                <!-- Legend -->
                <div style="display: flex; justify-content: center; gap: 20px; margin-top: 10px;">
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <div style="width: 12px; height: 12px; background: #1e3a8a;"></div>
                        <span style="font-size: 12px;">Savings</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <div style="width: 12px; height: 12px; background: #ffffff; border: 1px solid #1e3a8a;"></div>
                        <span style="font-size: 12px;">Investment</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Advanced Mode Analysis -->
    <div class="section advanced-analysis">
        <h2 class="section-title">Advanced Mode Analysis</h2>
        
        <!-- Input Parameters Section -->
        <div class="input-summary" style="margin-bottom: 30px;">
            <h3>Advanced Input Parameters</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                <div class="input-row">
                    <span class="input-label">Monthly Document Volume:</span>
                    <span class="input-value">${toNumber(commonMonthlyDocumentVolume).toLocaleString()}</span>
                </div>
                <div class="input-row">
                    <span class="input-label">Current FTEs:</span>
                    <span class="input-value">${toNumber(commonCurrentFTEs)}</span>
                </div>
                <div class="input-row">
                    <span class="input-label">Annual Cost per FTE:</span>
                    <span class="input-value">$${toNumber(commonAnnualCostPerFTE).toLocaleString()}</span>
                </div>
                <div class="input-row">
                    <span class="input-label">Target Automation:</span>
                    <span class="input-value">${targetAutomation}%</span>
                </div>
                <div class="input-row">
                    <span class="input-label">Total Error Rate:</span>
                    <span class="input-value">${(misinterpretationErrors + matchingErrors + workflowErrors).toFixed(1)}%</span>
                </div>
                ${advancedAdditionalCosts ? `<div class="input-row"><span class="input-label">Additional Costs:</span><span class="input-value">$${toNumber(advancedAdditionalCosts).toLocaleString()}</span></div>` : '<div></div>'}
            </div>
        </div>

        <!-- Calculations Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 25px;">
            <div class="calculation-section">
                <div class="calc-title">Scalability Metrics</div>
                <div class="calc-row">
                    <span class="calc-label">FTEs Required After AI:</span>
                    <span class="calc-value">${ftesNeededAfterAI.toFixed(1)}%</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Productivity Multiplier:</span>
                    <span class="calc-value">${productivityMultiplier.toFixed(2)}x</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">FTEs Saved:</span>
                    <span class="calc-value">${scalabilityFtesSaved.toFixed(2)}</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Peak Handling Capacity:</span>
                    <span class="calc-value">${peakHandlingCapacity.toFixed(1)}%</span>
                </div>
            </div>

            <div class="calculation-section">
                <div class="calc-title">Error Reduction Impact</div>
                <div class="calc-row">
                    <span class="calc-label">Errors Before AI (Monthly):</span>
                    <span class="calc-value">${(commonMonthlyDocumentVolume * (misinterpretationErrors + matchingErrors + workflowErrors) / 100).toFixed(0)}</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Error Reduction Rate:</span>
                    <span class="calc-value">${(dynamicErrorReductionRate * 100).toFixed(0)}%</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Errors After AI (Monthly):</span>
                    <span class="calc-value">${totalErrorsAfter.toFixed(0)}</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Annual Error Cost Savings:</span>
                    <span class="calc-value">$${advancedErrorCostSavings.toFixed(0)}</span>
                </div>
            </div>

            <div class="calculation-section">
                <div class="calc-title">Processing Improvements</div>
                <div class="calc-row">
                    <span class="calc-label">Time per Doc Before AI:</span>
                    <span class="calc-value">${timeTakenPerDocBeforeAI.toFixed(2)} min</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Time Saved per Document:</span>
                    <span class="calc-value">${timeSavedPerDoc.toFixed(2)} min</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Processing Time Reduction:</span>
                    <span class="calc-value">${processingTimeReduction.toFixed(1)}%</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Accuracy Improvement:</span>
                    <span class="calc-value">${(accuracyAfter - accuracyBefore).toFixed(1)}%</span>
                </div>
            </div>
        </div>
        
        <!-- Advanced Charts Section -->
        <div class="chart-container">
            <div class="chart-section">
                <h4>Error Reduction Impact</h4>
                <svg class="bar-chart" width="300" height="200" viewBox="0 0 300 200">
                    <rect x="0" y="0" width="300" height="200" fill="none" stroke="#e0e0e0"/>
                    <!-- Y-axis -->
                    <line x1="40" y1="20" x2="40" y2="160" stroke="#666" stroke-width="1"/>
                    <text x="20" y="90" text-anchor="middle" fill="#666" font-size="10" transform="rotate(-90 20 90)">Error Count</text>
                    <!-- X-axis -->
                    <line x1="40" y1="160" x2="260" y2="160" stroke="#666" stroke-width="1"/>
                    <!-- Before AI bar -->
                    <rect x="80" y="${160 - ((commonMonthlyDocumentVolume * (misinterpretationErrors + matchingErrors + workflowErrors) / 100) / 10)}" width="60" height="${(commonMonthlyDocumentVolume * (misinterpretationErrors + matchingErrors + workflowErrors) / 100) / 10}" fill="#1e3a8a"/>
                    <text x="110" y="175" text-anchor="middle" fill="#333" font-size="11">Before AI</text>
                    <text x="110" y="${155 - ((commonMonthlyDocumentVolume * (misinterpretationErrors + matchingErrors + workflowErrors) / 100) / 10)}" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">${(commonMonthlyDocumentVolume * (misinterpretationErrors + matchingErrors + workflowErrors) / 100).toFixed(0)}</text>
                    <!-- After AI bar -->
                    <rect x="180" y="${160 - (totalErrorsAfter / 10)}" width="60" height="${totalErrorsAfter / 10}" fill="#3b82f6"/>
                    <text x="210" y="175" text-anchor="middle" fill="#333" font-size="11">After AI</text>
                    <text x="210" y="${155 - (totalErrorsAfter / 10)}" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">${totalErrorsAfter.toFixed(0)}</text>
                </svg>
            </div>
            
            <div class="chart-section">
                <h4>Productivity Enhancement</h4>
                <svg class="pie-chart" width="200" height="200" viewBox="0 0 200 200">
                    ${(() => {
                        const productivityGain = ((productivityMultiplier - 1) * 100);
                        const currentLevel = 100;
                        const total = currentLevel + productivityGain;
                        const gainPercentage = (productivityGain / total) * 100;
                        const currentPercentage = 100 - gainPercentage;
                        const gainAngle = (gainPercentage / 100) * 360;
                        const currentAngle = (currentPercentage / 100) * 360;
                        
                        // Calculate arc paths
                        const centerX = 100, centerY = 100, radius = 70;
                        const gainEndAngle = gainAngle * Math.PI / 180;
                        
                        const gainX = centerX + radius * Math.cos(gainEndAngle);
                        const gainY = centerY + radius * Math.sin(gainEndAngle);
                        
                        const largeGainArc = gainAngle > 180 ? 1 : 0;
                        const largeCurrentArc = currentAngle > 180 ? 1 : 0;
                        
                        // Donut chart with inner radius
                        const innerRadius = 35;
                        
                        const gainXInner = centerX + innerRadius * Math.cos(gainEndAngle);
                        const gainYInner = centerY + innerRadius * Math.sin(gainEndAngle);
                        
                        return `
                            <!-- Productivity gain slice (donut) -->
                            <path d="M ${centerX + radius} ${centerY} A ${radius} ${radius} 0 ${largeGainArc} 1 ${gainX} ${gainY} L ${gainXInner} ${gainYInner} A ${innerRadius} ${innerRadius} 0 ${largeGainArc} 0 ${centerX + innerRadius} ${centerY} Z" fill="#1e3a8a" stroke="#fff" stroke-width="2"/>
                            <!-- Current level slice (donut) -->
                            <path d="M ${gainX} ${gainY} A ${radius} ${radius} 0 ${largeCurrentArc} 1 ${centerX + radius} ${centerY} L ${centerX + innerRadius} ${centerY} A ${innerRadius} ${innerRadius} 0 ${largeCurrentArc} 0 ${gainXInner} ${gainYInner} Z" fill="#ffffff" stroke="#1e3a8a" stroke-width="2"/>
                            <!-- Center text -->
                            <text x="${centerX}" y="${centerY - 5}" text-anchor="middle" fill="#1e3a8a" font-size="14" font-weight="bold">${productivityMultiplier.toFixed(1)}x</text>
                            <text x="${centerX}" y="${centerY + 10}" text-anchor="middle" fill="#1e3a8a" font-size="11">Productivity</text>
                        `;
                    })()}
                </svg>
                <!-- Legend -->
                <div style="display: flex; justify-content: center; gap: 20px; margin-top: 10px;">
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <div style="width: 12px; height: 12px; background: #1e3a8a;"></div>
                        <span style="font-size: 12px;">Productivity Gain</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <div style="width: 12px; height: 12px; background: #ffffff; border: 1px solid #1e3a8a;"></div>
                        <span style="font-size: 12px;">Current Level</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Financial Summary -->
    <div class="section">
        <h2 class="section-title">Financial Summary</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="calculation-section">
                <div class="calc-title">Simple Mode Financials</div>
                <div class="calc-row">
                    <span class="calc-label">FTE Cost Savings:</span>
                    <span class="calc-value">$${(simpleFtesSaved * toNumber(fteAnnualCost)).toFixed(0)}</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Automation Cost:</span>
                    <span class="calc-value">$${(automationCost * 12).toFixed(0)}</span>
                </div>
                ${simpleAdditionalCosts ? `<div class="calc-row"><span class="calc-label">Additional Costs:</span><span class="calc-value">$${toNumber(simpleAdditionalCosts).toFixed(0)}</span></div>` : ''}
                <div class="calc-row">
                    <span class="calc-label">Net Annual Savings:</span>
                    <span class="calc-value">$${newPageAnnualSavings.toFixed(0)}</span>
                </div>
            </div>

            <div class="calculation-section">
                <div class="calc-title">Advanced Mode Financials</div>
                <div class="calc-row">
                    <span class="calc-label">FTE Cost Savings:</span>
                    <span class="calc-value">$${fteCostSavings.toFixed(0)}</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Error Cost Savings:</span>
                    <span class="calc-value">$${advancedErrorCostSavings.toFixed(0)}</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Automation Cost:</span>
                    <span class="calc-value">$${advancedAutomationCost.toFixed(0)}</span>
                </div>
                ${advancedAdditionalCosts ? `<div class="calc-row"><span class="calc-label">Additional Costs:</span><span class="calc-value">$${toNumber(advancedAdditionalCosts).toFixed(0)}</span></div>` : ''}
                <div class="calc-row">
                    <span class="calc-label">Net Annual Savings:</span>
                    <span class="calc-value">$${advancedAnnualSavings.toFixed(0)}</span>
                </div>
            </div>
        </div>
        </div>

        <div class="footer">
            <p><strong>ROI Calculator Report</strong> - Generated by ROI Calculator Tool</p>
            <p>This report includes comprehensive analysis from both Simple and Advanced calculation modes.</p>
            <p>All calculations are based on industry-standard methodologies and the input parameters provided.</p>
        </div>
    </div>
</body>
</html>`;
  };

  const handleExportPDF = () => {
    const reportHTML = generateReportHTML();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    
    printWindow.onload = function() {
      printWindow.print();
      setTimeout(() => printWindow.close(), 1000);
    };
  };

  const handleReset = () => {
    setFteCount(5);
    setFteAnnualCost(50000);
    setMonthlyCredits(10000);
    setPagesPerMonth(10000);
    setCreditsInputEnabled(false); // Reset to auto-fill mode
  };

  const handleSmartProjection = () => {
    setSmartProjectionMode(!smartProjectionMode);
    
    if (!smartProjectionMode) {
      // Autofill values when activating Smart Projection
      setAnnualGrowthRate(25);
      setPeakVsNormalIncrease(20);
      setMisinterpretationErrors(3);
      setMatchingErrors(1.5);
      setWorkflowErrors(0.5);
      setAvgCostPerError(7);
    }
  };

  const handleRevealImpact = () => {
    setPanelsCollapsed(!panelsCollapsed);
    
    if (!panelsCollapsed) {
      // Collapse all panels
      setExpandedPanels({
        common: false,
        scalability: false,
        errorHandling: false
      });
    } else {
      // Expand all panels
      setExpandedPanels({
        common: true,
        scalability: true,
        errorHandling: true
      });
    }
  };

  const togglePanel = (panelName) => {
    setExpandedPanels(prev => ({
      ...prev,
      [panelName]: !prev[panelName]
    }));
  };

  const handleDetailedAnalysis = () => {
    setShowDetailedAnalysis(!showDetailedAnalysis);
  };

  // Always display the new ROI calculator directly
  return (
    <div className="new-page">
        <div className="new-page-content">
          <div className="tabs-container">
            <div className="tab-switcher">
              <button 
                className={`tab-button ${activeTab === 'simple' ? 'active' : ''}`}
                onClick={() => setActiveTab('simple')}
              >
                Simple
              </button>
              <button 
                className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
                onClick={() => setActiveTab('advanced')}
              >
                Advanced
              </button>
            </div>
          </div>
          

          
          <div className="main-container">
            {activeTab === 'simple' && (
              <>
                <div className="input-panel">
                  <h3>Calculate Your ROI</h3>
                  <div className="input-group">
                    <label htmlFor="fteCount">No. of FTEs required for the task</label>
                    <input
                      id="fteCount"
                      type="number"
                      value={fteCount}
                      onChange={(e) => setFteCount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 5"
                    />
                    <div className="tooltip">Number of full-time employees currently working on this task</div>
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="fteAnnualCost">Annual FTE cost ($)</label>
                    <div className="input-with-info">
                      <input
                        id="fteAnnualCost"
                        type="number"
                        value={fteAnnualCost}
                        onChange={(e) => setFteAnnualCost(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 50000"
                        style={{ paddingRight: '35px' }}
                      />
                      <button 
                        className="inner-info-button"
                        onMouseEnter={() => setShowSimpleFTECostInfo(true)}
                        onMouseLeave={() => setShowSimpleFTECostInfo(false)}
                        onClick={() => setShowSimpleAdditionalCosts(!showSimpleAdditionalCosts)}
                        type="button"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      {showSimpleFTECostInfo && (
                        <div className="inner-info-tooltip">
                          To enter any additional cost ( implementation , operational etc.) click the tooltip
                        </div>
                      )}
                    </div>
                    <div className="tooltip">Annual cost per full-time employee</div>
                  </div>
                  
                  {showSimpleAdditionalCosts && (
                    <div className="input-group">
                      <label htmlFor="simpleAdditionalCosts">Additional Costs ($)</label>
                      <input
                        id="simpleAdditionalCosts"
                        type="number"
                        value={simpleAdditionalCosts}
                        onChange={(e) => setSimpleAdditionalCosts(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 5000"
                      />
                      <div className="tooltip">Implementation, operational, or other additional costs</div>
                    </div>
                  )}
                  
                  <div className="input-group">
                    <label htmlFor="monthlyCredits">Monthly credits required</label>
                    <div className="input-with-inner-info">
                      <input
                        id="monthlyCredits"
                        type="number"
                        value={monthlyCredits}
                        onChange={(e) => creditsInputEnabled && setMonthlyCredits(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 100000"
                        disabled={!creditsInputEnabled}
                        style={{ paddingRight: '35px' }}
                      />
                      <button 
                        className="inner-info-button"
                        onMouseEnter={() => setShowCreditsInfo(true)}
                        onMouseLeave={() => setShowCreditsInfo(false)}
                        onClick={() => {
                          if (creditsInputEnabled) {
                            // If currently enabled, disable it and return to auto-fill
                            setCreditsInputEnabled(false);
                            setMonthlyCredits(pagesPerMonth); // Reset to auto-fill value
                          } else {
                            // If currently disabled, enable it for custom input
                            setCreditsInputEnabled(true);
                            setTimeout(() => document.getElementById('monthlyCredits').focus(), 0);
                          }
                        }}
                        type="button"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      {showCreditsInfo && (
                        <div className="inner-info-tooltip">
                          {creditsInputEnabled ? (
                            <>Manual mode: Click to return to auto-fill mode</>
                          ) : (
                            <>Click the button to enter custom credits</>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="tooltip">Monthly automation credits needed</div>
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="pagesPerMonth">No. of docs processed monthly</label>
                    <input
                      id="pagesPerMonth"
                      type="number"
                      value={pagesPerMonth}
                      onChange={(e) => {
                        const pageValue = e.target.value === '' ? '' : Number(e.target.value);
                        setPagesPerMonth(pageValue);
                        if (!creditsInputEnabled) {
                          setMonthlyCredits(pageValue); // Auto-fill credits: 1 page = 1 credit only when disabled
                        }
                      }}
                      placeholder="e.g. 20000"
                    />
                    <div className="tooltip">Total pages processed per month</div>
                  </div>
                </div>
                
                <div className="output-panel">
                  <div className="kpi-row">
                    <div className="kpi-card">
                      <h4>Annual Automation Cost</h4>
                      <div className="kpi-value">${(automationCost * 12).toLocaleString()}</div>
                      <div className="kpi-subtitle">Per Year</div>
                    </div>
                    <div className="kpi-card">
                      <h4>Annual Savings</h4>
                      <div className="kpi-value">${newPageAnnualSavings.toLocaleString()}</div>
                      <div className="kpi-subtitle">Total savings</div>
                    </div>
                  </div>
                  
                  <div className="chart-card">
                    <h4>Summary</h4>
                    <div className="chart-with-stats-container">
                      <div className="charts-row">
                        <div className="bar-chart-container">
                          <svg width="280" height="200" viewBox="0 0 280 200">
                            {/* Chart background */}
                            <rect x="0" y="0" width="280" height="200" fill="none"/>
                            
                            {/* Y-axis */}
                            <line x1="40" y1="20" x2="40" y2="180" stroke="#4F8CFF" strokeWidth="2"/>
                            <text x="20" y="100" textAnchor="middle" fill="#FFFFFF" fontSize="10" transform="rotate(-90 20 100)">FTE Count</text>
                            
                            {/* X-axis */}
                            <line x1="40" y1="180" x2="240" y2="180" stroke="#4F8CFF" strokeWidth="2"/>
                            
                            {/* Before Automation bar */}
                            <rect x="70" y={180 - (fteCount * 20)} width="45" height={fteCount * 20} fill="#4F8CFF" rx="4"/>
                            <text x="92" y="195" textAnchor="middle" fill="#FFFFFF" fontSize="11">Before</text>
                            <text x="92" y={175 - (fteCount * 20)} textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">{fteCount}</text>
                            
                            {/* After Automation bar */}
                            <rect x="140" y={180 - (fteAfter * 20)} width="45" height={fteAfter * 20} fill="#FFFFFF" rx="4"/>
                            <text x="162" y="195" textAnchor="middle" fill="#FFFFFF" fontSize="11">After</text>
                            <text x="162" y={175 - (fteAfter * 20)} textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">{fteAfter.toFixed(1)}</text>
                          </svg>
                        </div>
                        
                        <div className="radial-chart">
                          {(() => {
                            const annualAutomationCost = automationCost * 12;
                            const total = Math.abs(newPageAnnualSavings) + annualAutomationCost;
                            const savingsPercentage = (Math.abs(newPageAnnualSavings) / total) * 100;
                            
                            return (
                              <div className="radial-chart-container">
                                <svg width="120" height="120" viewBox="0 0 120 120">
                                  {/* Background circle */}
                                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e6f3ff" strokeWidth="8"/>
                                  {/* Progress circle */}
                                  <circle 
                                    cx="60" 
                                    cy="60" 
                                    r="50" 
                                    fill="none" 
                                    stroke="#4F8CFF" 
                                    strokeWidth="8"
                                    strokeDasharray={`${(savingsPercentage / 100) * 314} 314`}
                                    strokeDashoffset="0"
                                    transform="rotate(-90 60 60)"
                                    className="radial-progress"
                                  />
                                  {/* Center text */}
                                  <text x="60" y="65" textAnchor="middle" className="chart-percentage">
                                    {savingsPercentage.toFixed(0)}%
                                  </text>
                                </svg>
                                {/* Legend below chart */}
                                <div className="radial-legend">
                                  <div className="legend-item">
                                    <span className="legend-color" style={{backgroundColor: '#e6f3ff'}}></span>
                                    <span>Cost</span>
                                  </div>
                                  <div className="legend-item">
                                    <span className="legend-color" style={{backgroundColor: '#4F8CFF'}}></span>
                                    <span>Savings</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      
                      <div className="inline-hours-saved">
                        <div className="inline-kpi-card">
                          <h4>FTEs Saved</h4>
                          <div className="kpi-value">{simpleFtesSaved.toFixed(1)}</div>
                          <div className="kpi-subtitle">FTEs</div>
                        </div>
                        <div className="inline-kpi-card">
                                                     <h4>Time Saved</h4>
                           <div className="kpi-value">{simpleTimeSavedPerDoc.toFixed(1)} min</div>
                           <div className="kpi-subtitle">Per Document</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="actions-row">
                    <button className="action-button" onClick={handleExportPDF}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 15V3M12 15L8 11M12 15L16 11M22 15V19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Export PDF
                    </button>
                    <button className="action-button secondary" onClick={handleReset}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Reset
                    </button>
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'advanced' && (
              <div className="main-container advanced-mode">
                {/* Input Panels Row - Common and Tab-specific side by side */}
                <div className="advanced-inputs-row">
                  {/* Common Inputs Panel - Left side */}
                  <div className="common-inputs-panel">
                    <h3 
                      className={`panel-heading ${expandedPanels.common ? 'expanded' : 'collapsed'}`}
                      onClick={() => togglePanel('common')}
                    >
                      Common Inputs
                    </h3>
                    {expandedPanels.common && (
                      <div className="panel-content">
                        <div className="input-group">
                          <label htmlFor="commonMonthlyDocumentVolume">Monthly Document Volume</label>
                          <div className="input-with-info">
                            <input
                              id="commonMonthlyDocumentVolume"
                              type="number"
                              value={commonMonthlyDocumentVolume}
                              onChange={(e) => setCommonMonthlyDocumentVolume(e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="e.g. 10000"
                              style={{ paddingRight: '35px' }}
                            />
                            <button 
                              className="inner-info-button"
                              onMouseEnter={() => setShowDocumentVolumeInfo(true)}
                              onMouseLeave={() => setShowDocumentVolumeInfo(false)}
                              onClick={() => {
                                setShowAdvancedCreditsInput(!showAdvancedCreditsInput);
                                if (!showAdvancedCreditsInput) {
                                  setExpandedPanels(prev => ({
                                    ...prev,
                                    common: true
                                  }));
                                }
                              }}
                              type="button"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            {showDocumentVolumeInfo && (
                              <div className="inner-info-tooltip">
                                To enter the custom credits click on the tooltip
                              </div>
                            )}
                          </div>
                          <div className="tooltip">Total documents processed per month</div>
                        </div>
                        
                        <div className="input-group">
                          <label htmlFor="commonCurrentFTEs">Current Number of FTEs Handling the Process</label>
                          <input
                            id="commonCurrentFTEs"
                            type="number"
                            value={commonCurrentFTEs}
                            onChange={(e) => setCommonCurrentFTEs(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="e.g. 5"

                          />
                          <div className="tooltip">Number of full-time employees currently working on this process</div>
                        </div>
                        
                        <div className="input-group">
                          <label htmlFor="commonAnnualCostPerFTE">Annual Cost per FTE ($)</label>
                          <div className="input-with-info">
                            <input
                              id="commonAnnualCostPerFTE"
                              type="number"
                              value={commonAnnualCostPerFTE}
                              onChange={(e) => setCommonAnnualCostPerFTE(e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="e.g. 50000"
                              style={{ paddingRight: '35px' }}
                            />
                            <button 
                              className="inner-info-button"
                              onMouseEnter={() => setShowAdvancedFTECostInfo(true)}
                              onMouseLeave={() => setShowAdvancedFTECostInfo(false)}
                              onClick={() => setShowAdvancedAdditionalCosts(!showAdvancedAdditionalCosts)}
                              type="button"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            {showAdvancedFTECostInfo && (
                              <div className="inner-info-tooltip">
                                To enter any additional cost ( implementation , operational etc.) click the tooltip
                              </div>
                            )}
                          </div>
                          <div className="tooltip">Annual cost per full-time employee</div>
                        </div>
                        
                        {showAdvancedAdditionalCosts && (
                          <div className="input-group">
                            <label htmlFor="advancedAdditionalCosts">Additional Costs ($)</label>
                            <input
                              id="advancedAdditionalCosts"
                              type="number"
                              value={advancedAdditionalCosts}
                              onChange={(e) => setAdvancedAdditionalCosts(e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="e.g. 5000"
                            />
                            <div className="tooltip">Implementation, operational, or other additional costs</div>
                          </div>
                        )}
                        
                        {showAdvancedCreditsInput && (
                          <div className="input-group">
                            <label htmlFor="advancedMonthlyCredits">Monthly Credits</label>
                            <input
                              id="advancedMonthlyCredits"
                              type="number"
                              value={advancedMonthlyCredits}
                              onChange={(e) => {
                                const value = e.target.value === '' ? '' : Number(e.target.value);
                                setAdvancedMonthlyCredits(value);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setShowAdvancedCreditsInput(false);
                                }
                              }}
                              placeholder="e.g. 10000"
                            />
                            <div className="tooltip">Custom monthly credits for advanced calculations</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Scalability Input Panel */}
                    <div className="tab-input-panel">
                      <h3 
                        className={`panel-heading ${expandedPanels.scalability ? 'expanded' : 'collapsed'}`}
                        onClick={() => togglePanel('scalability')}
                      >
                        Scalability Inputs
                      </h3>
                      {expandedPanels.scalability && (
                        <div className="panel-content">
                          <div className="input-group">
                            <label htmlFor="annualGrowthRate">Annual Growth in Document Volume (%)</label>
                            <input
                              id="annualGrowthRate"
                              type="number"
                              value={annualGrowthRate}
                              onChange={(e) => setAnnualGrowthRate(e.target.value === '' ? '' : Number(e.target.value))}
                              disabled={smartProjectionMode}
                              placeholder="e.g. 25"
  
                              max="100"
                            />
                            <div className="tooltip">Projected Monthly Volume (Next Year)</div>
                          </div>
                          
                                                    <div className="input-group">
                            <label htmlFor="targetAutomation">Target Automation (%)</label>
                            <input
                              id="targetAutomation"
                              type="number"
                              value={targetAutomation}
                              onChange={(e) => setTargetAutomation(e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="e.g. 70"

                              max="100"
                            />
                            <div className="tooltip">100-Percentage of current employees still needed after AI implementation</div>
                          </div>
                          
                          <div className="input-group">
                            <label htmlFor="peakVsNormalIncrease">Seasonal Document Volume Spike (%)</label>
                            <input
                              id="peakVsNormalIncrease"
                              type="number"
                              value={peakVsNormalIncrease}
                              onChange={(e) => setPeakVsNormalIncrease(e.target.value === '' ? '' : Number(e.target.value))}
                              disabled={smartProjectionMode}
                              placeholder="e.g. 50"
  
                              max="200"
                            />
                            <div className="tooltip">Increase in volume during peak months compared to normal months</div>
                          </div>
                        </div>
                      )}
                    </div>
                  
                  {/* Error Handling Input Panel */}
                    <div className="tab-input-panel">
                      <h3 
                        className={`panel-heading ${expandedPanels.errorHandling ? 'expanded' : 'collapsed'}`}
                        onClick={() => togglePanel('errorHandling')}
                      >
                        Error Handling Inputs
                      </h3>
                      
                      {expandedPanels.errorHandling && (
                        <div className="panel-content">
                          {!quickEstimateMode && (
                        <>
                          <div className="input-group">
                            <label htmlFor="totalErrorRate">Total Error Rate (%)</label>
                            <div className="slider-with-toggle">
                              <input
                                id="totalErrorRate"
                                type="range"
                                min="0"
                                max="20"
                                step="0.1"
                                value={misinterpretationErrors + matchingErrors + workflowErrors}
                                onChange={(e) => {
                                  const totalRate = Number(e.target.value);
                                  const avgRate = totalRate / 3;
                                  setMisinterpretationErrors(avgRate);
                                  setMatchingErrors(avgRate);
                                  setWorkflowErrors(avgRate);
                                }}
                                disabled={smartProjectionMode}
                              />
                              <button 
                                className="info-toggle"
                                onClick={() => setShowDetailedErrors(!showDetailedErrors)}
                                onMouseEnter={() => setShowErrorHandlingTooltip(true)}
                                onMouseLeave={() => setShowErrorHandlingTooltip(false)}
                                type="button"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                  <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                              {showErrorHandlingTooltip && (
                                <div className="inner-info-tooltip">
                                  Click on the tooltip to adjust specific error types
                                </div>
                              )}
                            </div>
                            <span>{(misinterpretationErrors + matchingErrors + workflowErrors).toFixed(1)}%</span>
                            <div className="tooltip">Total percentage of errors across all types</div>
                            
                            {showDetailedErrors && (
                              <div className="detailed-errors">
                                <div className="error-slider-group">
                                  <label>Misinterpretation Errors (%)</label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={misinterpretationErrors}
                                    onChange={(e) => setMisinterpretationErrors(e.target.value === '' ? 0 : Number(e.target.value))}
                                    disabled={smartProjectionMode}
                                  />
                                  <span>{misinterpretationErrors.toFixed(1)}%</span>
                                </div>
                                <div className="error-slider-group">
                                  <label>Matching Errors (%)</label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={matchingErrors}
                                    onChange={(e) => setMatchingErrors(e.target.value === '' ? 0 : Number(e.target.value))}
                                    disabled={smartProjectionMode}
                                  />
                                  <span>{matchingErrors.toFixed(1)}%</span>
                                </div>
                                <div className="error-slider-group">
                                  <label>Workflow Errors (%)</label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={workflowErrors}
                                    onChange={(e) => setWorkflowErrors(e.target.value === '' ? 0 : Number(e.target.value))}
                                    disabled={smartProjectionMode}
                                  />
                                  <span>{workflowErrors.toFixed(1)}%</span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="input-group">
                            <label htmlFor="avgCostPerError">Average Cost per Error ($)</label>
                            <input
                              id="avgCostPerError"
                              type="number"
                              value={avgCostPerError}
                              onChange={(e) => setAvgCostPerError(e.target.value === '' ? '' : Number(e.target.value))}
                              disabled={smartProjectionMode}
                              placeholder="e.g. 80"
  
                            />
                            <div className="tooltip">Average cost to fix each error</div>
                          </div>
                        </>
                      )}
                          
                          {/* Smart Projection Button */}
                      <div className="smart-projection-section">
                        <button 
                          className={`smart-projection-btn ${smartProjectionMode ? 'active' : ''}`} 
                          type="button"
                          onClick={handleSmartProjection}
                          onMouseEnter={() => setShowSmartProjectionTooltip(true)}
                          onMouseLeave={() => setShowSmartProjectionTooltip(false)}
                        >
                          {smartProjectionMode ? 'Exit Smart Projection' : 'Smart Projection'}
                        </button>
                        {showSmartProjectionTooltip && (
                          <div className="smart-projection-tooltip">
                            Calculate ROI using Industry Benchmarks
                          </div>
                        )}
                      </div>
                      
                      {/* Reveal Impact Button */}
                      <div className="reveal-impact-section">
                        <button 
                          className="reveal-impact-btn" 
                          type="button"
                          onClick={handleRevealImpact}
                        >
                          {panelsCollapsed ? 'Show Details' : 'Reveal Impact'}
                        </button>
                      </div>
                        </div>
                      )}

                    </div>
                </div>
                
                {/* Output Cards - Always visible main KPIs */}
                <div className="main-kpis-row">
                  <div className="output-card">
                    <h4>Annual Savings</h4>
                    <div className="output-value">${advancedAnnualSavings.toLocaleString()}</div>
                    <div className="output-subtitle">Total net savings</div>
                  </div>
                  <div className="output-card">
                    <h4>Automation Cost</h4>
                    <div className="output-value">${advancedAutomationCost.toLocaleString()}</div>
                    <div className="output-subtitle">Annual AI platform cost</div>
                  </div>
                  <div className="output-card">
                    <h4>ROI</h4>
                    <div className="output-value">{advancedROI.toFixed(0)}%</div>
                    <div className="output-subtitle">Return on investment</div>
                  </div>
                </div>

                {/* Additional KPIs Content - Conditionally visible */}
                {showDetailedAnalysis && (
                  <div className="detailed-analysis-content">
                    {/* Additional KPI Cards - Only 3 specific cards */}
                    <div className="advanced-outputs-row" style={{gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '1fr'}}>
                      {/* Error Cost Savings */}
                      <div className="output-card">
                        <h4>Error Cost Savings</h4>
                        <div className="output-value">${(() => {
                          const totalErrorRate = smartProjectionMode ? 5 : (misinterpretationErrors + matchingErrors + workflowErrors);
                          const costPerError = smartProjectionMode ? 7 : avgCostPerError;
                          const errorsBefore = commonMonthlyDocumentVolume * totalErrorRate / 100;
                          
                          // Dynamic error reduction based on initial error rate
                          let errorReductionRate;
                          if (totalErrorRate > 10) {
                            errorReductionRate = 0.90; // 90% reduction for >10%
                          } else if (totalErrorRate > 8) {
                            errorReductionRate = 0.85; // 85% reduction for >8% and ≤10%
                          } else if (totalErrorRate > 5) {
                            errorReductionRate = 0.75; // 75% reduction for >5% and ≤8%
                          } else {
                            errorReductionRate = 0.70; // 70% reduction for ≤5%
                          }
                          
                          const errorsAfter = errorsBefore * (1 - errorReductionRate);
                          const costBefore = errorsBefore * costPerError;
                          const costAfter = errorsAfter * costPerError;
                          const monthlySavings = costBefore - costAfter;
                          return Math.round(monthlySavings * 12).toLocaleString();
                        })()}</div>
                        <div className="output-subtitle">Annual</div>
                      </div>
                      
                      {/* Productivity Index */}
                      <div className="output-card">
                        <h4>Productivity Index</h4>
                        <div className="output-value">{productivityMultiplier.toFixed(1)}x</div>
                        <div className="output-subtitle">Docs per FTE improvement</div>
                      </div>

                      {/* FTEs Saved */}
                      <div className="output-card">
                        <h4>FTEs Saved</h4>
                        <div className="output-value">{scalabilityFtesSaved.toFixed(1)}</div>
                        <div className="output-subtitle">Headcount reduction</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* EFFICIENCY GAINS Section - Always visible */}
                <div className="efficiency-gains-section">
                  <div className="efficiency-gains-grid">
                    <div className="efficiency-card">
                      <div className="radial-chart">
                        <svg width="120" height="120" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="50" fill="none" stroke="#e6f3ff" strokeWidth="8"/>
                          <circle 
                            cx="60" 
                            cy="60" 
                            r="50" 
                            fill="none" 
                            stroke="#4F8CFF" 
                            strokeWidth="8"
                            strokeDasharray={`${(processingTimeReduction / 100) * 314} 314`}
                            strokeDashoffset="0"
                            transform="rotate(-90 60 60)"
                            className="radial-progress"
                          />
                          <text x="60" y="65" textAnchor="middle" className="chart-percentage">
                            {processingTimeReduction.toFixed(0)}%
                          </text>
                        </svg>
                      </div>
                      <h3>Processing Time Reduction</h3>
                    </div>
                    
                    <div className="efficiency-card">
                      <div className="radial-chart">
                        <svg width="120" height="120" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="50" fill="none" stroke="#e6f3ff" strokeWidth="8"/>
                          <circle 
                            cx="60" 
                            cy="60" 
                            r="50" 
                            fill="none" 
                            stroke="#4F8CFF" 
                            strokeWidth="8"
                            strokeDasharray={`${(peakHandlingCapacity / 100) * 314} 314`}
                            strokeDashoffset="0"
                            transform="rotate(-90 60 60)"
                            className="radial-progress"
                          />
                          <text x="60" y="65" textAnchor="middle" className="chart-percentage">
                            {peakHandlingCapacity.toFixed(1)}%
                          </text>
                        </svg>
                      </div>
                      <h3>Peak Handling Capacity</h3>
                    </div>
                    
                    <div className="efficiency-card">
                      <div className="stopwatch-icon">
                        <div className="stopwatch-outer">
                          <div className="stopwatch-inner">
                            <div className="time-value">{timeSavedPerDoc.toFixed(1)} min</div>
                          </div>
                        </div>
                      </div>
                      <h3>Time Saved per Document</h3>
                    </div>
                  </div>
                </div>

                {/* Additional KPIs Button */}
                <div className="detailed-analysis-section">
                  <button 
                    className="detailed-analysis-btn" 
                    type="button"
                    onClick={handleDetailedAnalysis}
                  >
                    {showDetailedAnalysis ? 'Hide Additional KPIs' : 'Show Additional KPIs'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}

export default App;
