<template>
    <b-container>
        <b-row v-if="addColumnButton && editable" class="w-100 d-flex justify-content-center">
            <b-button class="button-primary my-3 ml-auto mr-2" @click="openModal()">Añadir columnas</b-button>
            <AddColumnPopup :views="views" title="Añadir columnas" :showModal="showAddColumnModal" :header1="header1" :header2="header2" :currentChildren="itemsWithoutParent" :viewPrimaryHeader="primaryHeader" :viewSecondaryHeader="secondaryHeader"  @changeModalStatus="changeModalStatus"  @changeHeader2="changeHeader2" @changeHeader1="changeHeader1"  />
        </b-row>
        <b-row>
            <b-table-simple responsive>
                <b-thead>
                    <b-tr v-if="currentViewHeaderPrimary.length > 0">
                        <b-th v-for="(header,i) in shownPrimaryHeader"  :key="i" :colspan="header.key === 'pin' ? 1 : header.children.length" :sticky-column="i === 0 && existingPinedColumn() ? true : false" :class="i === 0 && existingPinedColumn() ? 'pined' : ''"> 
                            <b-row class="m-0 flex-nowrap justify-content-center align-items-center">
                                <p style="margin:0;" class="fs-small">{{header.name === 'Pined' ? '' : header.name}}</p>
                                <TableColumnPopup v-if="editable" :id="'table-popover-1'+i" :items="orderedItems" :originalHeaderPrimary="header1" :originalHeaderSecondary="header2" :headers1="primaryHeader" :headers2="secondaryHeader"  :col="header"  @changeHeader1="changeHeader1" @changeHeader2="changeHeader2" /> 
                            </b-row>
                        </b-th>
                    </b-tr>
                    <b-tr>
                        <b-th v-for="(header,i) in shownSecondaryHeader" :key="i"  :sticky-column="i === 0 && existingPinedColumn() ? true : false" :class="i === 0 && existingPinedColumn() ? 'pined' : ''"> 
                            <b-row class="m-0 flex-nowrap justify-content-center align-items-center">
                                <p class="fs-small">{{header.name}}</p>
                                <TableColumnPopup v-if="editable" :id="'table-popover-2'+i" :items="orderedItems" :originalHeaderPrimary="header1"  :originalHeaderSecondary="header2" :headers1="primaryHeader" :headers2="secondaryHeader" :col="header" @changeHeader1="changeHeader1" @changeHeader2="changeHeader2" />
                            </b-row>
                        </b-th>
                    </b-tr>
                </b-thead>
                <b-tbody>
                    <b-tr v-for="(item,i) in itemsPerPage" :key="i" > 
                        <b-td v-for="(it,j) in item" :key="j" :sticky-column="j === 0 && existingPinedColumn() ? true : false" :class="j === 0 && existingPinedColumn() ? 'pined' : ''">
                            <div v-if="isActionFieldIndex(j)"> 
                                <b-button v-for="(icon,k) in it.value" :key="k" :id="'button-action-'+i+k" class="button-icon mx-1 pa-0">
                                    <b-icon :icon="icon.icon" class="h5 icon-dark " @click="showButtonModal(icon.key,i)" ></b-icon>
                                    <b-tooltip :target="'button-action-'+i+k" :title="icon.name" placement="bottom"></b-tooltip>
                                </b-button>   
                            </div>
                            <b-badge v-else-if="isStatusFieldIndex(j)" pill :class="checkBadgeStatus(it.value,badgeKey(j))">{{it.value}}</b-badge>
                            <div v-else class="fs-small">{{it.value}}</div>        
                        </b-td> 
                    </b-tr>
                </b-tbody>
            </b-table-simple>
        </b-row>
        <div v-if="perPage" class="justify-content-center row mb-2 mt-4">
            <b-pagination size="md" :total-rows="this.orderedItems.length" :per-page="perPageLocal" v-model="currentPage" />
        </div>
    </b-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import TableColumnPopup from './TableColumnPopup.vue'
import AddColumnPopup from './AddColumnPopup.vue';
import {keySort} from '@/utils/table-functions';
import {orderHeaderSecondary} from '@/utils/table-functions';

