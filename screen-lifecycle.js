/**
 * screen-lifecycle.js
 * Shared screen lifecycle helper so app navigation uses consistent enter/leave/re-enter behavior.
 */

export function createScreenLifecycle({ id, element, onEnter, onLeave, onReenter } = {}) {
  let isActive = false;
  let hasEntered = false;

  const enter = (context = {}) => {
    if (isActive) return false;

    const handler = hasEntered && typeof onReenter === "function" ? onReenter : onEnter;
    handler?.(context);
    isActive = true;
    hasEntered = true;
    return true;
  };

  const leave = (context = {}) => {
    if (!isActive) return false;
    onLeave?.(context);
    isActive = false;
    return true;
  };

  return {
    id,
    element,
    enter,
    leave,
    activate: enter,
    deactivate: leave,
    isActive: () => isActive,
    hasEntered: () => hasEntered,
  };
}
