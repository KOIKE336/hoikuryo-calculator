'use client';

import { useState, useCallback } from 'react';
import { FamilyInput, IncomeInput } from '@/types/hoikuryo';
import { calculateHoikuryoAsync } from '../hoikuryo/index';

interface UseHoikuryoState {
  calculationMethod: 'salary' | 'taxableIncome';
  spouseAAmount: string;
  spouseBAmount: string;
  spouseADependents: string;
  spouseBDependents: string;
  childOrder: 1 | 2 | 3;
  ageCategory: 'under3';
  timeType: 'standard' | 'short';
  result: {
    totalMunicipalTax: number;
    baseFee: number;
    finalFee: number;
    childOrder: number;
    ageCategory: string;
  } | null;
  errors: string[];
  isLoading: boolean;
}

interface UseHoikuryoActions {
  setCalculationMethod: (method: 'salary' | 'taxableIncome') => void;
  setSpouseAAmount: (amount: string) => void;
  setSpouseBAmount: (amount: string) => void;
  setSpouseADependents: (dependents: string) => void;
  setSpouseBDependents: (dependents: string) => void;
  setChildOrder: (order: 1 | 2 | 3) => void;
  setAgeCategory: (category: 'under3') => void;
  setTimeType: (timeType: 'standard' | 'short') => void;
  calculate: () => void;
  reset: () => void;
  copyResult: () => void;
}

const initialState: UseHoikuryoState = {
  calculationMethod: 'salary',
  spouseAAmount: '',
  spouseBAmount: '',
  spouseADependents: '0',
  spouseBDependents: '0',
  childOrder: 1,
  ageCategory: 'under3',
  timeType: 'standard',
  result: null,
  errors: [],
  isLoading: false,
};

export function useHoikuryo(): UseHoikuryoState & UseHoikuryoActions {
  const [state, setState] = useState<UseHoikuryoState>(initialState);

  const validateInput = useCallback((currentState: UseHoikuryoState): string[] => {
    const newErrors: string[] = [];

    // 配偶者Aの金額チェック
    if (!currentState.spouseAAmount || currentState.spouseAAmount.trim() === '') {
      newErrors.push('配偶者Aの金額を入力してください');
    } else {
      const amount = parseInt(currentState.spouseAAmount);
      if (isNaN(amount) || amount < 0) {
        newErrors.push('配偶者Aの金額は0以上の数値で入力してください');
      } else if (amount > 10000) {
        newErrors.push('配偶者Aの金額は10,000万円以下で入力してください');
      }
    }

    // 配偶者Bの金額チェック
    if (!currentState.spouseBAmount || currentState.spouseBAmount.trim() === '') {
      newErrors.push('配偶者Bの金額を入力してください');
    } else {
      const amount = parseInt(currentState.spouseBAmount);
      if (isNaN(amount) || amount < 0) {
        newErrors.push('配偶者Bの金額は0以上の数値で入力してください');
      } else if (amount > 10000) {
        newErrors.push('配偶者Bの金額は10,000万円以下で入力してください');
      }
    }

    // 扶養人数チェック（給与所得者モードのみ）
    if (currentState.calculationMethod === 'salary') {
      const dependentsA = parseInt(currentState.spouseADependents);
      const dependentsB = parseInt(currentState.spouseBDependents);
      
      if (isNaN(dependentsA) || dependentsA < 0 || dependentsA > 10) {
        newErrors.push('配偶者Aの扶養人数は0-10人の範囲で入力してください');
      }
      
      if (isNaN(dependentsB) || dependentsB < 0 || dependentsB > 10) {
        newErrors.push('配偶者Bの扶養人数は0-10人の範囲で入力してください');
      }
    }

    return newErrors;
  }, []);

  const setCalculationMethod = useCallback((method: 'salary' | 'taxableIncome') => {
    setState(prev => ({ ...prev, calculationMethod: method, errors: [] }));
  }, []);

  const setSpouseAAmount = useCallback((amount: string) => {
    setState(prev => ({ ...prev, spouseAAmount: amount }));
  }, []);

  const setSpouseBAmount = useCallback((amount: string) => {
    setState(prev => ({ ...prev, spouseBAmount: amount }));
  }, []);

  const setSpouseADependents = useCallback((dependents: string) => {
    setState(prev => ({ ...prev, spouseADependents: dependents }));
  }, []);

  const setSpouseBDependents = useCallback((dependents: string) => {
    setState(prev => ({ ...prev, spouseBDependents: dependents }));
  }, []);

  const setChildOrder = useCallback((order: 1 | 2 | 3) => {
    setState(prev => ({ ...prev, childOrder: order }));
  }, []);

  const setAgeCategory = useCallback((category: 'under3') => {
    setState(prev => ({ ...prev, ageCategory: category }));
  }, []);

  const setTimeType = useCallback((timeType: 'standard' | 'short') => {
    setState(prev => ({ ...prev, timeType }));
  }, []);

  const calculate = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    const errors = validateInput(state);
    if (errors.length > 0) {
      setState(prev => ({ ...prev, errors, isLoading: false }));
      return;
    }

    try {
      const spouseA: IncomeInput = state.calculationMethod === 'salary' 
        ? { type: 'salary', amount: parseInt(state.spouseAAmount) * 10000, dependents: parseInt(state.spouseADependents) }
        : { type: 'taxableIncome', amount: parseInt(state.spouseAAmount) * 10000 };

      const spouseB: IncomeInput = state.calculationMethod === 'salary' 
        ? { type: 'salary', amount: parseInt(state.spouseBAmount) * 10000, dependents: parseInt(state.spouseBDependents) }
        : { type: 'taxableIncome', amount: parseInt(state.spouseBAmount) * 10000 };

      const input: FamilyInput = {
        spouseA,
        spouseB,
        childOrder: state.childOrder,
        ageCategory: state.ageCategory,
        timeType: state.timeType
      };

      const calculationResult = await calculateHoikuryoAsync(input);
      setState(prev => ({ 
        ...prev, 
        result: calculationResult, 
        errors: [], 
        isLoading: false 
      }));
    } catch {
      setState(prev => ({ 
        ...prev, 
        errors: ['計算中にエラーが発生しました。入力内容をご確認ください。'], 
        isLoading: false 
      }));
    }
  }, [state, validateInput]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const copyResult = useCallback(() => {
    if (!state.result) return;
    
    const text = `原村保育料計算結果\n月額保育料: ${state.result.finalFee.toLocaleString()}円\n第${state.childOrder}子 / 3歳未満 / ${state.timeType === 'standard' ? '保育標準時間' : '保育短時間'}\n世帯市町村民税所得割額: ${state.result.totalMunicipalTax.toLocaleString()}円`;
    
    navigator.clipboard.writeText(text).then(() => {
      alert('結果をコピーしました');
    }).catch(() => {
      alert('コピーに失敗しました');
    });
  }, [state.result, state.childOrder, state.timeType]);

  return {
    ...state,
    setCalculationMethod,
    setSpouseAAmount,
    setSpouseBAmount,
    setSpouseADependents,
    setSpouseBDependents,
    setChildOrder,
    setAgeCategory,
    setTimeType,
    calculate,
    reset,
    copyResult,
  };
}