<template></template>
<script setup>
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

import {
  usePolylines as usePolylinesGeometryMapper,
  useHelpers as useHelpersGeometryMapper,
} from './hooks/geometry-mapper'
import { usePolylines as usePolylinesGeometryManager } from './hooks/geometry-manager'

import { useRenderer } from './hooks/viewport-provide-context.js'

let constraintsQuery = useConstraintsQuery()
let constraintsRelationQuery = useConstraintsRelationQuery()
let constraintsManager = useConstraintsManager()
let constraintsManagerEffectDebounce = useConstraintsManager({ effectDdebounce: true })
let constraintsRelationManager = useConstraintsRelationManager()
let planesGeometryQuery = usePlanesGeometryQuery()
let pointsGeometryQuery = usePointsGeometryQuery()
let linesGeometryQuery = useLinesGeometryQuery()
let arcsGeometryQuery = useArcsGeometryQuery()
let polylinesGeometryMapper = usePolylinesGeometryMapper()
let polylinesGeometryManager = usePolylinesGeometryManager()
let renderer = useRenderer()
let helpersGeometryMapper = useHelpersGeometryMapper()

import { ConstraintResolver } from './core/data-constraint.js'
ConstraintResolver.setContext('constraintsQuery', constraintsQuery)
ConstraintResolver.setContext('constraintsRelationQuery', constraintsRelationQuery)
ConstraintResolver.setContext('constraintsManager', constraintsManager)
ConstraintResolver.setContext('constraintsManagerEffectDebounce', constraintsManagerEffectDebounce)
ConstraintResolver.setContext('constraintsRelationManager', constraintsRelationManager)
ConstraintResolver.setContext('planesGeometryQuery', planesGeometryQuery)
ConstraintResolver.setContext('pointsGeometryQuery', pointsGeometryQuery)
ConstraintResolver.setContext('linesGeometryQuery', linesGeometryQuery)
ConstraintResolver.setContext('arcsGeometryQuery', arcsGeometryQuery)
ConstraintResolver.setContext('polylinesGeometryMapper', polylinesGeometryMapper)
ConstraintResolver.setContext('polylinesGeometryManager', polylinesGeometryManager)

import { Raycaster } from './core/gl-query'
Raycaster.setContext('planesGeometryQuery', planesGeometryQuery)
Raycaster.setContext('pointsGeometryQuery', pointsGeometryQuery)
Raycaster.setContext('linesGeometryQuery', linesGeometryQuery)
Raycaster.setContext('arcsGeometryQuery', arcsGeometryQuery)
Raycaster.setContext('renderer', renderer)
Raycaster.setContext('helpersGeometryMapper', helpersGeometryMapper)
</script>
