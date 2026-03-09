<template></template>
<script setup>
import { ConstraintResolver } from './core/data-constraint.js'
import {
  useConstraints as useConstraintsManager,
  useConstraintsRelation as useConstraintsRelationManager,
} from './hooks/constraint-manager'
import {
  usePlanes as usePlanesGeometryQuery,
  usePoints as usePointsGeometryQuery,
  useArcs as useArcsGeometryQuery,
} from './hooks/geometry-query'

import {
  useConstraints as useConstraintsQuery,
  useConstraintsRelation as useConstraintsRelationQuery,
} from './hooks/constraint-query.js'

let constraintsQuery = useConstraintsQuery()
let constraintsRelationQuery = useConstraintsRelationQuery()
let constraintsManager = useConstraintsManager()
let constraintsRelationManager = useConstraintsRelationManager()
let planesGeometryQuery = usePlanesGeometryQuery()
let pointsGeometryQuery = usePointsGeometryQuery()
let arcsGeometryQuery = useArcsGeometryQuery()

ConstraintResolver.setContext('constraintsQuery', constraintsQuery)
ConstraintResolver.setContext('constraintsRelationQuery', constraintsRelationQuery)
ConstraintResolver.setContext('constraintsManager', constraintsManager)
ConstraintResolver.setContext('constraintsRelationManager', constraintsRelationManager)
ConstraintResolver.setContext('planesGeometryQuery', planesGeometryQuery)
ConstraintResolver.setContext('pointsGeometryQuery', pointsGeometryQuery)
ConstraintResolver.setContext('arcsGeometryQuery', arcsGeometryQuery)



</script>
