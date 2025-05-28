export const urls = Array.from({ length: 1027 }, (_, i) => ({
  url: `http://anzsco.ozhome.info/node/${365 + i}`,
  title: `ANZSCO Occupation ${365 + i}`,
  seeded: false,
  loading: false,
}));