@Component({
    components:{
        TableColumnPopup,
        AddColumnPopup
    }
})
export default class Table extends Vue {
    @Prop() header1!: Array<any>; // Todos los headers primarios 
    @Prop() header2!: Array<any>; // Todos los headers secundarios
    @Prop() currentViewHeaderPrimary!: Array<any>; 
    @Prop() currentViewHeaderSecondary!: Array<any>;
    @Prop() items!: Array<any>;
    @Prop() standarts!: Array<any>;
    @Prop() totals!: Array<{key: string}>;
    @Prop() perPage!: number;
    @Prop() editable!: boolean;
    perPageLocal : number = 2;
    @Prop() textFilter: string = '';
    @Prop() currentFilter? : any;
    @Prop() currentOrderFilter?: any;
    @Prop() addColumnButton?: boolean;
    @Prop() views!: any; //eliminar
    @Prop() itemsId!: string;
    currentPage= 1;
    filteredItems : any = [] 
    orderedItems : any[] = [];
    secondaryHeader : any[] = [];
    primaryHeader : any[] = [];
    showAddColumnModal: boolean = false;
    badges : Array<{value: number, key: string}> = [];
    actionsIndex : number = -1

    mounted(){
        if (this.perPage) this.perPageLocal = this.perPage;
    }

    @Watch('items')
    refreshItems(){
        this.filteredItems = this.items; 
        this.orderedItems = this.orderItems();
    }


    @Watch('currentViewHeaderPrimary') 
    changedViewHeader1(){
        this.primaryHeader = this.currentViewHeaderPrimary; 
    }

    @Watch('currentViewHeaderSecondary') 
    changedViewHeader2(){
        this.secondaryHeader = orderHeaderSecondary(this.currentViewHeaderPrimary,this.currentViewHeaderSecondary);
        this.orderedItems = this.orderItems();
    }

    /* Emite a la vista padre, la acción que se debe ejecutar sobre un determinado elemento de la tabla, devolviendo el id del elemento y la acción (editar, bloquear,etc) */
    showButtonModal(key: string,itemIndex: number){
        let itemsWithId = this.orderItems(this.items);
        /* Busca en los ítems mostrados en la página actual el elemento seleccionado, retornando el valor de su Identificador */
        let itemId = this.getItemsPerPage(itemsWithId)[itemIndex].find((el: { key: string; }) => el.key === this.itemsId).value
        this.$emit('showButtonModal',{itemId:itemId,actionKey:key})
    }

    /* Header secundario visible */
    get shownSecondaryHeader() : Array<any>{ 
        if (this.secondaryHeader.length === 0) {
            this.secondaryHeader = this.currentViewHeaderSecondary;
            // this.filteredItems = this.items; comentado       
            this.secondaryHeader = orderHeaderSecondary(this.shownPrimaryHeader,this.secondaryHeader);
        }
        return this.secondaryHeader;
    }

    /* Header primario visible */
    get shownPrimaryHeader() : Array<any>{
        if (this.primaryHeader.length === 0) this.primaryHeader = this.currentViewHeaderPrimary;
        return this.primaryHeader
    }

/* MÉTODOS EJECUTADOS CUANDO OCURRE ALGUN EVENTO EN TableColumnPopup */
        changeHeader1(newVal : any){ 
            this.primaryHeader = newVal;
        }
        changeHeader2(newVal : any){ 
            this.secondaryHeader = newVal;
            this.orderedItems = this.orderItems(); // Ordena los ítems según el header secundario
        }
/* FIN MÉTODOS EJECUTADOS CUANDO OCURRE ALGUN EVENTO EN TableColumnPopup */


/* PINES COLUMNS */

    /* Retorna "true" si existe en el encabezado secundario alguna columna pineada. */
    existingPinedColumn(): boolean{
        let found = this.secondaryHeader.find((el: { pined: boolean;}) => el.pined === true)
        if (found) return true
        else return false
    }

/* FINAL PINES COLUMNS */

/* BADGES */ 

    isStatusFieldIndex(index: number): boolean{
        let found = this.badges.find((el: any) => el.value === index)
        if (found) return true
        else return false
    }

    isStatusField(key: any): boolean{
        let found = this.standarts.find(el => el.key === key)
        if (found) return true;
        else return false;
    }

    badgeKey(index: number): any{
        let badge = this.badges.find(el => el.value === index)!;
        return badge.key;
    }

