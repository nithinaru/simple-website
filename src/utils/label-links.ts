/** write on each cobalt line and box how big it is, like the guides do */
export const labelLinks = (column: HTMLElement) => {
  for (const el of column.querySelectorAll<HTMLElement>(".lnk-t")) {
    el.dataset.w = String(Math.round(el.getBoundingClientRect().width));
  }
  // and on the box round the name, its width and height
  const name = column.querySelector<HTMLElement>(".name");
  const box = column.querySelector<HTMLElement>(".name-box");
  if (name && box) {
    const r = name.getBoundingClientRect();
    const size = `${Math.round(r.width)} × ${Math.round(r.height)}`;
    // kept aside too: the chip can be showing something else for a while
    // (see copyEmail in pages/index.tsx) and needs to know what to go back to
    box.dataset.measure = size;
    if (!box.hasAttribute("data-says")) box.dataset.size = size;
  }
};
