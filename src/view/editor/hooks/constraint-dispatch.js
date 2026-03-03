import {
  useConstraints as useConstraintsManager,
  useConstraintsRelation as useConstraintsRelationManager,
} from './constraint-manager.js'
import {
  useConstraints as useConstraintsQuery,
  useConstraintsRelation as useConstraintsRelationQuery,
} from './constraint-query.js'

export function useConstraints() {
  let constraintsManager = useConstraintsManager()
  let constraintsRelationManager = useConstraintsRelationManager()
  let constraintsQuery = useConstraintsQuery()
  let constraintsRelationQuery = useConstraintsRelationQuery()
  return {
    removeById(id) {
      let constraintRelation = constraintsRelationQuery.get(id)
      let { constraints } = constraintRelation
      constraintsRelationManager.removeById(id)
      constraints.forEach((constraint) => {
        constraintsManager.removeById(constraint)
      })
    },
  }
}
