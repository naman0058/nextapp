type AdSlotProps = {
  /** Future placement identifier for AdSense integration */
  placement: string;
  className?: string;
};

/**
 * Renders nothing until an ad network is explicitly configured.
 * Do not use fake ad boxes in production.
 */
export function AdSlot(props: AdSlotProps) {
  void props.placement;
  void props.className;
  return null;
}
