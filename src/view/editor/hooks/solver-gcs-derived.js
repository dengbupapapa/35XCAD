import { computed } from 'vue'
import { useStatusSolver as useStatusSolverGCS } from './solver-gcs-provide-context.js'
export {
  useModule,
  useNumerals,
  useNumeralsHash,
  useUnknownsSet,
  useSystems,
} from './solver-gcs-provide-context.js'

export function useStatusSolver() {
  let statusSolverGCS = useStatusSolverGCS()
  return computed(() => {
    return statusSolverGCS.value
  })
}
