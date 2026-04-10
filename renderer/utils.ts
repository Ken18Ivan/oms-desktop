export const formatFullName = (officer: any) => {
  if (!officer) return '';
  if (officer.name && !officer.firstName) return officer.name;

  const isMarriedWoman = officer.gender === 'BABAE' && officer.lastNameSpouse && officer.lastNameSpouse.trim() !== '';
  const first = officer.firstName || '';
  const midSource = isMarriedWoman ? officer.lastNameFather : officer.lastNameMother;
  const mid = midSource ? `${midSource.charAt(0)}.` : '';
  const last = isMarriedWoman ? officer.lastNameSpouse : (officer.lastNameFather || '');
  const suffix = officer.suffix ? officer.suffix : '';

  return `${first} ${mid} ${last} ${suffix}`.replace(/\s+/g, ' ').trim();
};
