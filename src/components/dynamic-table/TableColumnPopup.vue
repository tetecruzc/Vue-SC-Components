<template>
    <div class="ml-auto">
        <b-button pill :id="id" class="table-header-menu " v-if="!isFixedColumnParent()">
            <i class="table-header-menu__icon"></i>
        </b-button>
        <b-popover  :target="id" triggers="focus">
            <b-list-group>
                    <b-list-group-item v-if="col.children && !isFixedColumn(col)" @click="changeColumn('add')">
                        <b-icon icon="plus-circle" class="icon-dark mr-2" ></b-icon>
                        Add column
                    </b-list-group-item>
                    <b-list-group-item @click="changeColumn('remove')">
                        <b-icon icon="trash" class="icon-dark mr-2" ></b-icon>
                        Remove column
                    </b-list-group-item>
                    <b-list-group-item v-if="!isFixedColumn(col) && !isFixedColumnBeside() && canColumnMove(col,'left') " @click="changeColumn('left')">
                        <b-icon icon="chevron-left" class="icon-dark mr-2" ></b-icon>
                        Move column left
                    </b-list-group-item>
                    <b-list-group-item v-if="!isFixedColumn(col) && canColumnMove(col,'right') " @click="changeColumn('right')">
                        <b-icon icon="chevron-right" class="icon-dark mr-2" ></b-icon>
                        Move column right
                    </b-list-group-item>
                    <b-list-group-item v-if="!col.children && !isFixedColumn(col) && !existingColumnFixed()" @click="changeColumn('pin')">
                        <b-icon icon="geo" class="icon-dark mr-2" ></b-icon>
                        Pin
                    </b-list-group-item>
                    <b-list-group-item v-if="!col.children && isFixedColumn(col)" @click="changeColumn('unpin')">
                        <b-icon icon="geo" class="icon-dark mr-2" ></b-icon>
                        Unpin
                    </b-list-group-item>
            </b-list-group>
        </b-popover>
        <AddColumnPopup v-if="col.children" title="Editar columna" :col="col" :header1="originalHeaderPrimary" :header2="originalHeaderSecondary" :viewPrimaryHeader="headers1" :viewSecondaryHeader="headers2" :showModal="showAddColumnModal"   @changeModalStatus="changeModalStatus" @changeHeaders="sendHeadersToParent"/>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { addPinedColumnInPrimaryHeader, removeColumnChild } from '@/utils/table-functions';
import AddColumnPopup from './AddColumnPopup.vue'

@Component({
    components:{
        AddColumnPopup
    }
})
export default class TableColumnPopup extends Vue {
    @Prop() id! : string;
    @Prop() headers1!: Array<any>; 
    @Prop() headers2!: Array<any>; 
    @Prop() originalHeaderSecondary?: Array<any>;
    @Prop() originalHeaderPrimary?: Array<any>;
    @Prop() items!: Array<any>; 
    @Prop() col: any; 
    showAddColumnModal: boolean = false;
    currentChildren : Array<any> = []



    changeColumn(val: string){
        if (this.col.children){
            this.moveColumns(this.headers1,val)
        }else{
            this.moveColumns(this.headers2,val)
        }
    } 

    getColumnIndex(header: any){ // Devuelve el index de la columna seleccionada
        return header.findIndex((el: { name: any; }) => el.name === this.col.name);
    }

    sendHeadersToParent(headerSecondary: any, headerPrimary?: any, ){
        if (headerPrimary) this.$emit('changeHeader1',headerPrimary)
        if (headerSecondary) this.$emit('changeHeader2',headerSecondary)
    }


