
/* Ordena el header secundario con respecto al header primario */
export function orderHeaderSecondary(headerPrimary: Array<any>, headerSecondary: any){ 
    let orderedHeaderSecondary: Array<any> = [];
    if (headerPrimary.length > 0){  // Si existe un header primario
        let pinedColumn : any = headerSecondary.find((el: { pined: any; }) => el.pined === true)
        if (pinedColumn) orderedHeaderSecondary.push(pinedColumn);
        headerPrimary.forEach((el: { children: any[]; }) =>{
                if (el.children){
                        el.children.forEach((children: any)  =>{
                                let element = headerSecondary.find((header: { key: any; pined: boolean}) => header.key === children.key && !header.pined)
                                if (element) orderedHeaderSecondary.push(element)
                        })  
                }
        })
     }
     else orderedHeaderSecondary = headerSecondary; 
    return orderedHeaderSecondary;
}


export function existingPinedColumn(header: any): boolean{
        let found = header.find((el: { pined: boolean;}) => el.pined === true)
        if (found) return true
        else return false
}

export function getPinedColumn(header: any): any {
        return header.find((el: { pined: boolean;}) => el.pined === true)       
}

export function addPinedColumnInPrimaryHeader(child: any, headerPrimary: any){
        child.pined = true;
        let object ={
                "name": 'Pined',
                "key": 'pin',
                "shown": true,
                "children": [
                    child
                ]
        }
        headerPrimary.unshift(object);
        return headerPrimary
}

export function removeColumn(column: any, col: any){
        let newHeader : any = []
            column.forEach((el: { key: any; }) =>{
                if (el.key !== col.key){
                    newHeader.push(el)
                }
            })
        return newHeader
}

export function removeColumnChild(headerPrimary: any, parent: any, child: any){ // Retorna el header sin el hijo pasado por parámetro
        let newParentChilds = removeColumn(parent.children, child); // Retorna los nuevos hijos de la columna padre
        let newHeaderPrimary = headerPrimary;
        newHeaderPrimary.forEach( (el: { key: any; children: any; }) =>{ 
            if (el.key === parent.key) el.children = newParentChilds;
        })
        return newHeaderPrimary;
}


export function keySort (keys : any, object: any) : any{
  
        keys = keys || {};
     
        var obLen = function(obj : any) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key))
                    size++;
            }
            return size;
        };
    
  
        var obIx = function(obj : any, ix: any) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (size == ix)
                        return key;
                    size++;
                }
            }
            return false;
        };
    
        var keySort = function(a : any, b: any, d: any) {
            d = d !== null ? d : 1;
            // a = a.toLowerCase(); // this breaks numbers
            // b = b.toLowerCase();
            if (a == b)
                return 0;
            return a > b ? 1 * d : -1 * d;
        };
    
        var KL = obLen(keys);
    
        if (!KL) return object.sort(keySort);
    
        for ( var k in keys) {
            // asc unless desc or skip
            keys[k] = 
                    keys[k] == 'desc' || keys[k] == -1  ? -1 
                  : (keys[k] == 'skip' || keys[k] === 0 ? 0 
                  : 1);
        }
    
        object.sort(function(a: any, b: any) {
            var sorted = 0, ix = 0;
    
            while (sorted === 0 && ix < KL) {
                var k = obIx(keys, ix);
                if (k) {
                    var dir = keys[k];
                    sorted = keySort(a[k], b[k], dir);
                    ix++;
                }
            }
            return sorted;
        });
        return object;
    };
    