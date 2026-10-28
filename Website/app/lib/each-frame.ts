/**
 * Runs `update` now, then at most once a frame after any of `events` fires on the window, and
 * once more when `ready` settles. Returns the cleanup, after which `update` never runs again.
 */
export function updateEachFrame(update: () => void, events: (keyof WindowEventMap)[], ready?: Promise<unknown>) {
  let frame = 0;
  let live = true;
  function schedule() {
    cancelAnimationFrame(frame);
    if (live) frame = requestAnimationFrame(update);
  }
  update();
  for (const event of events) window.addEventListener(event, schedule, { passive: true });
  ready?.then(schedule);
  return () => {
    live = false;
    cancelAnimationFrame(frame);
    for (const event of events) window.removeEventListener(event, schedule);
  };
}