    moveColumns(header: any, val: string){
        let headers = header.filter((el: { name: any; }) => el.name !== this.col.name); // Retorna los headers, menos el seleccionado
        let index = this.getColumnIndex(header) // Devuelve el index de la columna seleccionada
        let item = this.col // Columna actual
        let headerSecondary : any = this.headers2;
        if (val === 'left'){
            if (this.col.children && index !==0){ // Si la columna es una columna padre, y no es la primera posición...
               headerSecondary = this.moveHeaderPrimaryChilds(this.col,val); // Mueve a los hijos de la columna padre hacia la izquierda
               if (index !== 0 ) headers.splice(index - 1, 0, item);  // Añade la columna padre hacia la izquierda de su posición actual
                this.sendHeadersToParent(headerSecondary, headers)
            }
            else if (this.canColumnMove(this.col, val) && (index !== 0)){ // Si la columna hija puede moverse a la izquerda, y no esta en la posición 0
               headers.splice(index - 1, 0, item); // Añade la columna hija hacia la izquierda de su posición actual
               this.sendHeadersToParent(headers)}
        }
        else if ( val === 'right') {
            if (this.col.children && ((index+1) !== header.length)){
                headerSecondary = this.moveHeaderPrimaryChilds(this.col, val) // Mueve a los hijos de la columna padre hacia la derecha
                if ((index+1) !== header.length)  headers.splice(index + 1, 0, item); // Añade la columna padre hacia la derecha de su posición actual
                this.sendHeadersToParent(headerSecondary, headers)
            }
            else if ((this.canColumnMove(this.col,val)) && ((index+1) !== header.length)) { // Si la columna hija puede moverse a la izquerda, y no esta en la ultima posición 
                headers.splice(index + 1, 0, item);  // Añade la columna hija hacia la derecha de su posición actual
                this.sendHeadersToParent(headers)
            }
        }
        else if (val === 'remove'){
            if (this.col.children){
                headers = this.removeColumn(this.headers1,this.col);
                headerSecondary = this.headers2
                for (var column in this.col.children){
                   headerSecondary = this.removeColumn(headerSecondary,this.col.children[column]) 
                }
                if (headers.length > 0)
                    this.sendHeadersToParent(headerSecondary,headers)
                else this.showLastColumnAlert()
            } 
            else {  
                if (this.headers1.length > 0){ // Si existe el header primario
                    /* No esta funcionando correctamente. si comento las lineas y elimino ultima columna, lo permite */
                    if (this.headers1.length === 1 && this.headers1[0].children.length === 1) { // arreglando error momentaneamente
                        this.showLastColumnAlert()
                    }else {
                        let {headers, headerSecondary} = this.getRemovedColumns();
                        this.sendHeadersToParent(headerSecondary, headers)
                    }
                }else {
                    headerSecondary = this.removeColumn(this.headers2, this.col);
                    if (headerSecondary.length === 0) this.showLastColumnAlert()
                    else this.sendHeadersToParent(headerSecondary)
                }
            }
        }
        else if (val === 'add'){
            this.showAddColumnModal = true;
        }
        else if (val === 'pin'){
            let {headers, headerSecondary} = this.getRemovedColumns(); 
            this.col.pined = true;
            headerSecondary.unshift(this.col);
            if (headers.length > 0)  headers = addPinedColumnInPrimaryHeader(this.col,headers)
            this.sendHeadersToParent(headerSecondary, headers);
        }
        else if (val === 'unpin'){
            let headers = this.headers1;
            let headerSecondary = this.headers2;
            headerSecondary.shift();      
            this.col.pined = false;
            if (headers.length > 0){
                headers.shift();
                let headerSecondaryParent = this.headers1.find(el => el.key === this.col.parent);
                headers = this.addChildrenToParent(headers,headerSecondaryParent,this.col);
                headerSecondary = this.addColumnToParent(headerSecondary,headerSecondaryParent, this.col);
            }
            else headerSecondary.push(this.col)
            this.sendHeadersToParent(headerSecondary, headers)
        }
    }

    showLastColumnAlert(){
        window.alert('No pueden eliminar todas las columas de una tabla.\nSi desea reemplazar esta alerta diríjase al método showLastColumnAlert del componente TableColumnPopup')            
    }

    isFixedColumn(col: any) : boolean{
            if ((col.key === 'pin') || (col.pined === true))  return true
            else return false
    }

    isFixedColumnParent(){
        if (this.col.children && this.isFixedColumn(this.col)) return true
        else return false
    }

    existingColumnFixed() : boolean{
        let found = this.headers2.find((el: { pined: boolean;}) => el.pined === true)
        if (found) return true
        else return false
    }

    isFixedColumnBeside() : boolean {
            if (this.existingColumnFixed()){
               let index = this.headers1.findIndex(el => el.key === this.col.key);
               if (index === 1) return true
            }
           return false
    }

    getRemovedColumns(): any{
        let headers = this.headers1;     
        let headerSecondary = this.headers2;
        if (headers.length > 0){
            let headerSecondaryParent = headers.find(el => el.key === this.col.parent); 
            let newHeaderPrimary = removeColumnChild(headers,headerSecondaryParent, this.col) 
             if (headerSecondaryParent.children.length === 0) {
                newHeaderPrimary = this.removeColumn(newHeaderPrimary,headerSecondaryParent)
                headers = newHeaderPrimary
            }
        }
        headerSecondary = this.removeColumn(headerSecondary,this.col);
        return {headers,headerSecondary}
    }




    addColumnToParent(header: any,parent: any, child: any){ // agrega al header 2 una nueva columna correspondiente a un padre.
        let index = this.getFirstColumnChildIndex(parent) -1 + parent.children.length
        header.splice(index + 1, 0, child);
        return header;
    }


    addChildrenToParent(headerParent: any, parentColumn: any, children: any){ // Agrega al header 1 sus nuevos hijos en el arreglo
        headerParent.forEach((element: { key: any; children: any;}) =>{
            if (element.key === parentColumn.key){
                element.children.push(children)
            }
        })
        return headerParent
    }

    setSelectedChilds(){
        this.currentChildren.forEach(el =>{
                let found = this.col.children.find((element: { key: any; }) => element.key === el.key)
                if (found) el.selected = true
                else el.selected = false
        })
    }
    
// se pasó a table columns
    // removeColumnChild(parent: any, child: any){ // Retorna el header sin el hijo pasado por parámetro
    //     let newParentChilds = this.removeColumn(parent.children, child); // Retorna los nuevos hijos de la columna padre
    //     let newHeaderPrimary = this.headers1;
    //     newHeaderPrimary.forEach( el =>{ 
    //         if (el.key === parent.key) el.children = newParentChilds;
    //     })
    //     return newHeaderPrimary;
    // }

