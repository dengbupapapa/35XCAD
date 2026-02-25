import {
  useSelectPoints as useSelectPointsInteractionManager,
  useSelectLines as useSelectLinesInteractionManager,
} from './interaction-manager'
// import {
//   useSelectPoints as useSelectPointsInteractionQuery,
//   useSelectLines as useSelectLinesInteractionQuery,
// } from './interaction-query'
import {
  usePoints as useSelectPointsGeometryQuery,
  useLines as useSelectLinesGeometryQuery,
} from './geometry-query'

export function useSelectGeometrys() {
  let selectsPointsInteractionManager = useSelectPointsInteractionManager()
  let selectLinesInteractionManager = useSelectLinesInteractionManager()
  let selectsPointsGeometryQuery = useSelectPointsGeometryQuery()
  let selectLinesGeometryQuery = useSelectLinesGeometryQuery()
  return {
    push(ids){
      if (!(ids instanceof Array)) {
        ids = [ids]
      }
      ids.forEach((id)=>{
        if(selectsPointsGeometryQuery.hasById(id)){
          selectsPointsInteractionManager.push(id)
        }
        if(selectLinesGeometryQuery.hasById(id)){
          selectLinesInteractionManager.push(id)
        }
      })   
    },
    remove(ids){
      if (!(ids instanceof Array)) {
        ids = [ids]
      }
      ids.forEach((id)=>{
        if(selectsPointsGeometryQuery.hasById(id)){
          selectsPointsInteractionManager.remove(id)
        }
        if(selectLinesGeometryQuery.hasById(id)){
          selectLinesInteractionManager.remove(id)
        }
      }) 
    },
    clear(){
      selectsPointsInteractionManager.clear();
      selectLinesInteractionManager.clear();
    },
    set(ids) {
      if (!(ids instanceof Array)) {
        ids = [ids]
      }      
      this.clear();
      this.push(ids);
    },
  }
}
