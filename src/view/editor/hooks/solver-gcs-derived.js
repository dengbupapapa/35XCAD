import { computed } from 'vue'
import { useSolverResult as useSolverResultGCS } from './solver-gcs-provide-context.js'
export {
  useModule,
  useNumerals,
  useNumeralsHash,
  useUnknownsSet,
  useUnknownsSetJSON,
  useSystems,
  usePoints,
  usePointsHash,
} from './solver-gcs-provide-context.js'

export function useSolverResult() {
  let solverResultGCS = useSolverResultGCS()
  return computed(() => {
    return solverResultGCS.value
  })
}
