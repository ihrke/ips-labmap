
/* EXCEL RELATED FUNCTIONS */

/* Copied from read example at https://github.com/SheetJS/js-xlsx and made into a promise object */
function readExcelFile(url){
    return fetch(url).then(function(res) {
    if(!res.ok) throw new Error("fetch failed");
    return res.blob();
    }).then(function(blob) {
        return new Promise( (resolve) => {
            var reader = new FileReader();
            reader.addEventListener("loadend", function() {
                var data = new Uint8Array(this.result);
                var wb = XLSX.read(data, {type:"array"});
                //process_wb(wb);
                resolve(wb);
            });
            reader.readAsArrayBuffer(blob);
        });
    });
}

// A custom class for more easily exposing functions working on a single Excel Sheet object
class ExcelSheet {
    constructor (sheet){
        this.sheet = sheet;
    }


    // Input: range like "A1:F5"
    // makes an object of each row, with values corresponding to each column
    // If headers is false or Array, use entire range as data values.
    // If not, default to using first row as header keys

    getRangeAsJSON(range, headers = true){
        var customHeaderKeys = false;

        if( headers instanceof Array ){
            customHeaderKeys = headers;
        }

        /* Create a json like:
        [
            [A1, A2, A3],
            [B1, B2, B3],
            [C1, C2, C3],
        ]
        */
        var json = XLSX.utils.sheet_to_json( this.sheet, {range: range, blankrows: true, header: 1, defVal: null});

        /* Now transform this into json objects, using the first row as keys or use custom headers
            [
                {A1: B1, A2: B2, A3: B3},
                {A1: C1, A2: C2, A3: C3},
            ]
        */

        let headerKeys = false;
        if( headers && !customHeaderKeys){
            headerKeys = json.splice(0,1)[0];
        }else{
            headerKeys = customHeaderKeys;
        }

        // Remove the first item and keep it as keys or use an array if specified

        var resultArray = json.map( (rowValues) => {
            var obj = {};

            rowValues.map( (value, index) => {
                let key = headerKeys && headerKeys[index] || "value"+index;
                obj[ key ] = value;
            });

            return obj;
        })

        return resultArray;

    }

}
