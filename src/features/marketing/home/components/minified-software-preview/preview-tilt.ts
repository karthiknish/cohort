export function resetPreviewTilt(node: HTMLDivElement | null) {
  if (node) {
    node.style.transform = ''
  }
}

export function applyPreviewTilt(node: HTMLDivElement | null, rotateX: number, rotateY: number) {
  if (!node) {
    return
  }
  node.style.transform = `translate3d(0, -4px, 0) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`
}
