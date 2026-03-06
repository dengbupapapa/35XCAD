import {
  useConstraints as useConstraintsManager,
  useConstraintsRelation as useConstraintsRelationManager,
} from './constraint-manager.js'
import {
  useConstraints as useConstraintsQuery,
  useConstraintsRelation as useConstraintsRelationQuery,
} from './constraint-query.js'

/*
 * 删除重合约束如果是polylines创建的还要想办法更新polylines
 */
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
    //移除某约束关系中的某一项
    removeItem(id, index) {
      let constraintRelation = constraintsRelationQuery.get(id)
      let constraint = constraintRelation.constraints[index]
      constraintRelation.geometrys.splice(index, 1)
      constraintRelation.constraints.splice(index, 1)
      constraintsManager.removeById(constraint)
      if (constraintRelation.constraints.length === 0) {
        constraintsRelationManager.removeById(id)
      }
    },
    removeItemByConstraint(batch) {
      if (!(batch instanceof Array)) {
        batch = [batch]
      }
      ;[...constraintsRelationQuery.all()].forEach((constraintRelation) => {
        ;[...constraintRelation.constraints].forEach((relation) => {
          if (batch.includes(relation)) {
            this.removeItem(constraintRelation.id, constraintRelation.constraints.indexOf(relation))
          }
        })
      })
    },
    removeItemByGeometry(batch) {
      if (!(batch instanceof Array)) {
        batch = [batch]
      }
      ;[...constraintsRelationQuery.all()].forEach((constraintRelation) => {
        ;[...constraintRelation.geometrys].forEach((items) => {
          if (items.some((geometry) => batch.includes(geometry))) {
            this.removeItem(constraintRelation.id, constraintRelation.geometrys.indexOf(items))
          }
        })
      })
    },
  }
}
