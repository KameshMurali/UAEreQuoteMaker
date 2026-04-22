export const roundCurrency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export const calculateAnnualValue = (roomCount: number, unitPricePerMonth: number) =>
  roundCurrency(roomCount * unitPricePerMonth * 12);

export const calculatePercentageAmount = (baseAmount: number, percent: number) =>
  roundCurrency((baseAmount * percent) / 100);

