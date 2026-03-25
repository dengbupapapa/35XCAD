import { reactive, watchEffect } from 'vue'
import { useInteractions } from './modes-provide-context.js'

export default function useModesManagerInteractions() {
  const interactions = useInteractions()
  const enable = reactive({
    entitieSelect: false,
    entitieTranslation: false,
    pointsAdd: false,
    linesAdd: false,
    polylinesAdd: false,
    arcsAdd: false,
    dimensionAdd: false,
    controls: false,
  })
  watchEffect(() => {
    enable.entitieSelect = interactions.value.includes(entitieSelect)
    enable.entitieTranslation = interactions.value.includes(entitieTranslation)
    enable.pointsAdd = interactions.value.includes(pointsAdd)
    enable.linesAdd = interactions.value.includes(linesAdd)
    enable.polylinesAdd = interactions.value.includes(polylinesAdd)
    enable.arcsAdd = interactions.value.includes(arcsAdd)
    enable.dimensionAdd = interactions.value.includes(dimensionAdd)
    enable.controls = interactions.value.includes(controls)
  })
  const activator = {
    entitieSelect() {
      if (enable.entitieSelect) return
      clear(interactions)
      add(interactions, [entitieSelect, entitieTranslation, controls])
    },
    entitieTranslation() {
      if (enable.entitieTranslation) return
      clear(interactions)
      add(interactions, [entitieSelect, entitieTranslation, controls])
    },
    pointsAdd() {
      if (enable.pointsAdd) return
      clear(interactions)
      add(interactions, [pointsAdd, controls])
    },
    linesAdd() {
      if (enable.linesAdd) return
      clear(interactions)
      add(interactions, [linesAdd, controls])
    },
    polylinesAdd() {
      if (enable.polylinesAdd) return
      clear(interactions)
      add(interactions, [polylinesAdd, controls])
    },
    arcsAdd() {
      if (enable.arcsAdd) return
      clear(interactions)
      add(interactions, [arcsAdd, controls])
    },
    dimensionAdd() {
      if (enable.dimensionAdd) return
      clear(interactions)
      add(interactions, [dimensionAdd, controls])
    },
    controls(state = true) {
      if (enable.controls === state) return
      if (state) {
        add(interactions, [controls])
      } else {
        remove(interactions, [controls])
      }
    },
  }
  return {
    enable,
    activator,
  }
}

function remove(data, symbols) {
  data.value = data.value.filter((symbol) => !symbols.includes(symbol))
}
function add(data, symbols) {
  data.value.push(...symbols)
  data.value = [...new Set(data.value)]
}
function clear(data) {
  data.value = []
}
const pointsAdd = Symbol('points_add')
const linesAdd = Symbol('lines_add')
const polylinesAdd = Symbol('polylines_add')
const arcsAdd = Symbol('arcs_add')

const entitieSelect = Symbol('entitie_select')
const entitieTranslation = Symbol('entitie_translation')

const controls = Symbol('controls')
const dimensionAdd = Symbol('dimension_add')
