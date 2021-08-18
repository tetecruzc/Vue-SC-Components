<template>
  <div class="w-100 d-flex flex-column justify-content-center">
    <b-row  v-if="getItems.length > 0">
        <Table itemsId='id' @showButtonModal="showButtonModal" :standarts="getStandarts" :views="views" :editable="true"  :header1="getFields.headerPrimary" :header2="getFields.headerSecondary"  :currentViewHeaderPrimary="currentView.headerPrimary" :currentViewHeaderSecondary="currentView.headerSecondary" :items="itemsWithActions" :perPage="perPage" :currentFilter="currentFilter" :currentOrderFilter="currentOrderFilter" :textFilter="textFilter" />            
    </b-row>
    <div v-else class="w-100 d-flex justify-content-center"><b-spinner class="my-4"></b-spinner> </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import Table from '@/components/dynamic-table/Table.vue';
//import Box from '../components/utilities/Box.vue';
//import FormTag from '../components/utilities/FormTag.vue';

@Component(
  {  
    components: {
        Table,
    },    
  }
)
export default class PruebaTabla extends Vue {
    perPage : number = 20;
    textFilter : string = ''
    currentFilter : any = {}
    currentOrderFilter : Array<any> = []
    currentView : any = []
    headerFilters: Array<any> = []
    editable: boolean = true;
    showCreateView: boolean = false;
    newViewName: string = '';
    selectedItemId : any = '';
    itemsWithActions : Array<any> = [];

    async created(){
       // await this.llamadaAlStore();
        this.resetItems();
    }

    async resetItems(){
        this.currentView = this.getViews[0];
        this.headerFilters = this.getViews[0].headerSecondary;
        this.currentFilter = this.headerFilters[0];
        this.itemsWithActions = this.getItems;     
        /* Si desea poder añadir acciones a la primera vista */
        // this.addActionsToItems(this.itemsWithActions);
        // if (!this.currentView.headerPrimary.find((el: { key: string; }) => el.key === 'actionParent')){
        //    this.currentView.headerPrimary.push({name: 'Acciones', key:'actionParent', children:[{key:'actions'}]})
        //    this.currentView.headerSecondary.push({name: '', key:'actions', parent:'actionParent'})
        // }
    }




    /* Cambiar según la lógica */
    addActionsToItems(items: any){
        items.forEach((el: { actions: { key: string; icon: string; name: string; }[]; }) =>{
            el.actions = [{key: 'edit',icon: 'pencil', name: 'Editar solicitud'}]
        })
    }


    /* Manipular dependiendo de la cantidad de acciones que tenga la tabla */
    showButtonModal(obj: any){
        this.selectedItemId = obj.itemId;
        if (obj.actionKey === 'edit') window.alert('EDITAR '+this.selectedItemId)
        if (obj.actionKey === 'block') window.alert('BLOQUEAR '+this.selectedItemId)
    }



    /* VISTAS */

    // get views(){
    //     return this.getViews;
    // }

    // changeView(view : any, index: any) {
    //     if (index === 0) this.editable = false;
    //     else this.editable = true;
    //     this.currentView = view;
    //     for (let i in this.currentView.headerSecondary){ 
    //         this.currentView.headerSecondary[i].shown = true;
    //     }
    //     this.headerFilters = view.headerSecondary;
    //     // Si la tabla tiene acciones añadir las siguientes lineas de código
    //     if (!this.currentView.headerPrimary.find((el: { key: string; }) => el.key === 'actionParent') && index !== 0){
    //        this.currentView.headerPrimary.push({name: 'Acciones', key:'actionParent', children:[{key:'actions'}]})
    //        this.currentView.headerSecondary.push({name: '', key:'actions', parent:'actionParent'})
    //     }
    // }

    // removeView(view: any){
    //     console.log('Eliminando vista')
    // }

    //     createNewView(){
    //     let views : any = this.getViews;
    //     let newView = this.getFields;
    //     newView.name = this.newViewName;
    //     views.push(newView);
    //     this.saveRequestView(views); 
    //     this.newViewName = '';
    //    // this.currentView = newView;
    //     this.showCreateView = false;
    // }

    // async saveView(){
    //     let userId : number = 1;
    //    // await this.saveRequestView(userId,this.headerFilters)
    // }

    /* FINAL VISTAS */
    
    /* SIMULANDO STORE*/
    get getItems(){
        return  [
                {
                    "headerS1": "3123123",
                    "headerS2": "Limpio"
                },
                {
                    "headerS1": "3123123",
                    "headerS2": "Sucio"
                },
                {
                    "headerS1": "3123123",
                    "headerS2": "Mojado"
                }
            ]
    }

    get getStandarts() {
        return []
    }

    get getViews(){
       return  [{
                "name": 'Vista original',
                "headerPrimary": [
                    // {
                    //     "name": "Prueba header 1",
                    //     "key": "test",
                    //     "children": [
                    //         {
                    //             "key": "headerS1"
                    //         },
                    //         {
                    //             "key": "headerS2"
                    //         }
                    //     ]
                    // },
                ],
                "headerSecondary": [
                        {
                            "name": "Header 2.1",
                            "key": "headerS1",
                            "parent": null,
                            "shown": true
                        },
                        {
                            "name": "Header 2.2",
                            "key": "headerS2",
                            "parent": null,
                            "shown": true
                        },
            
                ]
            }]
    }

    get getFields(){
        return {
                "name": 'Vista original',
                "headerPrimary": [
                    // {
                    //     "name": "Prueba header 1",
                    //     "key": "test",
                    //     "children": [
                    //         {
                    //             "key": "headerS1"
                    //         },
                    //         {
                    //             "key": "headerS2"
                    //         }
                    //     ]
                    // },
                ],
                "headerSecondary": [
                        {
                            "name": "Header 2.1",
                            "key": "headerS1",
                            "parent": null,
                            "shown": true
                        },
                        {
                            "name": "Header 2.2",
                            "key": "headerS2",
                            "parent": null,
                            "shown": true
                        },
            
                ]
            }
    }


    // @requests.Action(RequestsMethods.actions.FETCH_ALL_REQUESTS)
    //     fetchRequests!: (data: any) => Promise<boolean>;

    // @requests.Action(RequestsMethods.actions.SAVE_REQUEST_VIEW)
    //     saveRequestView!: (views: any) => boolean;   // Requests Type  // Pasar id del usuario?   
    // @requests.Getter(RequestsMethods.getters.GET_ITEMS)
    //     getItems!: Array<any>;
    // @requests.Getter(RequestsMethods.getters.GET_STANDARTS)
    //     getStandarts!: Array<any>;

    // @requests.Getter(RequestsMethods.getters.GET_VIEWS)
    //     getViews!: Array<any>;
    // @requests.Getter(RequestsMethods.getters.GET_FIELDS)
    //     getFields!: any;

}

</script>



<style scoped>

</style>