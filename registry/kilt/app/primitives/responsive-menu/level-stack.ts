// Vendored from Kiki (primitives/responsive-menu/level-stack.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
export type LevelStack = {
  push: (pop: () => void) => () => void;
  popTop: () => boolean;
};

export function createLevelStack(): LevelStack {
  let pops: Array<() => void> = [];
  return {
    push: (pop) => {
      pops = [...pops, pop];
      return () => {
        pops = pops.filter((entry) => entry !== pop);
      };
    },
    popTop: () => {
      const top = pops.at(-1);
      top?.();
      return top !== undefined;
    },
  };
}
