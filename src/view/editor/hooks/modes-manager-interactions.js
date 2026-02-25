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
    controls: false,
  })
  watchEffect(() => {
    enable.entitieSelect = interactions.value.includes(entitieSelect)
    enable.entitieTranslation = interactions.value.includes(entitieTranslation)
    enable.pointsAdd = interactions.value.includes(pointsAdd)
    enable.linesAdd = interactions.value.includes(linesAdd)
    enable.polylinesAdd = interactions.value.includes(polylinesAdd)
    enable.arcsAdd = interactions.value.includes(arcsAdd)
    enable.controls = interactions.value.includes(controls)
  })
  const activator = {
    entitieSelect() {
      if (enable.entitieSelect) return
      add(interactions, [entitieSelect])
      remove(interactions, [pointsAdd, linesAdd, polylinesAdd, arcsAdd])
    },
    entitieTranslation() {
      if (enable.entitieTranslation) return
      add(interactions, [entitieTranslation])
      remove(interactions, [pointsAdd, linesAdd, polylinesAdd, arcsAdd])
    },
    pointsAdd() {
      if (enable.pointsAdd) return
      add(interactions, [pointsAdd])
      remove(interactions, [entitieSelect, entitieTranslation, linesAdd, polylinesAdd, arcsAdd])
    },
    linesAdd() {
      if (enable.linesAdd) return
      add(interactions, [linesAdd])
      remove(interactions, [entitieSelect, entitieTranslation, pointsAdd, polylinesAdd, arcsAdd])
    },
    polylinesAdd() {
      if (enable.polylinesAdd) return
      add(interactions, [polylinesAdd])
      remove(interactions, [entitieSelect, entitieTranslation, pointsAdd, linesAdd, arcsAdd])
    },
    arcsAdd() {
      if (enable.arcsAdd) return
      add(interactions, [arcsAdd])
      remove(interactions, [entitieSelect, entitieTranslation, pointsAdd, linesAdd, polylinesAdd])
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
const pointsAdd = Symbol('points_add')
const linesAdd = Symbol('lines_add')
const polylinesAdd = Symbol('polylines_add')
const arcsAdd = Symbol('arcs_add')

const entitieSelect = Symbol('entitie_select')
const entitieTranslation = Symbol('entitie_translation')

const controls = Symbol('controls')
