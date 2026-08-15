
export function filterGridColumns(columns: string[]): string[] {
  if (!columns || columns.length === 0) return [];

  const lowerKeysToHide = [
    'recordid',
    'id',
    'rowid',
    'createddate',
    'created_on',
    'cityId',
    'areaId',
    'maker',
    'maker_date',
    'authorizer',
    'authorizer_date',
    'isActive ',
    'countryid',
    'provinceid',
    'cityId '
  ];

  return columns.filter((key) => {
    const lowerKey = key.toLowerCase();
    return !lowerKeysToHide.includes(lowerKey);
  });
}