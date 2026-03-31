import {
  useAddPointClick,
  useAddLineClick,
  useAddPolylineClick,
  useAddArcClick,
} from './viewport-behavior-creator'
import {
  useSelect as useSelectCursor,
  useMove as useMoveCursor,
  useDelete as useDeleteCursor,
  useControls as useControlsCursor,
} from './viewport-behavior-cursor'
import {
  useSelect as useSelectDimension,
  useMove as useMoveDimension,
} from './viewport-behavior-dimension'

export default function useViewportBehavior() {
  useAddPointClick()
  useAddLineClick()
  useAddPolylineClick()
  useAddArcClick()

  useSelectCursor()
  useMoveCursor()
  useDeleteCursor()
  useControlsCursor()

  useSelectDimension()
  useMoveDimension()
}
