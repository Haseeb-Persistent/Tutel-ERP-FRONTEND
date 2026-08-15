export function filterGridColumnsModal(columns: string[]): string[] {
  if (!columns || columns.length === 0) return [];

  const lowerKeysToHide = [
    'recordid',
    'id',
    'rowid',
    'createddate',
    'created_on',
    'updated_by',
    'updated_on',
    'maker',
    'maker_date',
    'authorizer',
    'authorizer_date',
    'rcstatus',
    'countryid',
    'provinceid',
    'cityid',    
    'areaid'     
  ];

  return columns.filter((key) => {
    const lowerKey = key.toLowerCase();
    return !lowerKeysToHide.includes(lowerKey);
  });
}