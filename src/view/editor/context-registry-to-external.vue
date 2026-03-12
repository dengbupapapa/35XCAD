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
  useLines as useLinesGeometryQuery,
  useArcs as useArcsGeometryQuery,
} from './hooks/geometry-query'

import {
  useConstraints as useConstraintsQuery,
  useConstraintsRelation as useConstraintsRelationQuery,
} from './hooks/constraint-query.js'

import { usePolylines as usePolylinesGeometryMapper } from './hooks/geometry-mapper'
import { usePolylines as usePolylinesGeometryManager } from './hooks/geometry-manager'

let constraintsQuery = useConstraintsQuery()
let constraintsRelationQuery = useConstraintsRelationQuery()
let constraintsManager = useConstraintsManager()
let constraintsRelationManager = useConstraintsRelationManager()
let planesGeometryQuery = usePlanesGeometryQuery()
let pointsGeometryQuery = usePointsGeometryQuery()
let linesGeometryQuery = useLinesGeometryQuery()
let arcsGeometryQuery = useArcsGeometryQuery()
let polylinesGeometryMapper = usePolylinesGeometryMapper()
let polylinesGeometryManager = usePolylinesGeometryManager()

ConstraintResolver.setContext('constraintsQuery', constraintsQuery)
ConstraintResolver.setContext('constraintsRelationQuery', constraintsRelationQuery)
ConstraintResolver.setContext('constraintsManager', constraintsManager)
ConstraintResolver.setContext('constraintsRelationManager', constraintsRelationManager)
ConstraintResolver.setContext('planesGeometryQuery', planesGeometryQuery)
ConstraintResolver.setContext('pointsGeometryQuery', pointsGeometryQuery)
ConstraintResolver.setContext('linesGeometryQuery', linesGeometryQuery)
ConstraintResolver.setContext('arcsGeometryQuery', arcsGeometryQuery)
ConstraintResolver.setContext('polylinesGeometryMapper', polylinesGeometryMapper)
ConstraintResolver.setContext('polylinesGeometryManager', polylinesGeometryManager)
</script>