    //Se paso para table columns
    removeColumn(column: any, col: any){
        let newHeader : any = []
            column.forEach((el: { key: any; }) =>{
                if (el.key !== col.key){
                    newHeader.push(el)
                }
            })
        return newHeader
    }

    getPreviousOrNextColumn(col: any, headers : any, next: boolean){ // Retorna la columna previa o siguiente a la seleccionada
        let column = {children:[]}
        for (var i=0;i<headers.length;i++){    
            if (headers[i] === col) {
                if (next) column = headers[i+1]
                break
            }
            if (!next) column = headers[i];
        }
        return column
    }

    getFirstColumnChildIndex(column: any){
        let lastIndex : any = undefined;
            for (var i=0;i<this.headers2.length;i++){
                column.children.forEach((element: {key: any;}) => {
                    if (element.key === this.headers2[i].key){                  
                        if (lastIndex === undefined || i < lastIndex){
                            lastIndex = i;
                        }
                    }
                });
            }
        return lastIndex;
    }

    moveHeaderPrimaryChilds(col: any, direction: string){
        if (direction === 'left'){
            let headerSecondary = this.headers2;
            let previousColumn = this.getPreviousOrNextColumn(col,this.headers1,false); // Retorna la columna anterior
            let previousColumnLastIndex = this.getFirstColumnChildIndex(previousColumn) // Retorna el index del primer hijo de una columna dada 
            // El siguiente fragmento de código mueve las columnas hijas hacia la izquierda
            for (var j=0;j<col.children.length;j++){  // Recorre los hijos de la columna
                let columnFind = headerSecondary.find(el => el.key === col.children[j].key) // Busca en el header principal el hijo correspondiente a la columna actual 
                if (columnFind) {
                       headerSecondary = headerSecondary.filter(el => el.key !== columnFind.key) // Se elimina del header principal el hijo correspondiente a la columna actual
                       headerSecondary.splice(previousColumnLastIndex,0,columnFind); // // Añade el hijo correspondiente al header principal en el index deseado.
                       previousColumnLastIndex++;
                    
                }
            }
            return headerSecondary;
        }
        else if (direction === 'right'){  
            let nextColumn = this.getPreviousOrNextColumn(col,this.headers1,true); // Retorna la columna siguiente
            let newColumns = []
            let oldColumns = []
            let stop = false;
            let totalChilds = 0;
            for (var column in this.headers2){
                if (this.headers2[column].parent === col.key && !this.headers2[column].pined) {
                    stop = true
                    newColumns.push(this.headers2[column])}
                else {
                    if (!stop) totalChilds ++;
                    oldColumns.push(this.headers2[column]);
                }    
            }
            totalChilds = totalChilds + nextColumn.children.length 
            for (var column in newColumns){
                    oldColumns.splice(totalChilds,0,newColumns[column])
                    totalChilds++;
            }
            return oldColumns
        }
        
    }

/* Chequea si la columna puede moverse de posición a la derecha o izquierda */
    canColumnMove(col: any, direction: string){ // Indica si la columna hija puede o no puede moverse a la izquierda o derecha
        let key = col['key']; // Retorna el nombre de la columna
        let childrenIndex = -1;
        let totalChildren = 0;
        let currentChildrenSize = 0;
        if (col.key === 'pin') return false
        else if (!col.children){
            if (this.headers1.length > 0){ // Si existe el header primario
                for (var i=0;i<this.headers1.length;i++){ // Se recorre al header primario
                    if (this.headers1[i].children){
                        let childrenExist = this.headers1[i].children.find((el: { key: any; }) => el.key === key); // Busco un padre que tenga el hijo actual
                        totalChildren = totalChildren + this.headers1[i].children.length; // Se acumulan la cantidad de hijos que existen hasta la columna actual
                        if (childrenExist){  // Cuando se llega al padre del hijo actual
                            currentChildrenSize = this.headers1[i].children.length; // Cantidad de hijos que tiene el padre del hijo actual       
                            childrenIndex = this.headers2.findIndex(el => el.key === key); // Halla el index del hijo actual en el header secundario
                            break
                        }
                    }
                    else return true;
                }
                if ( direction === 'right' && ((childrenIndex + 1) < totalChildren)) return true
                else if (direction === 'left' && ((totalChildren - currentChildrenSize) < childrenIndex)) return true
                else return false
            }
            else {
               return this.onlyOneHeaderCanColumnMove(this.headers2,direction)
            }
        }
        else {
           return this.onlyOneHeaderCanColumnMove(this.headers1,direction)
        }
        
    }

    onlyOneHeaderCanColumnMove(header: Array<any>, direction: string){
        let index = this.getColumnIndex(header);
        if ((index !== 0) && (direction === 'left')) return true
        else if (((index + 1) !== header.length) && (direction === 'right')) return true
        else return false
    }
/* FINAL Chequea si la columna puede moverse de posición a la derecha o izquierda */

  changeModalStatus(newVal: boolean){
        this.showAddColumnModal = newVal;
    }


}
</script>


<style scoped lang="scss">
 
</style>
