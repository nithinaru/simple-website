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
    box.dataset.size = `${Math.round(r.width)} × ${Math.round(r.height)}`;
  }
};
