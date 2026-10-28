import { createCn, validators } from 'cn/config';

/** Joins and merges Tailwind classes, knowing the site's point-sized `text-pt-*` and `rounded-pt-*`. */
export const cn = createCn({
  extend: {
    classGroups: {
      'font-size': [{ text: [{ pt: [validators.isNumber] }] }],
      rounded: [{ rounded: [{ pt: [validators.isNumber] }] }],
    },
  },
});
