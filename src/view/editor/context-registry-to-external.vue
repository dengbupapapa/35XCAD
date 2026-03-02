<template></template>
<script setup>
import { ConstraintResolver } from './core/solver-gcs.js'
import {
  useConstraints as useConstraintsManager,
  useConstraintsRelation as useConstraintsRelationManager,
} from './hooks/constraint-manager'
import { usePlanes as usePlanesGeometryQuery } from './hooks/geometry-query'

let constraintsManager = useConstraintsManager()
let constraintsRelationManager = useConstraintsRelationManager()
let planesGeometryQuery = usePlanesGeometryQuery()
ConstraintResolver.setContext('constraintsManager', constraintsManager)
ConstraintResolver.setContext('constraintsRelationManager', constraintsRelationManager)
ConstraintResolver.setContext('planesGeometryQuery', planesGeometryQuery)
</script>