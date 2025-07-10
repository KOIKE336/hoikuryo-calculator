import { describe, it, expect } from '@jest/globals';
import { calculateHoikuryo, calculateHoikuryoWithDetails } from '../lib/hoikuryo';
import type { FamilyInput, IncomeInput } from '../types/hoikuryo';

describe('保育料計算テスト', () => {
  describe('calculateHoikuryo', () => {
    it('給与所得者モードでの計算', () => {
      const spouseA: IncomeInput = {
        type: 'salary',
        amount: 4000000, // 400万円
        dependents: 0
      };
      
      const spouseB: IncomeInput = {
        type: 'salary',
        amount: 2800000, // 280万円
        dependents: 0
      };

      const input: FamilyInput = {
        spouseA,
        spouseB,
        childOrder: 1,
        ageCategory: 'under3',
        timeType: 'standard'
      };

      const result = calculateHoikuryo(input);
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe('number');
    });

    it('所得直接入力モードでの計算', () => {
      const spouseA: IncomeInput = {
        type: 'taxableIncome',
        amount: 2700000 // 270万円
      };
      
      const spouseB: IncomeInput = {
        type: 'taxableIncome',
        amount: 1800000 // 180万円
      };

      const input: FamilyInput = {
        spouseA,
        spouseB,
        childOrder: 1,
        ageCategory: 'under3',
        timeType: 'standard'
      };

      const result = calculateHoikuryo(input);
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe('number');
    });

    it('第2子は半額になる', () => {
      const spouseA: IncomeInput = {
        type: 'salary',
        amount: 4000000,
        dependents: 0
      };
      
      const spouseB: IncomeInput = {
        type: 'salary',
        amount: 2800000,
        dependents: 0
      };

      const input1: FamilyInput = {
        spouseA,
        spouseB,
        childOrder: 1,
        ageCategory: 'under3',
        timeType: 'standard'
      };

      const input2: FamilyInput = {
        spouseA,
        spouseB,
        childOrder: 2,
        ageCategory: 'under3',
        timeType: 'standard'
      };

      const result1 = calculateHoikuryo(input1);
      const result2 = calculateHoikuryo(input2);
      
      expect(result2).toBeLessThan(result1);
    });

    it('第3子以降は無料になる', () => {
      const spouseA: IncomeInput = {
        type: 'salary',
        amount: 4000000,
        dependents: 0
      };
      
      const spouseB: IncomeInput = {
        type: 'salary',
        amount: 2800000,
        dependents: 0
      };

      const input: FamilyInput = {
        spouseA,
        spouseB,
        childOrder: 3,
        ageCategory: 'under3',
        timeType: 'standard'
      };

      const result = calculateHoikuryo(input);
      expect(result).toBe(0);
    });
  });

  describe('calculateHoikuryoWithDetails', () => {
    it('詳細な計算結果を返す', () => {
      const spouseA: IncomeInput = {
        type: 'salary',
        amount: 4000000,
        dependents: 0
      };
      
      const spouseB: IncomeInput = {
        type: 'salary',
        amount: 2800000,
        dependents: 0
      };

      const input: FamilyInput = {
        spouseA,
        spouseB,
        childOrder: 1,
        ageCategory: 'under3',
        timeType: 'standard'
      };

      const result = calculateHoikuryoWithDetails(input);
      
      expect(result).toHaveProperty('totalMunicipalTax');
      expect(result).toHaveProperty('baseFee');
      expect(result).toHaveProperty('finalFee');
      expect(result).toHaveProperty('childOrder');
      expect(result).toHaveProperty('ageCategory');
      
      expect(typeof result.totalMunicipalTax).toBe('number');
      expect(typeof result.baseFee).toBe('number');
      expect(typeof result.finalFee).toBe('number');
      expect(result.childOrder).toBe(1);
      expect(result.ageCategory).toBe('under3');
    });

    it('第2子の場合、基準額と最終額が異なる', () => {
      const spouseA: IncomeInput = {
        type: 'salary',
        amount: 4000000,
        dependents: 0
      };
      
      const spouseB: IncomeInput = {
        type: 'salary',
        amount: 2800000,
        dependents: 0
      };

      const input: FamilyInput = {
        spouseA,
        spouseB,
        childOrder: 2,
        ageCategory: 'under3'
      };

      const result = calculateHoikuryoWithDetails(input);
      
      expect(result.finalFee).toBeLessThan(result.baseFee);
      expect(result.finalFee).toBe(Math.floor(result.baseFee / 2));
    });

    it('第3子以降の場合、最終額が0になる', () => {
      const spouseA: IncomeInput = {
        type: 'salary',
        amount: 4000000,
        dependents: 0
      };
      
      const spouseB: IncomeInput = {
        type: 'salary',
        amount: 2800000,
        dependents: 0
      };

      const input: FamilyInput = {
        spouseA,
        spouseB,
        childOrder: 3,
        ageCategory: 'under3',
        timeType: 'standard'
      };

      const result = calculateHoikuryoWithDetails(input);
      
      expect(result.finalFee).toBe(0);
      expect(result.baseFee).toBeGreaterThan(0);
    });
  });

  describe('エラーハンドリング', () => {
    it('負の収入金額でエラーを投げる', () => {
      const spouseA: IncomeInput = {
        type: 'salary',
        amount: -1000000,
        dependents: 0
      };
      
      const spouseB: IncomeInput = {
        type: 'salary',
        amount: 2800000,
        dependents: 0
      };

      const input: FamilyInput = {
        spouseA,
        spouseB,
        childOrder: 1,
        ageCategory: 'under3',
        timeType: 'standard'
      };

      expect(() => calculateHoikuryo(input)).toThrow();
    });

    it('異常に高い収入金額でエラーを投げる', () => {
      const spouseA: IncomeInput = {
        type: 'salary',
        amount: 100000000000, // 1000億円
        dependents: 0
      };
      
      const spouseB: IncomeInput = {
        type: 'salary',
        amount: 2800000,
        dependents: 0
      };

      const input: FamilyInput = {
        spouseA,
        spouseB,
        childOrder: 1,
        ageCategory: 'under3',
        timeType: 'standard'
      };

      expect(() => calculateHoikuryo(input)).toThrow();
    });
  });
});