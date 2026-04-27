import { useCallback, useEffect, useRef, useState } from "react"

const BOTTOM_MIN = 38   // px – smallest the bottom panel can get
const BOTTOM_MAX = 0.8  // fraction of container – largest it can get

export const useVerticalResize = (containerRef, initialBottomPx = 280) => {
  const [bottomHeight, setBottomHeight] = useState(initialBottomPx)
  const dragging = useRef(false)
  const startY   = useRef(0)
  const startH   = useRef(0)

  const onMouseDown = useCallback((e) => {
    e.preventDefault()
    dragging.current = true
    startY.current   = e.clientY
    startH.current   = bottomHeight
    document.body.style.cursor    = 'row-resize'
    document.body.style.userSelect = 'none'
  }, [bottomHeight])

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return
      const delta      = startY.current - e.clientY          // drag up → bigger bottom
      const container  = containerRef.current
      const maxH       = container ? container.clientHeight * BOTTOM_MAX : 9999
      const newH       = Math.min(maxH, Math.max(BOTTOM_MIN, startH.current + delta))
      setBottomHeight(newH)
    }
    const onUp = () => {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor    = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [containerRef])

  return { bottomHeight, setBottomHeight, onMouseDown }
}