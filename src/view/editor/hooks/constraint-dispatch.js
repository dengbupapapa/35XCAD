import {
  useConstraints as useConstraintsManager,
  useConstraintsRelation as useConstraintsRelationManager,
} from './constraint-manager.js'
import {
  useConstraints as useConstraintsQuery,
  useConstraintsRelation as useConstraintsRelationQuery,
} from './constraint-query.js'
import { ConstraintResolver } from '../core/data-constraint.js'

export function useConstraints(options) {
  let constraintsManager = useConstraintsManager(options)
  let constraintsRelationManager = useConstraintsRelationManager()
  let constraintsQuery = useConstraintsQuery()
  let constraintsRelationQuery = useConstraintsRelationQuery()

  let constraintResolver = new ConstraintResolver() //加占时只能用同步不能用effectDdebounce
  return {
    /*
     * 以下目前适合基于ConstraintResolver逻辑处理的
     */
    removeById(id) {
      constraintResolver.solverUnattach(id)
    },
    add(name, args, driving, tag) {
      return constraintResolver.solverAttach(name, args, driving, tag)
    },
    usable(args) {
      return constraintResolver.solverUsable(args)
    },
    /*
     * 以下目前适合geometry正确处理完毕的
     */
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
        ;[...constraintRelation.constraints].forEach((constraint) => {
          if (batch.includes(constraint)) {
            this.removeItem(
              constraintRelation.id,
              constraintRelation.constraints.indexOf(constraint),
            )
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
