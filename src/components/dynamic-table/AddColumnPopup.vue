<template>
  <b-modal centered v-model="show" hide-footer>
            <template #modal-title style="display: flex;">
                <p v-if="!col">{{title}}</p> 
                <p v-else >{{title}} {{col.name}}</p>
            </template>
            <b-card no-body>
                <b-row class="vertical-tabs">
                    <b-col class="vertical-tabs__tabs pa-0">
                        <b-row  v-if="col" class="tabs mx-0 p-2 w-100 d-flex align-items-center justify-content-between active" >
                            <p>{{col.name === null ? 'Otras columnas' : col.name}}</p>
                            <b-icon icon="chevron-right" class="icon-dark icon-small mr-2" ></b-icon>
                        </b-row>
                        <div v-else v-for="(tab,i) in header1" :key="i">
                            <b-row v-if="tab.key !== 'actionParent'" :class="isCurrentTab(tab) === true ? 'tabs p-2 pl-3 active' : 'tabs p-2 pl-3'" @click="changeCurrentTab(tab)">
                                <p>{{tab.name === null ? 'Otras columnas' : tab.name}}</p>
                                <b-icon icon="chevron-right" class="icon-dark icon-small mr-2" ></b-icon>
                            </b-row>
                        </div>         
                    </b-col>
                    <b-col class="vertical-tabs__content pa-0">
                        <b-row v-for="(content,j) in categoryChildren" :key="j" class="px-2 w-100 mx-0">
                            <b-form-checkbox v-if="!content.pined" class="my-2" v-model="content.shown">{{content.name}}</b-form-checkbox>
                        </b-row>
                        {{header1}}
                    </b-col>
                </b-row>
            </b-card>
            <b-button class="button-primary mt-5" block @click="saveView()">Guardar Columnas</b-button>
  </b-modal>  
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import {addPinedColumnInPrimaryHeader, existingPinedColumn, getPinedColumn, orderHeaderSecondary, removeColumnChild} from '../../../utils/table-functions';

@Component({})
export default class AddColumnPopup extends Vue {
    @Prop() title?: string; 
    @Prop() header1!: Array<any>;  //Header primario original
    @Prop() header2!: Array<any>; //Header secundario original
    @Prop() viewPrimaryHeader!: Array<any>;
    @Prop() viewSecondaryHeader!: Array<any>;
    @Prop() showModal!: boolean;
    @Prop() col? : any;
    @Prop() views! : any; //eliminar
    viewPrimaryHeaderLocal!: Array<any>;
    viewSecondaryHeaderLocal!: Array<any>;
    show: boolean = false;
    currentTab: any = {};
    primaryHeaderLocal : Array<any> = [];
    secondaryHeaderLocal : Array<any> = [];
    currentChildren: Array<any> =[];



    mounted(){
       this.secondaryHeaderLocal = this.header2
       this.primaryHeaderLocal = this.header1
       this.viewSecondaryHeaderLocal = this.viewSecondaryHeader;
       this.viewPrimaryHeaderLocal = this.viewPrimaryHeader;
       this.currentTab = this.header1[0];
       if (this.col) this.currentTab = this.col;
    }

    @Watch('viewSecondaryHeader')
    watchSecondaryHeader(){
        this.secondaryHeaderLocal = this.viewSecondaryHeader;
    }

    get categoryChildren() : any { /* Retorna los hijos del tab seleccionado  */
       let children : any = [];
       try{
            this.secondaryHeaderLocal.forEach(el => {
                if (this.currentTab.children.find((e: any) => e.key === el.key)){
                    children.push(el);}
            })
            return children
       }
       catch(err){
       }
    }


   
/* MODAL */
    @Watch('showModal')
     renderModal(){
        this.show = this.showModal;
        if (this.col){
            this.secondaryHeaderLocal =  this.header2;
            this.primaryHeaderLocal = this.header1;
            this.viewSecondaryHeaderLocal = this.viewSecondaryHeader;
            this.viewPrimaryHeaderLocal = this.viewPrimaryHeader;
            this.currentTab = this.primaryHeaderLocal.find(el => el.key === this.col.key)  //this.col;
        }
    }

    @Watch('show')
    sendToParent(newVal: boolean){
        this.$emit('changeModalStatus', newVal)
    }
/* END MODAL */

    changeCurrentTab(tab: any){
        this.currentTab = tab;
    }

    isCurrentTab(tab: any): boolean{
        if (tab === this.currentTab) return true
        else return false
    }
  
    finalPrimaryHeader(headerSecondary: any) : Array<any>{
      let finalHeader: Array<any> = []
        this.viewPrimaryHeaderLocal.forEach((el: { key: any; children: any;}) => {
            let found = headerSecondary.filter((e: { parent: any; }) => e.parent === el.key);
            if (found.length > 0){
                let item = el;
                item.children = [];
                found.forEach((e: { key: any; }) =>{
                    item.children.push({key: e.key})
                })
                finalHeader.push(item);
            }
        })   
      return finalHeader
    }

  finalSecondaryHeader(): Array<any>{
      return this.secondaryHeaderLocal.filter(el => el.shown === true);
  }
 
  saveView(){
      this.show = false;
      let finalHeader1 : Array<any> = []
      let finalHeader2 : Array<any> = []
      finalHeader2 = this.finalSecondaryHeader()
      finalHeader1 = this.finalPrimaryHeader(finalHeader2)
      finalHeader2 = orderHeaderSecondary(finalHeader1,finalHeader2);
      if (existingPinedColumn(finalHeader2)){
          let pinedColumn = getPinedColumn(finalHeader2);
          finalHeader1 = addPinedColumnInPrimaryHeader(pinedColumn,finalHeader1)
          let pinedParentKey = pinedColumn.parent;
          let pinedParent = finalHeader1.find((el: { key: any})=> el.key === pinedParentKey);
          finalHeader1 = removeColumnChild(finalHeader1,pinedParent,pinedColumn)
      }
      console.log(finalHeader1)
      if (finalHeader1.length === 0){
          window.alert('No pueden eliminar todas las columas de una tabla.\nSi desea reemplazar esta alerta diríjase al método saveView del componente AddColumnPopup')
      }else{
          if (!this.col){
            this.$emit('changeHeader1',finalHeader1);
            this.$emit('changeHeader2',finalHeader2);
          }
          else{
            this.$emit('changeHeaders',finalHeader2,finalHeader1)
          }
      }
      
  }


}

</script>

<style lang="scss" scoped>
</style>