    /* Añade una clase de css ".badge-" + código correspondiente al Arreglo "standarts" */
    checkBadgeStatus(value: any, key: any){
        let keyFound = this.standarts.find(el => el.key === key);
        if (keyFound) {
            for (let i in this.getItemsKeys(keyFound.colors)){
                if (this.getItemsKeys(keyFound.colors)[i] === value){
                    return 'badge-'+ keyFound.colors[this.getItemsKeys(keyFound.colors)[i]]
                }
            }
        }
    }

    getItemsKeys(items: any){
        return Object.keys(items)
    }

/* FIN BADGES */ 




/* ACCIONES */

    isActionFieldIndex(index: number): boolean {
        if (this.actionsIndex === index) return true
        else return false
    }

/* FINAL ACCIONES */

/* FILTERS */

    @Watch('currentOrderFilter')
    changeOrderFilter(newVal: any){
        // cuando se reinician los filtros del sort, no se reinician los items de la table 
       this.filteredItems = keySort(newVal,this.filteredItems);
       this.orderedItems = this.orderItems(); 
    }

    @Watch('textFilter')
    filterByString(){
        this.filteredItems = this.items.filter( el => el[this.currentFilter.key].toString().toLowerCase().includes(this.textFilter.toLowerCase()));
        this.filteredItems = null;
        this.orderedItems = this.orderItems();
    }

/* END FILTERS */


/* PAGINATION */

    @Watch('perPage')
    changeItemsPerPage(){
        this.perPageLocal = this.perPage
    }

    getItemsPerPage(items: any): any {
       if (this.orderedItems.length === 0) {this.filteredItems = this.items; this.orderedItems = this.orderItems()} // carga inicial, arreglar
        let start = this.currentPage === 1 ? 0 : this.currentPage * this.perPageLocal - this.perPageLocal;
        let end = start + this.perPageLocal;
        return items.slice(start,end);
    }

    get itemsPerPage(): any {
        if (this.perPage){
            if (this.orderedItems.length === 0) {this.filteredItems = this.items; this.orderedItems = this.orderItems()} // carga inicial, arreglar
            let start = this.currentPage === 1 ? 0 : this.currentPage * this.perPageLocal - this.perPageLocal;
            let end = start + this.perPageLocal;
            return this.orderedItems.slice(start,end);
        }
        else 
            return this.orderedItems;
    }

    @Watch('currentPage')
        getPage(val: number){
            this.currentPage = val;
    }

/* END PAGINATION */


    /* Retorna los items en el orden en el que se encuentra el header secundario  */
    orderItems(items?: any): any{
        let newItemsOrder : any = [] ;
        this.badges = [] ;
        for (var j=0;j<this.filteredItems.length;j++){
            let obj : any[] = []; 
            let value : any = null
            for (var i=0;i<this.secondaryHeader.length;i++){
                let key : any = this.secondaryHeader[i]['key']
                value = this.filteredItems[j][key]; 
                obj[i] = {key: key, value:value};
                if (j === 0){
                    // Se guardan los index y el key de las columnas que serán badges.
                    if (this.isStatusField(key)){
                        this.badges.push({value:i, key: key})
                    }
                    if (key === 'actions'){
                        this.actionsIndex = i;
                    }
                }
            }   
            newItemsOrder[j] = obj
           if (items) {
               let id = this.filteredItems[j][this.itemsId];
               newItemsOrder[j].unshift({key: this.itemsId, value: id})
            }
        }
        return newItemsOrder
    }



/* AÑADIR COLUMNA */
    /* MODAL */
        changeModalStatus(newVal: boolean){
            this.showAddColumnModal = newVal;
        }

        openModal(){
            this.showAddColumnModal = true
        }
    /* FINAL MODAL */

    /* Retorna los headers secundarios que no poseen padre (header1)  */
    get itemsWithoutParent() : Array<any>{
        return this.header2.filter(el => el.parent === null)
    }
/* FINAL  AÑADIR COLUMNA */

}
</script>

<style lang="scss">
    .list-group-item{
        border: none !important;
        cursor: pointer;
        transition: all .3s;
        &:hover{
            background-color: rgb(243, 243, 243);
        }
    }
    .b-table{
        background-color: #fff;
    }
    .table-responsive{
        width: 90vw !important;
        margin: 0 auto !important;
    }

</style>